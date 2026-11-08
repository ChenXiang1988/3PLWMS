#!/usr/bin/env node
/**
 * 调研报告结构校验（research-report skill）
 *
 * 只做机械可判定的检查：八节是否齐、章节是否空、封面是否全、来源表与结论表是否合规、
 * 截图索引与图片是否对得上、是否残留填写指引、是否出现空话词。
 * 语义质量（论据是否成立、结论是否成立）脚本判不了，交给 references/chapter-guide.md。
 *
 * 用法：
 *   node check-report.mjs <报告.html>
 *   node check-report.mjs <报告.html> --fix     打印补齐建议，可直接粘贴
 *   node check-report.mjs <报告.html> --json    输出 JSON
 *   node check-report.mjs --help
 *
 * 退出码：0 通过（可含警告）/ 1 有错误 / 2 文件或参数错误
 */
import fs from 'node:fs';
import path from 'node:path';

const SECTIONS = ['口径与证据', '覆盖清单', '逐页记录', '术语对照', '横向对比', '结论与落点', '缺项', '截图索引'];
const JUDGEMENTS = ['可借鉴', '不跟随', '待定'];
const MIN_BODY = 20;
const BANNED = [
  '综上所述', '具有重要意义', '奠定坚实基础', '为后续奠定', '赋能', '抓手',
  '全面提升', '持续优化', '深度融合', '无缝对接', '全方位', '多维度赋能',
];

const errors = [];
const warns = [];
const err = (code, msg, fix) => errors.push({ code, msg, fix });
const warn = (code, msg, fix) => warns.push({ code, msg, fix });

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const file = argv.find((a) => !a.startsWith('--'));

if (flags.has('--help') || !file) {
  console.log(`调研报告结构校验（只支持 HTML）

用法：node check-report.mjs <报告.html> [--fix] [--json]

检查项：
  E1 八节齐全且有序      E2 章节非空          E3 封面与一句话结论
  E4 对象表可复核        E5 结论可判定        E6 截图与图片路径
  W1 指引与占位符残留    W2 空话词            W3 逐页记录与横向对比有数据

退出码：0 通过 / 1 有错误 / 2 文件或参数错误`);
  process.exit(file ? 0 : 2);
}

if (!fs.existsSync(file)) {
  console.error(`[错误] 文件不存在：${file}`);
  process.exit(2);
}
if (!/\.html?$/i.test(file)) {
  console.error(`[错误] 只校验 HTML 报告，当前传入：${file}`);
  process.exit(2);
}

const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
if (!raw.trim()) {
  console.error(`[错误] 文件为空：${file}`);
  process.exit(2);
}

const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
const stripPlaceholders = (s) => s.replace(/\{\{[\s\S]*?\}\}/g, '');
const stripTags = (s) => s.replace(/<[^>]+>/g, ' ');
const textOf = (s) => stripTags(stripPlaceholders(stripComments(s))).replace(/\s+/g, ' ').trim();
const normTitle = (t) => t.replace(/^\s*\d+\s*[.、．]?\s*/, '').trim();

const body = stripComments(raw);

// ---------- 章节切分 ----------
const marks = [];
const h2re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
let hit;
while ((hit = h2re.exec(body))) marks.push({ title: textOf(hit[1]), start: hit.index, end: h2re.lastIndex });
const chapters = marks.map((x, i) => ({
  title: x.title,
  body: body.slice(x.end, i + 1 < marks.length ? marks[i + 1].start : body.length),
}));
const findChapter = (name) => chapters.find((c) => normTitle(c.title) === name);

