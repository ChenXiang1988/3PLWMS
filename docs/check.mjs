#!/usr/bin/env node
/**
 * 文档体系检查（货灵供应链运营平台）
 *
 * 校验 docs/ 的存放、分类、索引闭环与日志分片规则（规则见 docs/index.md）：
 *   - 顶层 index.md / log.md 存在，index 含必需章节
 *   - 文档必须归入分类文件夹，docs/ 根目录不放散文档
 *   - index「分类与文档」表：状态与日期合法、链接文件存在、分类名与路径一致、无孤儿文档
 *   - 自带 index.md 的分类（如 数据字典/）由分类索引自管，顶层只校验入口已登记
 *   - 每个 log.md：归档索引表、日期分节、记录类型与段数、跨月/条数/体积超限、归档文件与索引双向闭环
 * 不做内容级禁语校验，由 docs/数据字典/check.mjs 负责。
 *
 * 用法：node docs/check.mjs
 * 退出码：发现错误=1，否则 0（仅警告仍算通过）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;
const ALLOWED_STATUS = new Set(['未开始', '草案', '评审中', '已定稿']);
const MAX_RECORDS = 200;
const MAX_BYTES = 100 * 1024;
const ARCHIVE_NAME = /^\d{4}-\d{2}(-\d+)?\.md$/;

const errors = [];
const warns = [];
const err = (where, msg) => errors.push(`[错误] ${where}：${msg}`);
const warn = (where, msg) => warns.push(`[警告] ${where}：${msg}`);

const abs = (rel) => path.join(DIR, rel);
const read = (rel) => fs.existsSync(abs(rel)) ? fs.readFileSync(abs(rel), 'utf8') : null;
const exists = (rel) => fs.existsSync(abs(rel));
const isDir = (rel) => { try { return fs.statSync(abs(rel)).isDirectory(); } catch { return false; } };
const relOf = (rel) => rel.split(path.sep).join('/');

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
function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((c) => c.trim());
}
function linkOf(cell) {
  const m = cell.match(/\[[^\]]*\]\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}
function strip(cell) { return cell.replace(/`/g, '').trim(); }
function findTable(tables, ...headers) {
  return tables.find((t) => {
    const h = splitRow(t[0]);
    return headers.every((x) => h.includes(x));
  }) || null;
}
function dataRows(tbl) {
  if (!tbl) return [];
  const h = splitRow(tbl[0]);
  return tbl.slice(2).map((line) => {
    const cells = splitRow(line);
    const row = {};
    h.forEach((k, i) => { row[k] = cells[i] ?? ''; });
    return row;
  });
}

// A. 基础文件与章节
const indexText = read('index.md');
if (indexText == null) err('index.md', '总索引缺失');
if (read('log.md') == null) err('log.md', '变更日志缺失');
for (const sec of ['使用规则', '日志管理', '分类与文档']) {
  if (indexText && !indexText.includes(`## ${sec}`)) err('index.md', `缺少必需章节「${sec}」`);
}

// B. 总索引表：链接闭环、状态、日期、分类与路径一致
const rows = dataRows(findTable(parseTables(indexText || ''), '分类', '文档'));
if (!rows.length) err('index.md', '「分类与文档」表为空');
const linkedDocs = new Set();
const registeredCats = new Set();
for (const r of rows) {
  const cat = r['分类'];
  const docCell = r['文档'] || '';
  const link = linkOf(docCell);
  if (!link) { err('index.md', `文档「${cat}」未用链接指向文件：${docCell}`); continue; }
  const rel = relOf(link);
  if (!exists(rel)) { err('index.md', `链接文件不存在：${rel}`); continue; }
  linkedDocs.add(rel);
  registeredCats.add(cat);
  const parts = rel.split('/');
  if (parts.length < 2 || parts[0] !== cat) err('index.md', `分类「${cat}」与文档路径不一致：${rel}`);
  const st = r['状态'] || '';
  if (st && !ALLOWED_STATUS.has(st)) err('index.md', `「${rel}」状态非法：${st}`);
  const up = r['最近更新'] || '';
  if (up && up !== '—' && !DATE_RE.test(up)) err('index.md', `「${rel}」最近更新不是 YYYY-MM-DD：${up}`);
}

// C. 分类目录与孤儿文档
const topEntries = fs.readdirSync(DIR, { withFileTypes: true });
for (const e of topEntries) {
  if (e.isFile() && e.name.endsWith('.md') && e.name !== 'index.md' && e.name !== 'log.md') {
    err('结构', `文档未归入分类文件夹：${e.name}`);
  }
}
const cats = topEntries
  .filter((e) => e.isDirectory() && e.name !== 'log' && !e.name.startsWith('.'))
  .map((e) => e.name);
const logFiles = ['log.md'];
for (const cat of cats) {
  const files = fs.readdirSync(abs(cat)).filter((f) => f.endsWith('.md'));
  if (files.includes('log.md')) logFiles.push(`${cat}/log.md`);
  const selfManaged = files.includes('index.md');
  if (selfManaged) {
    const hasEntry = [...linkedDocs].some((rel) => rel.startsWith(`${cat}/`));
    if (!hasEntry) err('结构', `分类「${cat}」自带索引，但顶层 index.md 未登记其入口`);
  } else {
    for (const f of files) {
      const rel = `${cat}/${f}`;
      if (!linkedDocs.has(rel)) err('结构', `文档未在 index.md 登记（孤儿文件）：${rel}`);
    }
    if (!registeredCats.has(cat)) warn('结构', `分类「${cat}」未在顶层索引出现`);
  }
}

// D. 日志：归档索引、记录格式、膨胀与双向闭环
let totalRecords = 0;
let totalArchives = 0;
for (const logRel of logFiles) {
  const text = read(logRel);
  if (text == null) { err(logRel, '日志文件缺失'); continue; }
  const where = logRel;
  const tables = parseTables(text);
  const types = new Set(
    (text.match(/类型[（(]([^）)]+)[）)]/)?.[1] || '')
      .split(/[/、|]/).map((s) => s.trim()).filter(Boolean)
  );
  if (!types.size) err(where, '格式行未声明类型枚举');

  const arcTbl = findTable(tables, '归档文件', '覆盖时段');
  if (!arcTbl) err(where, '缺少归档索引表（表头：归档文件 / 覆盖时段 / 条目数 / 归档日期）');
  const logDir = path.dirname(logRel);
  const arcDirRel = logDir === '.' ? 'log' : `${relOf(logDir)}/log`;
  const indexed = new Set();
  for (const r of dataRows(arcTbl)) {
    const cell = r['归档文件'] || '';
    if (!cell || cell.includes('暂无') || cell === '—') continue;
    const rel = relOf(strip(linkOf(cell) || cell));
    const base = path.basename(rel);
    if (!ARCHIVE_NAME.test(base)) err(where, `归档文件名不符合 YYYY-MM.md：${base}`);
    indexed.add(base);
    const full = rel.includes('/') ? rel : `${arcDirRel}/${base}`;
    if (!exists(full)) err(where, `归档索引登记的文件不存在：${full}`);
    const span = strip(r['覆盖时段'] || '').split('~')[0].trim();
    if (!MONTH_RE.test(span)) err(where, `覆盖时段格式应为 YYYY-MM：${span}`);
    const cnt = strip(r['条目数'] || '');
    if (cnt && !/^\d+$/.test(cnt)) warn(where, `归档条目数不是数字：${cnt}`);
    const ad = strip(r['归档日期'] || '');
    if (ad && !DATE_RE.test(ad)) err(where, `归档日期不是 YYYY-MM-DD：${ad}`);
    totalArchives++;
  }
  if (isDir(arcDirRel)) {
    for (const f of fs.readdirSync(abs(arcDirRel)).filter((x) => x.endsWith('.md'))) {
      if (!ARCHIVE_NAME.test(f)) err(where, `归档文件名不符合 YYYY-MM.md：${f}`);
      if (!indexed.has(f)) err(where, `归档文件未登记到归档索引：${f}`);
    }
  }

  const months = new Set();
  let inDate = false;
  let records = 0;
  for (const line of text.split(/\r?\n/)) {
    // 允许「## 2026-11-06（续）」这类同日续写分节，口径与 docs/数据字典/check.mjs 对齐
    const dm = line.match(/^##\s+(\d{4}-\d{2}-\d{2})(?:\s*[（(][^）)]*[）)])?\s*$/);
    if (dm) { inDate = true; months.add(dm[1].slice(0, 7)); continue; }
    if (line.startsWith('## ')) { inDate = false; continue; }
    if (!inDate || !/^[-*]\s/.test(line) || !line.includes('｜')) continue;
    records++;
    const segs = line.replace(/^[-*]\s*/, '').split('｜').map((s) => s.trim());
    if (segs.length < 4) { err(where, `记录不足 4 段（分类/文档｜类型｜摘要｜原因）：${line.trim()}`); continue; }
    if (types.size && !types.has(segs[1])) err(where, `记录类型「${segs[1]}」不在格式声明内：${[...types].join('/')}`);
    if (segs[0].endsWith('.md') && segs[0].includes('/') && !linkedDocs.has(relOf(segs[0]))) {
      err(where, `记录引用的文档未在 index.md 登记：${segs[0]}`);
    }
  }
  totalRecords += records;
  if (months.size > 1) err(where, `活跃日志跨月未归档：${[...months].join('、')}`);
  if (records > MAX_RECORDS) err(where, `活跃记录 ${records} 条超过 ${MAX_RECORDS} 条，应归档`);
  if (Buffer.byteLength(text, 'utf8') > MAX_BYTES) err(where, `活跃日志超过 ${MAX_BYTES / 1024} KB，应归档`);
}

console.log('文档体系检查：');
if (!errors.length && !warns.length) console.log('  ✓ 全部通过');
else { errors.forEach((e) => console.log('  ' + e)); warns.forEach((w) => console.log('  ' + w)); }
console.log(`  分类=${cats.length} 登记文档=${rows.length} 日志=${logFiles.length} 活跃记录=${totalRecords} 归档=${totalArchives} 错误=${errors.length} 警告=${warns.length}`);
process.exit(errors.length ? 1 : 0);
