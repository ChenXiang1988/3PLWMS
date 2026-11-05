#!/usr/bin/env node
/**
 * 端产物构建入口（3PL 云仓原型）。
 * 用法：node prototypes/build-app.mjs [--check]
 * 一个端一个产物：prototypes/00 dist/<端名>.html；源仍按模块目录存放。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const PROTO = path.dirname(fileURLToPath(import.meta.url));
const SHARED = path.join(PROTO, '01 shared');
const DIST = path.join(PROTO, '00 dist');
const ROOT = path.dirname(PROTO);
const CHECK = process.argv.slice(2).includes('--check');
const PAGE_TYPES = new Set(['list', 'detail', 'report', 'scan']);
const TONES = ['disabled', 'enabled', 'info', 'pending', 'rejected'];
const TAG_TONES = ['default', 'info', 'danger'];
const SAAS_WORDS = ['租户', '账号空间', '按租户分库', '订阅', '套餐', '充值', '续费', '试用到期', '升级专业版', '平台运营后台', '主体切换器'];
const DOC_WORDS = ['TODO', 'lorem', '占位符', '示意代码', '本期不做', '后续迭代', '暂不支持', '待开发', '实现说明', '设计注解', '操作指引'];

const errors = [];
const bad = (tag, msg) => errors.push(`[${tag}] ${msg}`);
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

const reg = JSON.parse(read(path.join(SHARED, 'modules.json')));

function validateRegistry() {
  const apps = reg.apps || [];
  const ids = new Set();
  for (const a of apps) {
    if (!/^[a-z][a-z0-9-]*$/.test(a.id || '')) bad('装配清单', `端 id 非法：${a.id}`);
    if (!a.name) bad('装配清单', `端 ${a.id} 缺 name`);
    if (ids.has(a.id)) bad('装配清单', `端 id 重复：${a.id}`);
    ids.add(a.id);
  }
  const keys = new Set();
  for (const m of reg.modules) {
    for (const p of m.pages || []) {
      if (keys.has(p.key)) bad('装配清单', `页面 key 跨模块重复：${p.key}`);
      keys.add(p.key);
      if (!PAGE_TYPES.has(p.type)) bad('装配清单', `${p.key} 的 type=${p.type} 不在四类骨架内`);
      if (!String(p.file || '').startsWith('pages/')) bad('装配清单', `${p.key} 的 file 必须落在 pages/`);
      if (p.app && !ids.has(p.app)) bad('装配清单', `${p.key} 的 app=${p.app} 不在端清单内`);
      if (p.ownerScoped && p.type !== 'list') bad('装配清单', `${p.key} 只有 list 页可设 ownerScoped`);
      if (p.app && !fs.existsSync(path.join(PROTO, m.id, p.file))) bad('装配清单', `${p.key} 找不到页面文件`);
    }
  }
}
validateRegistry();

function entriesOf(appId) {
  const out = [];
  for (const m of reg.modules) {
    if (!m.deployed) continue;
    for (const p of m.pages || []) {
      if (p.app !== appId) continue;
      out.push({
        module: m, page: p,
        file: path.join(PROTO, m.id, p.file),
        dataFile: path.join(PROTO, m.id, 'data', `${p.key}.json`),
        pageId: `${m.id}/${p.key}`,
      });
    }
  }
  return out;
}

function hexPalette() {
  const set = new Set();
  for (const name of ['tokens.css.mjs', 'ui.mjs']) {
    for (const m of (read(path.join(SHARED, name)) || '').matchAll(/#([0-9a-fA-F]{3,8})\b/g)) set.add(m[1].toLowerCase());
  }
  return set;
}

function checkPageSource(e) {
  const s = read(e.file) || '';
  const where = rel(e.file);
  const prefix = e.module.prefix;
  for (const m of s.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
    if (m[1].startsWith('../../') && !m[1].startsWith('../../01 shared/')) bad('模块边界', `${where} 引用了其它模块路径 ${m[1]}`);
  }
  if (/<script\b/i.test(s)) bad('自包含', `${where} 页面模块里出现 <script>`);
  const palette = hexPalette();
  for (const m of s.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    if (!palette.has(m[1].toLowerCase())) bad('取值越界', `${where} 色值 #${m[1]} 不在实现层令牌里`);
  }
  if (/(?<![a-zA-Z])rpx/i.test(s)) bad('取值越界', `${where} 出现 rpx`);
  for (const m of s.matchAll(/StatusTag\(\s*[^,)]+,\s*['"]([a-zA-Z]+)['"]\s*\)/g)) {
    if (!TONES.includes(m[1])) bad('色型', `${where} StatusTag 传入未定义色型 ${m[1]}`);
  }
  for (const m of s.matchAll(/\bTag\(\s*[^,)]+,\s*['"]([a-zA-Z]+)['"]\s*\)/g)) {
    if (!TAG_TONES.includes(m[1])) bad('色型', `${where} Tag 传入未定义色型 ${m[1]}`);
  }
  const has = (name) => new RegExp(`\\b${name}\\s*\\(`).test(s);
  if (e.page.type === 'list') {
    if (!has('ListPage')) bad('骨架', `${where} 声明为 list 却没用 ListPage`);
    if (has('StatRow') || has('ReportHero') || has('PageHeader')) bad('骨架', `${where} list 页不得摆指标卡`);
  } else if (e.page.type === 'detail') {
    if (!has('DetailPage')) bad('骨架', `${where} 声明为 detail 却没用 DetailPage`);
    if (has('ListPage')) bad('骨架', `${where} detail 页不得套 ListPage`);
  } else if (e.page.type === 'report') {
    if (!has('ReportHero') && !has('Block')) bad('骨架', `${where} 声明为 report 却没用 ReportHero / Block`);
    if (has('ListPage')) bad('骨架', `${where} report 页不得套 ListPage`);
  } else if (e.page.type === 'scan') {
    if (!has('ScanPage')) bad('骨架', `${where} 声明为 scan 却没用 ScanPage`);
  }
  const classes = new Set();
  for (const m of s.matchAll(/class="([^"]*)"/g)) {
    m[1].split(/\s+/).forEach((c) => { if (c && !c.includes('$') && !c.includes('{')) classes.add(c); });
  }
  for (const m of s.matchAll(/^\s*\.([a-zA-Z][\w-]*)/gm)) classes.add(m[1]);
  for (const c of classes) {
    if (!c.startsWith('wx-') && !c.startsWith(prefix)) bad('命名', `${where} 类名 ${c} 未带模块前缀 ${prefix}`);
  }
}

async function renderApp(app, entries, sharedUi) {
  const data = {};
  for (const e of entries) {
    const raw = read(e.dataFile);
    if (raw == null) { bad('装配清单', `缺演示数据：${rel(e.dataFile)}`); continue; }
    try {
      const v = JSON.parse(raw);
      data[e.page.key] = Array.isArray(v) ? { rows: v } : (v && typeof v === 'object' ? v : { rows: [] });
    } catch (err) { bad('装配清单', `${rel(e.dataFile)} 不是合法 JSON：${err.message}`); }
  }
  const sections = [], overlays = [], styles = [];
  for (const e of entries) {
    let mod;
    try { mod = await import(pathToFileURL(e.file).href); }
    catch (err) { bad('页面装配', `${rel(e.file)} 导入失败：${err.message}`); continue; }
    if (typeof mod.renderPage !== 'function') { bad('页面装配', `${rel(e.file)} 没有 renderPage`); continue; }
    const ctx = {
      moduleId: e.module.id, moduleName: e.module.name,
      pageKey: e.page.key, pageName: e.page.name,
      prefix: e.module.prefix, type: e.page.type,
      ownerScoped: !!e.page.ownerScoped, modules: e.module, ui: sharedUi,
    };
    let r;
    try { r = mod.renderPage(data, ctx); }
    catch (err) { bad('页面装配', `${rel(e.file)} 渲染失败：${err.message}`); continue; }
    const html = typeof r === 'string' ? r : (r && r.html);
    if (typeof html !== 'string' || html.trim().length < 50) { bad('页面装配', `${rel(e.file)} 渲染结果为空`); continue; }
    if (r && typeof r === 'object' && r.overlay) overlays.push(r.overlay);
    if (typeof mod.PAGE_CSS === 'string') styles.push(mod.PAGE_CSS);
    sections.push(`<section class="page" data-page-id="${e.pageId}" data-owner-scoped="${e.page.ownerScoped === true}" hidden>${html}</section>`);
  }
  if (sections.length !== entries.length) bad('页面装配', `装配页数 ${sections.length} 与清单页数 ${entries.length} 不一致`);
  return { sections, overlays, styles };
}

function buildHtml(app, entries, built, sharedUi) {
  const esc = sharedUi.esc;
  const options = (reg.owners || ['全部']).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  const names = [...new Set(entries.map((e) => e.module.name))];
  const modulesBar = names.map((n) => `<span title="该模块单独交付，跨模块入口请在集成视图查看">${esc(n)}</span>`).join('');
  const side = entries.map((e) => `<button type="button" class="wx-side-item" data-target="${e.pageId}">${esc(e.page.name)}</button>`).join('');
  const css = [sharedUi.TOKENS_CSS, sharedUi.BASE_CSS, ...built.styles].join('\n');
  const overlay = built.overlays.length ? `<div class="wx-overlay" hidden>${built.overlays.join('')}</div>` : '';
  return `<!DOCTYPE html>\n<html lang="zh-CN" data-build="__FINGERPRINT__">\n<head>\n`
    + `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n`
    + `<title>${esc(app.name)} · ${esc(reg.product)}</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n`
    + `<header class="wx-top"><b>${esc(reg.product)}</b>`
    + `<span class="wx-subject">${esc(reg.subject)}</span><span class="wx-edition">${esc(reg.edition)}</span>`
    + `<label class="wx-scope" hidden><span>货主</span><select class="wx-owner-select">${options}</select></label>`
    + `<span class="wx-current">当前端：${esc(app.name)}</span></header>\n`
    + `<nav class="wx-modules">${modulesBar}</nav>\n`
    + `<div class="wx-layout"><aside class="wx-side"><div class="wx-side-title">${esc(app.name)}</div>${side}</aside>\n`
    + `<main class="wx-main">${built.sections.join('\n')}</main></div>\n`
    + overlay + `\n<div class="wx-toast" hidden></div>\n`
    + `<script>\n${sharedUi.SHELL_SCRIPT}\n</script>\n</body>\n</html>\n`;
}

function checkProduct(html, entries, app) {
  if (/https?:\/\//i.test(html)) bad('自包含', `${app.name} 产物出现 http(s) 外链`);
  if (/<script[^>]+src\s*=/i.test(html) || /<link[^>]+href\s*=/i.test(html) || /@import/i.test(html)) bad('自包含', `${app.name} 产物出现外部脚本 / 样式引用`);
  for (const w of SAAS_WORDS) if (html.includes(w)) bad('非SaaS', `${app.name} 产物出现红线词「${w}」`);
  for (const w of DOC_WORDS) if (html.includes(w)) bad('文案', `${app.name} 产物出现过程文字「${w}」`);
  if (/__[A-Z_]+__/.test(html)) bad('文案', `${app.name} 产物残留模板占位符`);
  for (const e of entries) if (!html.includes(`data-page-id="${e.pageId}"`)) bad('页面装配', `${app.name} 缺页面容器 ${e.pageId}`);
  for (const m of html.matchAll(/<button[^>]*class="wx-tab[^"]*"[^>]*>/g)) {
    if (m[0].includes('data-tab-all')) continue;
    if (!m[0].includes('data-tab-field') || !/data-tab-value="[^"]+"/.test(m[0])) bad('页签', `${app.name} 状态页签缺 field / value`);
  }
}

function fingerprint(entries) {
  const files = [
    path.join(PROTO, 'build-app.mjs'),
    path.join(SHARED, 'modules.json'),
    path.join(SHARED, 'tokens.css.mjs'),
    path.join(SHARED, 'ui.mjs'),
  ];
  for (const e of entries) { files.push(e.file); if (fs.existsSync(e.dataFile)) files.push(e.dataFile); }
  const h = createHash('sha256');
  for (const f of [...new Set(files)].sort()) { h.update(rel(f)); h.update('\0'); h.update(read(f) || ''); h.update('\0'); }
  return h.digest('hex');
}

const distOf = (app) => path.join(DIST, `${app.name}.html`);

if (CHECK) {
  for (const app of reg.apps) {
    const entries = entriesOf(app.id);
    const existing = read(distOf(app));
    if (existing == null) { console.error(`[基线] drift：找不到产物 ${rel(distOf(app))}，先跑一次构建`); process.exit(1); }
    const m = existing.match(/data-build="([a-f0-9]{64})"/);
    const hash = fingerprint(entries);
    if (!m || m[1] !== hash) { console.error(`[基线] drift：${app.name} 源已变，产物 ${m ? m[1].slice(0, 8) : '无指纹'}，当前源 ${hash.slice(0, 8)}`); process.exit(1); }
    console.log(`check ok（${app.name}，${entries.length} 页，${hash.slice(0, 8)}）`);
  }
  process.exit(0);
}

const sharedUi = await import(pathToFileURL(path.join(SHARED, 'ui.mjs')).href);
if (!sharedUi.TOKENS_CSS || !sharedUi.BASE_CSS || !sharedUi.SHELL_SCRIPT) bad('装配清单', '01 shared/ui.mjs 缺少必要导出');
fs.mkdirSync(DIST, { recursive: true });
for (const app of reg.apps) {
  const entries = entriesOf(app.id);
  if (!entries.length) bad('装配清单', `端「${app.name}」没有页面`);
  for (const e of entries) checkPageSource(e);
  const built = await renderApp(app, entries, sharedUi);
  let html = buildHtml(app, entries, built, sharedUi);
  const hash = fingerprint(entries);
  html = html.replace('__FINGERPRINT__', hash);
  checkProduct(html, entries, app);
  if (errors.length) { console.error(errors.join('\n')); console.error(`\n构建中止：${errors.length} 项违规`); process.exit(1); }
  fs.writeFileSync(distOf(app), html, 'utf8');
  console.log(`build ok：${rel(distOf(app))}（${entries.length} 页，${hash.slice(0, 8)}）`);
}
