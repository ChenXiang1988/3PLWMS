#!/usr/bin/env node
/**
 * 原型交付验收脚本（3pl-wms-proto skill）。
 *
 * 用法：node verify-delivery.mjs [--app owner] [--fast] [--json] [--root <工作区路径>]
 * 不带 --app 即全量验收所有端。验收对象按端，不再按模块逐个出产物。
 * 退出码：0 全通过；1 有违规；2 运行环境不满足。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.dirname(HERE);
const DEFAULT_ROOT = path.resolve(HERE, '..', '..', '..', '..');

const ARGS = process.argv.slice(2);
let ROOT = DEFAULT_ROOT;
let ONLY = null;
let FAST = false;
let JSON_OUT = false;
for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === '--root' && ARGS[i + 1]) { ROOT = path.resolve(ARGS[++i]); continue; }
  if ((ARGS[i] === '--app' || ARGS[i] === '--module') && ARGS[i + 1]) { ONLY = ARGS[++i]; continue; }
  if (ARGS[i] === '--fast') FAST = true;
  if (ARGS[i] === '--json') JSON_OUT = true;
}

const PROTO = path.join(ROOT, 'prototypes');
const SHARED = path.join(PROTO, '01 shared');
const DIST = path.join(PROTO, '00 dist');
const GLOSSARY = path.join(SKILL, 'references', 'glossary.md');
const SAAS_WORDS = ['租户', '账号空间', '按租户分库', '订阅', '套餐', '充值', '续费', '试用到期', '升级专业版', '平台运营后台', '主体切换器'];
const DOC_WORDS = ['TODO', 'lorem', '占位符', '示意代码', '本期不做', '后续迭代', '暂不支持', '待开发', '实现说明', '设计注解', '操作指引'];

const results = [];
const add = (id, name, issues, note = '') => results.push({ id, name, issues, note });
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

if (Number(process.versions.node.split('.')[0]) < 18) { console.error('Node 版本低于 18'); process.exit(2); }
if (!fs.existsSync(path.join(SHARED, 'modules.json'))) {
  console.error(`运行环境不满足：找不到 ${rel(path.join(SHARED, 'modules.json'))}。先跑 init-module.mjs`);
  process.exit(2);
}
const reg = JSON.parse(read(path.join(SHARED, 'modules.json')));
const apps = reg.apps || [];
const selected = ONLY ? apps.filter((a) => a.id === ONLY) : apps;
if (ONLY && selected.length === 0) { console.error(`端 ${ONLY} 不在注册表里。可用 ID：${apps.map((a) => a.id).join('、')}`); process.exit(2); }

function entriesOf(app) {
  const out = [];
  for (const m of reg.modules) {
    if (!m.deployed) continue;
    for (const p of m.pages || []) {
      if (p.app !== app.id) continue;
      const file = path.join(PROTO, m.id, p.file);
      if (fs.existsSync(file)) out.push({ page: p, module: m, file });
    }
  }
  return out;
}

/* S1：模块边界与源交付清单 */
function checkBoundary() {
  const bad = [];
  for (const m of reg.modules) {
    if (!m.deployed) continue;
    const dir = path.join(PROTO, m.id);
    const mf = path.join(dir, 'module.json');
    if (!fs.existsSync(dir)) { bad.push(`模块目录不存在：${rel(dir)}`); continue; }
    const s = read(mf);
    if (s == null) { bad.push(`找不到交付清单：${rel(mf)}`); continue; }
    let j;
    try { j = JSON.parse(s); } catch (e) { bad.push(`${rel(mf)} 不是合法 JSON`); continue; }
    if (j.id !== m.id) bad.push(`${rel(mf)} 的 id 与注册表不一致`);
    for (const k of ['name', 'tier', 'deployed']) if (j[k] !== m[k]) bad.push(`${rel(mf)} 的 ${k} 与注册表不一致`);
    const deps = j.dependsOn || [];
    if (deps.length !== 1 || deps[0] !== 'shared') bad.push(`${rel(mf)} 的 dependsOn 只能是 ["shared"]`);
  }
  for (const app of selected) {
    for (const e of entriesOf(app)) {
      for (const hit of (read(e.file) || '').matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
        if (hit[1].startsWith('../../') && !hit[1].startsWith('../../01 shared/')) {
          bad.push(`${rel(e.file)} 跨模块引用 ${hit[1]}`);
        }
      }
    }
  }
  add('S1', '模块边界：页面无跨模块 import、dependsOn 只含 shared、清单与注册表一致', bad);
}

