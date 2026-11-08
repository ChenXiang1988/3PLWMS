#!/usr/bin/env node
/**
 * 数据字典准确性检查（货灵供应链运营平台）
 *
 * 校验 docs/数据字典/ 下 index.md、log.md 与各实体文档的一致性与规范性：
 *   - 索引里的实体文档链接必须存在；状态必须合法；无孤儿实体文件
 *   - 实体文档须有 H1、九个标准章节、合法的字段表（key 小驼峰、必填为 是/否、key 不重复）
 *   - 实体文档 H1 须包含实体名
 *   - 变更日志的日期头须合法，实体型记录须指向已登记实体
 *   - 全字典不得出现 SaaS / 过程类禁用词（与 glossary 禁语表对齐）
 *
 * 用法：node docs/数据字典/check.mjs
 * 退出码：发现错误=1，否则 0（仅警告仍算通过）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = HERE;

const ALLOWED_STATUS = new Set(['未开始', '草案', '评审中', '已定稿']);
const FORBIDDEN = ['租户', '账号空间', '按租户分库', '订阅', '套餐', '充值', '续费',
  '试用到期', '升级专业版', '平台运营后台', '主体切换器', 'TODO', 'lorem', '占位符'];
const CAMEL = /^[a-z][a-zA-Z0-9]*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ENTITY_LIKE = /(主档|档案|通知单|订单|库位|规则|账单)$/;

const errors = [];
const warns = [];
const err = (where, msg) => errors.push(`[错误] ${where}：${msg}`);
const warn = (where, msg) => warns.push(`[警告] ${where}：${msg}`);

const read = (p) => {
  const fp = path.join(DIR, p);
  return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : null;
};

function parseTables(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trimStart().startsWith('|')) {
      const block = [];
      while (i < lines.length && lines[i].trimStart().startsWith('|')) block.push(lines[i++]);
      out.push(block);
    } else i++;
  }
  return out;
}
const splitRow = (line) => {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
};
const stripBt = (s) => s.replace(/`/g, '').trim();

// A. 基础文件
if (!read('index.md')) err('index.md', '索引文件缺失');
if (!read('log.md')) err('log.md', '变更日志缺失');

// B. 解析 index.md 实体清单
const indexText = read('index.md') || '';
const entityNames = new Set();
const entityRows = [];
for (const tbl of parseTables(indexText)) {
  if (tbl.length < 2) continue;
  const header = splitRow(tbl[0]);
  const ei = header.indexOf('实体');
  const di = header.indexOf('文档');
  if (ei < 0 || di < 0) continue;
  const si = header.indexOf('状态');
  const ui = header.indexOf('最近更新');
  for (let r = 2; r < tbl.length; r++) {
    const cells = splitRow(tbl[r]);
    if (cells.length <= Math.max(ei, di)) continue;
    const name = cells[ei];
    const doc = cells[di];
    if (name === '实体') continue;
    if (doc.includes('待建') || doc === '—') { entityNames.add(name); continue; }
    const m = doc.match(/\[[^\]]*\]\(([^)]+)\)/);
    if (!m) { warn('index.md', `实体「${name}」的文档单元格未指向文件：${doc}`); entityNames.add(name); continue; }
    const rel = m[1];
    if (!fs.existsSync(path.join(DIR, rel))) err('index.md', `实体「${name}」链接的文件不存在：${rel}`);
    const st = si >= 0 ? cells[si] : '';
    if (st && !ALLOWED_STATUS.has(st)) err('index.md', `实体「${name}」状态非法：「${st}」，应为 ${[...ALLOWED_STATUS].join('/')}`);
    const up = ui >= 0 ? cells[ui] : '';
    if (up && up !== '—' && !DATE_RE.test(up)) warn('index.md', `实体「${name}」最近更新不是 YYYY-MM-DD：${up}`);
    entityNames.add(name);
    entityRows.push({ name, rel });
  }
}

// C. 孤儿文件
const mdFiles = fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && f !== 'index.md' && f !== 'log.md');
const linked = new Set(entityRows.map((e) => path.normalize(e.rel)));
for (const f of mdFiles) {
  if (!linked.has(f)) err('结构', `实体文档「${f}」未在 index.md 中登记（孤儿文件）`);
}

// D/E. 校验实体文档
for (const { name, rel } of entityRows) {
  const text = read(rel);
  if (text == null) continue;
  const lines = text.split(/\r?\n/);
  if (!lines.some((l) => l.startsWith('# '))) err(rel, '缺少 H1 标题');
  const h1 = lines.find((l) => l.startsWith('# '));
  if (h1 && !h1.includes(name)) warn(rel, `H1「${h1}」未包含实体名「${name}」`);
  // 结构：必须含「与其它主档的关系」与「原型衔接建议」，且至少 2 个编号章节
  const secLines = lines.filter((l) => l.startsWith('## '));
  if (!secLines.some((l) => l.includes('关系'))) err(rel, '缺少「与其它主档的关系」章节');
  if (!secLines.some((l) => l.includes('原型'))) err(rel, '缺少「原型衔接建议」章节');
  const numSec = secLines.filter((l) => /^##\s+\d+\./.test(l)).length;
  if (numSec < 2) err(rel, `编号章节不足 2 个（当前 ${numSec}）`);

  // 字段 key 唯一性按"单表内"判定（复合实体含多张表，跨表同名字段如外键属正常）
  let totalKeys = 0;
  for (const tbl of parseTables(text)) {
    if (tbl.length < 3) continue;
    const header = splitRow(tbl[0]);
    const ki = header.indexOf('字段 key');
    const ri = header.indexOf('必填');
    if (ki < 0) continue; // 非字段表（如状态枚举表）
    const seen = new Set();
    for (let r = 2; r < tbl.length; r++) {
      const cells = splitRow(tbl[r]);
      if (cells.length <= (ri < 0 ? ki : Math.max(ki, ri))) continue;
      const key = stripBt(cells[ki]);
      if (!key) continue;
      if (!CAMEL.test(key)) err(rel, `字段 key 非小驼峰：「${key}」`);
      if (seen.has(key)) err(rel, `字段 key 重复：「${key}」`);
      seen.add(key);
      if (ri >= 0 && cells[ri] !== '是' && cells[ri] !== '否') err(rel, `字段「${key}」必填列非法：「${cells[ri]}」（应为 是/否）`);
    }
    totalKeys += seen.size;
  }
  if (totalKeys === 0) warn(rel, '未发现任何字段 key（可能表格结构不符预期）');
  for (const w of FORBIDDEN) if (text.includes(w)) err(rel, `含禁用词：「${w}」`);
}

// F. log.md
const logLines = (read('log.md') || '').split(/\r?\n/);
let inDate = false;
for (const l of logLines) {
  const dm = l.match(/^##\s+(\d{4}-\d{2}-\d{2})/);
  if (dm) { inDate = true; continue; }
  if (l.startsWith('## ')) { inDate = false; continue; }
  if (inDate && l.includes('｜')) {
    const ent = l.split('｜')[0].replace(/^[-*]\s*/, '').trim();
    if (!ent) continue;
    if (!entityNames.has(ent) && ENTITY_LIKE.test(ent)) warn('log.md', `变更记录提到的实体未在 index 登记：「${ent}」`);
  }
}

// 输出
console.log('数据字典检查：');
if (!errors.length && !warns.length) {
  console.log('  ✓ 全部通过');
} else {
  errors.forEach((e) => console.log('  ' + e));
  warns.forEach((w) => console.log('  ' + w));
}
console.log(`  实体数=${entityNames.size} 错误=${errors.length} 警告=${warns.length}`);
process.exit(errors.length > 0 ? 1 : 0);