function tablesIn(block) {
  const out = [];
  const re = /<table[\s\S]*?<\/table>/gi;
  let m;
  while ((m = re.exec(block))) {
    const t = m[0];
    const headers = [...t.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((x) => textOf(x[1]));
    const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
      .map((r) => [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => textOf(c[1])))
      .filter((cells) => cells.length > 0);
    out.push({ headers, rows });
  }
  return out;
}

// ---------- E1 八节齐全且有序 ----------
const positions = [];
SECTIONS.forEach((name) => {
  const idx = chapters.findIndex((c) => normTitle(c.title) === name);
  if (idx === -1) err('E1', `缺少「${name}」节`, `<h2 id="s${SECTIONS.indexOf(name) + 1}"><span class="num">${SECTIONS.indexOf(name) + 1}</span> ${name}</h2>`);
  else positions.push({ name, idx });
});
for (let i = 1; i < positions.length; i++) {
  if (positions[i].idx < positions[i - 1].idx) {
    err('E1', `章节顺序错误：「${positions[i].name}」出现在「${positions[i - 1].name}」之前`, `按模板顺序重排：${SECTIONS.join(' → ')}`);
  }
}

// ---------- E2 章节非空 ----------
for (const name of SECTIONS) {
  const c = findChapter(name);
  if (!c) continue;
  const len = textOf(c.body).replace(/\s/g, '').length;
  if (len < MIN_BODY) {
    err('E2', `「${name}」正文不足 ${MIN_BODY} 字（当前 ${len}）`, `「${name}」至少写清：<要点一> / <要点二> / <要点三>`);
  }
}

// ---------- E3 封面与一句话结论 ----------
const firstH2 = marks.length ? marks[0].start : body.length;
const cover = body.slice(0, firstH2);
for (const key of ['日期', '状态', '版本', '作者', '报告对象']) {
  if (!textOf(cover).includes(key)) err('E3', `封面缺少「${key}」`, `<span><b>${key}</b>{{填写}}</span>`);
}
const subMatch = cover.match(/<p[^>]*class="[^"]*\bsub\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
const sub = subMatch ? textOf(subMatch[1]) : '';
if (!sub) err('E3', '封面缺少一句话结论（<p class="sub">）', '<p class="sub">中台缺计费闭环，bms 四段链可补 5 页</p>');
else if (/本文对.*进行了.*调研|本文旨在|旨在全面/.test(sub)) {
  err('E3', `一句话结论没有判断：「${sub}」`, '换成判断句，例：中台缺计费闭环，bms 四段链可补 5 页');
}

// ---------- E4 对象表可复核 ----------
const scopeCh = findChapter('口径与证据');
if (scopeCh) {
  const ts = tablesIn(scopeCh.body);
  if (!ts.length) {
    err('E4', '「口径与证据」没有对象表', '| 对象 | 简称 | 访问时刻 | 账号条件 | 覆盖端 | 证据级 | 未验证项 |');
  } else {
    const h = ts[0].headers.join('|');
    if (!h.includes('对象')) err('E4', '对象表表头缺少「对象」列', '表头：对象 | 简称 | 访问时刻 | 账号条件 | 覆盖端 | 证据级 | 未验证项');
    if (!/访问时刻|访问日期|访问时间/.test(h)) err('E4', '对象表表头缺少「访问时刻」列', '加一列访问时刻，精确到分钟，例 2026-11-08 09:20');
    if (!ts[0].rows.length) err('E4', '对象表没有数据行', '一个对象一行；拿不到信息的写「未验证」并说明原因');
  }
}

// ---------- E5 结论可判定 ----------
const conCh = findChapter('结论与落点');
if (conCh) {
  const text = textOf(conCh.body);
  if (!JUDGEMENTS.some((j) => text.includes(j))) err('E5', '「结论与落点」没有出现任何判定词', '结论逐条标：可借鉴 / 不跟随 / 待定');
  const conT = tablesIn(conCh.body).find((t) => t.headers.includes('判定') && t.headers.some((h) => h.includes('落点')));
  if (!conT) {
    err('E5', '缺少结论表（需含「判定」与「落点」两列）', '| 编号 | 判定 | 结论 | 落点 |');
  } else {
    const ji = conT.headers.indexOf('判定');
    const li = conT.headers.findIndex((h) => h.includes('落点'));
    conT.rows.forEach((r, i) => {
      const j = (r[ji] || '').replace(/[`*\s]/g, '');
      if (!JUDGEMENTS.includes(j)) err('E5', `结论第 ${i + 1} 行判定不合法：「${r[ji] || ''}」`, '只能填 可借鉴 / 不跟随 / 待定');
      if (!(r[li] || '').trim()) err('E5', `结论第 ${i + 1} 行没有落点`, '落点写页面 key、字段名或决策人，落不到的改判「待定」并写卡点');
    });
  }
}

// ---------- E6 截图与图片路径 ----------
const shotCh = findChapter('截图索引');
if (shotCh) {
  if (!tablesIn(shotCh.body).length) err('E6', '「截图索引」没有表格', '| 图号 | 文件 | 对象 | 菜单路径 | 证明什么 | 数据状态 |');
}
const baseDir = path.dirname(path.resolve(file));
for (const m of body.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
  const src = m[1].trim();
  if (/^(https?:|data:|file:|blob:|\/\/)/i.test(src)) {
    err('E6', `图片须用相对路径引用本地证据：${src}`, '把图存进同名 .assets 目录，用相对路径引用');
    continue;
  }
  const target = path.resolve(baseDir, src);
  if (!fs.existsSync(target)) err('E6', `图片路径不存在：${src}`, `确认文件在 ${path.relative(process.cwd(), target)}`);
}

// ---------- W3 逐页记录与横向对比有数据 ----------
for (const name of ['逐页记录', '横向对比']) {
  const c = findChapter(name);
  if (!c) continue;
  const hasTable = tablesIn(c.body).length > 0;
  const strongs = (c.body.match(/<strong\b/gi) || []).length + (c.body.match(/<b\b/gi) || []).length;
  if (!hasTable && strongs < 3) warn('W3', `「${name}」缺数据支撑（表格 0 张、加粗结论 ${strongs} 处）`, '补一张表，或至少 3 条带数字的加粗结论');
}

// ---------- W1 残留 / W2 空话 ----------
const guideHits = (raw.match(/<!--\s*GUIDE/gi) || []).length;
if (guideHits) warn('W1', `残留填写指引 <!-- GUIDE：${guideHits} 处`, '交付前删掉全部 GUIDE 注释块');
const plain = textOf(raw);
const plainWithPlaceholders = stripTags(stripComments(raw)).replace(/\s+/g, ' ');
const residue = [
  { re: /\{\{/g, name: '占位符 {{' },
  { re: /\bTODO\b/g, name: 'TODO' },
  { re: /待填/g, name: '待填' },
];
for (const r of residue) {
  const n = (plainWithPlaceholders.match(r.re) || []).length;
  if (n) warn('W1', `残留${r.name}：${n} 处`, '交付前清理全部占位符与待填标记');
}
for (const w of BANNED) {
  if (plain.includes(w)) warn('W2', `空话词「${w}」`, '换成事实、数字或可判定判断');
}

// ---------- 输出 ----------
if (flags.has('--json')) {
  console.log(JSON.stringify({ file, errors, warnings: warns, ok: errors.length === 0 }, null, 2));
} else {
  const show = (item, tag) => {
    console.log(`[${tag}] ${item.code} ${item.msg}`);
    if (flags.has('--fix') && item.fix) item.fix.split('\n').forEach((l) => console.log(`      ${l}`));
  };
  errors.forEach((e) => show(e, '错误'));
  warns.forEach((w) => show(w, '警告'));
  console.log('---');
  console.log(`汇总：错误 ${errors.length}，警告 ${warns.length}${flags.has('--fix') ? '' : '（加 --fix 看补齐建议）'}`);
  console.log(`结论：${errors.length === 0 ? '通过' : '未通过'} — ${file}`);
}

process.exit(errors.length === 0 ? 0 : 1);