/* S2：文案一致 */
function checkGlossary() {
  const bad = [];
  const text = read(GLOSSARY);
  if (text == null) { add('S2', '文案一致', ['找不到文案权威源 glossary.md']); return; }
  for (const a of apps) if (!text.includes(a.name)) bad.push(`glossary.md 缺端名「${a.name}」`);
  for (const m of reg.modules) {
    if (!text.includes(m.name)) bad.push(`glossary.md 缺模块名「${m.name}」`);
    for (const p of m.pages) if (!text.includes(p.name)) bad.push(`glossary.md 缺页面名「${p.name}」（${m.id}/${p.key}）`);
  }
  add('S2', '文案一致：端名、模块名与页面名逐字存在于 glossary.md', bad);
}

/* S3 / S4：取值、骨架与命名 */
function tokenPalette() {
  const set = new Set();
  for (const name of ['tokens.css.mjs', 'ui.mjs']) {
    for (const m of (read(path.join(SHARED, name)) || '').matchAll(/#([0-9a-fA-F]{3,8})\b/g)) set.add(m[1].toLowerCase());
  }
  return set;
}
function checkSources() {
  const badValue = [];
  const badShape = [];
  const palette = tokenPalette();
  if (palette.size === 0) badValue.push('实现层令牌源一个色值都没读到');
  for (const app of selected) {
    for (const e of entriesOf(app)) {
      const s = read(e.file) || '';
      for (const m of s.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
        if (!palette.has(m[1].toLowerCase())) badValue.push(`${rel(e.file)} 色值 #${m[1]} 不在实现层令牌里`);
      }
      if (/(?<![a-zA-Z])rpx/i.test(s)) badValue.push(`${rel(e.file)} 含 rpx`);
      if (/<script\b/i.test(s)) badShape.push(`${rel(e.file)} 页面模块含页面级脚本`);
      const has = (name) => new RegExp(`\\b${name}\\s*\\(`).test(s);
      if (e.page.type === 'list') {
        if (!has('ListPage')) badShape.push(`${rel(e.file)} 声明 list 却没用 ListPage`);
        if (has('StatRow') || has('ReportHero') || has('PageHeader')) badShape.push(`${rel(e.file)} list 页不得摆指标卡`);
      } else if (e.page.type === 'detail') {
        if (!has('DetailPage')) badShape.push(`${rel(e.file)} 声明 detail 却没用 DetailPage`);
      } else if (e.page.type === 'report') {
        if (!has('ReportHero') && !has('Block')) badShape.push(`${rel(e.file)} 声明 report 却没用 ReportHero / Block`);
      } else if (e.page.type === 'scan') {
        if (!has('ScanPage')) badShape.push(`${rel(e.file)} 声明 scan 却没用 ScanPage`);
      }
      const classes = new Set();
      for (const m of s.matchAll(/class="([^"]*)"/g)) {
        m[1].split(/\s+/).forEach((c) => { if (c && !c.includes('$') && !c.includes('{')) classes.add(c); });
      }
      for (const m of s.matchAll(/^\s*\.([a-zA-Z][\w-]*)/gm)) classes.add(m[1]);
      for (const c of classes) {
        if (!c.startsWith('wx-') && !c.startsWith(e.module.prefix)) badShape.push(`${rel(e.file)} 类名 ${c} 未带模块前缀 ${e.module.prefix}`);
      }
    }
  }
  add('S3', '取值不越界：页面色值来自实现层令牌、无 rpx', badValue, `令牌白名单现场收集，共 ${palette.size} 个色值`);
  add('S4', '骨架与命名：类型与组件匹配、自定义类名带模块前缀', badShape);
}

/* S5：端产物格式、集中与不入库 */
function checkProduct() {
  const bad = [];
  for (const app of selected) {
    const dist = path.join(DIST, `${app.name}.html`);
    const html = read(dist);
    if (html == null) { bad.push(`找不到产物：${rel(dist)}`); continue; }
    if (!/data-build="[a-f0-9]{64}"/.test(html)) bad.push(`${rel(dist)} 缺合法 data-build 源指纹`);
    if (/https?:\/\//i.test(html)) bad.push(`${rel(dist)} 出现 http(s) 外链`);
    if (/<script[^>]+src\s*=/i.test(html) || /<link[^>]+href\s*=/i.test(html) || /@import/i.test(html)) bad.push(`${rel(dist)} 出现外部脚本 / 样式引用`);
    for (const w of SAAS_WORDS) if (html.includes(w)) bad.push(`${rel(dist)} 出现 SaaS 红线词「${w}」`);
    for (const w of DOC_WORDS) if (html.includes(w)) bad.push(`${rel(dist)} 出现过程文字「${w}」`);
    if (/__[A-Z_]+__/.test(html)) bad.push(`${rel(dist)} 残留模板占位符`);
    for (const e of entriesOf(app)) {
      if (!html.includes(`data-page-id="${e.module.id}/${e.page.key}"`)) bad.push(`${rel(dist)} 缺页面容器 ${e.module.id}/${e.page.key}`);
    }
    for (const m of html.matchAll(/<button[^>]*class="wx-tab[^"]*"[^>]*>/g)) {
      if (m[0].includes('data-tab-all')) continue;
      if (!m[0].includes('data-tab-field') || !/data-tab-value="[^"]+"/.test(m[0])) bad.push(`${rel(dist)} 状态页签缺 field / value`);
    }
  }
  const gi = read(path.join(ROOT, '.gitignore')) || '';
  if (!gi.split(/\r?\n/).some((l) => l.trim() === 'prototypes/00 dist/')) bad.push('.gitignore 未忽略 prototypes/00 dist/');
  const stray = [];
  for (const m of reg.modules) {
    const d = path.join(PROTO, m.id, 'dist');
    if (fs.existsSync(d)) for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.html'))) stray.push(rel(path.join(d, f)));
  }
  if (stray.length) bad.push(`模块目录下仍有散落产物：${stray.slice(0, 3).join('、')}`);
  const r = spawnSync('git', ['ls-files', 'prototypes'], { cwd: ROOT, encoding: 'utf8' });
  let note = '';
  if (r.status === 0) {
    const tracked = (r.stdout || '').split('\n').filter((l) => l.includes('/dist/') || l.startsWith('prototypes/00 dist/'));
    if (tracked.length) bad.push(`git 索引里仍有产物：${tracked.slice(0, 3).join('、')}`);
  } else note = '当前目录不是 git 仓库或 git 不可用，跳过索引项检查';
  add('S5', '端产物：单文件自包含、页容器齐全、产物集中在 00 dist、不入库', bad, note);
}

/* X：端产物漂移检查 */
function runChecks() {
  if (FAST) { add('X', '产物漂移检查', [], '--fast 已跳过，交付前须不带 --fast 再跑一次'); return; }
  const bad = [];
  const r = spawnSync(process.execPath, ['build-app.mjs', '--check'], { cwd: PROTO, encoding: 'utf8', timeout: 600000 });
  const out = `${r.stdout || ''}\n${r.stderr || ''}`.trim();
  if (r.status !== 0) bad.push(out.split('\n').filter(Boolean).slice(-3).join(' / '));
  add('X', '产物漂移检查：node prototypes/build-app.mjs --check', bad, r.status === 0 ? out.split('\n').filter(Boolean).join('；') : '');
}

checkBoundary();
checkGlossary();
checkSources();
checkProduct();
runChecks();

const failed = results.filter((r) => r.issues.length);
if (JSON_OUT) {
  console.log(JSON.stringify({ root: ROOT, scope: ONLY || 'all-apps', fast: FAST, ok: failed.length === 0, results }, null, 2));
} else {
  console.log(`3PL 云仓原型交付验收（工作区根 ${ROOT}，范围 ${ONLY || '所有端'}${FAST ? '，--fast' : ''}）\n`);
  for (const r of results) {
    console.log(`${r.issues.length ? '✗' : '✓'} ${r.id} ${r.name}`);
    for (const i of r.issues) console.log(`     ${i}`);
    if (r.note && !r.issues.length) console.log(`     ${r.note}`);
  }
  console.log('');
  console.log(failed.length ? `违规 ${failed.length} 组。规则原文：.codebuddy/skills/3pl-wms-proto/references/` : `全部通过${FAST ? '（--fast：未验证产物漂移）' : ''}`);
}
process.exit(failed.length ? 1 : 0);
