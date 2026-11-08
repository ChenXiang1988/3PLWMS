#!/usr/bin/env node
/**
 * 端产物构建入口（货灵供应链运营平台原型）。
 * 用法：node prototypes/build-app.mjs [--check]
 * 一个端一个产物：prototypes/dist/<端名>.html；源仍按模块目录存放。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const PROTO = path.dirname(fileURLToPath(import.meta.url));
const SHARED = path.join(PROTO, 'shared');
const DIST = path.join(PROTO, 'dist');
const ROOT = path.dirname(PROTO);
const CHECK = process.argv.slice(2).includes('--check');
const PAGE_TYPES = new Set(['list', 'detail', 'report', 'scan', 'shop']);
const SHELLS = new Set(['admin', 'mall', 'pda']);
const TONES = ['disabled', 'enabled', 'info', 'pending', 'rejected'];
const TAG_TONES = ['default', 'info', 'danger'];
const SAAS_WORDS = ['租户', '账号空间', '按租户分库', '订阅', '套餐', '充值', '续费', '试用到期', '升级专业版', '平台运营后台', '主体切换器'];
const DOC_WORDS = ['TODO', 'lorem', '占位符', '示意代码', '本期不做', '后续迭代', '暂不支持', '待开发', '实现说明', '设计注解', '操作指引'];

const errors = [];
const bad = (tag, msg) => errors.push(`[${tag}] ${msg}`);
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

const reg = JSON.parse(read(path.join(SHARED, 'modules.json')));
const demoOwners = () => (reg.owners || []).filter((o) => o !== '全部').slice(0, 2);
const mallTarget = () => {
  const app = (reg.apps || []).find((a) => a.shell === 'mall');
  return app ? { name: app.name, href: `${app.name}.html` } : null;
};

function validateRegistry() {
  const apps = reg.apps || [];
  const ids = new Set();
  const mallIds = new Set();
  for (const a of apps) {
    if (!/^[a-z][a-z0-9-]*$/.test(a.id || '')) bad('装配清单', `端 id 非法：${a.id}`);
    if (!a.name) bad('装配清单', `端 ${a.id} 缺 name`);
    if (a.shell && !SHELLS.has(a.shell)) bad('装配清单', `端 ${a.id} 的 shell=${a.shell} 不在外壳清单内`);
    if (ids.has(a.id)) bad('装配清单', `端 id 重复：${a.id}`);
    ids.add(a.id);
    if (a.shell === 'mall') mallIds.add(a.id);
  }
  const keys = new Set();
  for (const m of reg.modules) {
    for (const p of m.pages || []) {
      if (keys.has(p.key)) bad('装配清单', `页面 key 跨模块重复：${p.key}`);
      keys.add(p.key);
      if (!PAGE_TYPES.has(p.type)) bad('装配清单', `${p.key} 的 type=${p.type} 不在五类骨架内`);
      if (!String(p.file || '').startsWith('pages/')) bad('装配清单', `${p.key} 的 file 必须落在 pages/`);
      if (p.app && !ids.has(p.app)) bad('装配清单', `${p.key} 的 app=${p.app} 不在端清单内`);
      if (p.type === 'shop' && (!p.app || !mallIds.has(p.app))) bad('装配清单', `${p.key} 是 shop 页，必须归属 shell=mall 的端`);
      if (p.type !== 'shop' && p.app && mallIds.has(p.app)) bad('装配清单', `${p.key} 归属商城端却不是 shop 页`);
      if (p.type === 'shop' && p.ownerScoped) bad('装配清单', `${p.key} shop 页不响应货主下拉`);
      if (p.ownerScoped && p.type !== 'list') bad('装配清单', `${p.key} 只有 list 页可设 ownerScoped`);
      if (p.app && !fs.existsSync(path.join(PROTO, m.id, p.file))) bad('装配清单', `${p.key} 找不到页面文件`);
    }
  }
  for (const a of apps) {
    if (!a.nav) continue;
    const own = new Set();
    for (const m of reg.modules) for (const p of m.pages || []) if (p.app === a.id) own.add(`${m.id}/${p.key}`);
    const seen = new Set();
    const groupIds = new Set();
    for (const g of a.nav) {
      if (!/^[a-z][a-z0-9-]*$/.test(g.id || '')) bad('装配清单', `端 ${a.id} 导航段 id 非法：${g.id}`);
      if (!g.name) bad('装配清单', `端 ${a.id} 导航段缺 name`);
      if (groupIds.has(g.id)) bad('装配清单', `端 ${a.id} 导航段 id 重复：${g.id}`);
      groupIds.add(g.id);
      if (!Array.isArray(g.pages) || !g.pages.length) bad('装配清单', `端 ${a.id} 导航段 ${g.id} 缺 pages`);
      for (const id of g.pages || []) {
        if (!own.has(id)) bad('装配清单', `端 ${a.id} 导航段 ${g.id} 引用了不属于本端的页面 ${id}`);
        if (seen.has(id)) bad('装配清单', `端 ${a.id} 导航段引用重复页面 ${id}`);
        seen.add(id);
      }
    }
    for (const id of own) if (!seen.has(id)) bad('装配清单', `端 ${a.id} 的页面 ${id} 未落入任何导航段`);
  }
}
validateRegistry();

/* 共享演示主档：货主 / 商品 / 仓库 / 批次的唯一事实源。
   页面 data/*.json 可写成 { ref, keys, fields, target } 引用声明，构建期还原成完整数据。 */
const MASTER_FILES = ['owners', 'skus', 'warehouses', 'batches', 'applies', 'platformShops'];
const FK_OF = { skus: 'skuCode', batches: 'batchNo', warehouses: 'warehouseCode', owners: 'ownerCode', applies: 'applyNo', platformShops: 'shopCode' };

function loadMaster() {
  const out = {};
  const dir = path.join(SHARED, 'data');
  for (const name of MASTER_FILES) {
    const p = path.join(dir, `${name}.json`);
    const raw = read(p);
    if (raw == null) { bad('共享主档', `缺共享主档：${rel(p)}`); continue; }
    try { out[name] = JSON.parse(raw); }
    catch (err) { bad('共享主档', `${rel(p)} 不是合法 JSON：${err.message}`); }
  }
  if (out.owners) {
    if (JSON.stringify(out.owners.scope || []) !== JSON.stringify(reg.owners || [])) {
      bad('共享主档', 'owners.scope 与注册表 owners 不一致');
    }
    if (!Array.isArray(out.owners.shop) || !Array.isArray(out.owners.rows)) bad('共享主档', 'owners 主档缺 shop / rows');
  }
  for (const name of MASTER_FILES.filter((x) => x !== 'owners')) {
    if (!out[name]) continue;
    if (!Array.isArray(out[name].rows)) { bad('共享主档', `${name} 主档缺 rows`); continue; }
    const fk = FK_OF[name];
    const seen = new Set();
    for (const r of out[name].rows) {
      if (seen.has(String(r[fk]))) bad('共享主档', `${name} 主档 ${fk} 重复：${r[fk]}`);
      seen.add(String(r[fk]));
    }
  }
  return out;
}

function hydrate(value, m, where) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !value.ref) return value;
  const spec = value;
  const [name, sub] = String(spec.ref).split('.');
  const entry = m[name];
  if (!entry) { bad('共享主档', `${where} 的 ref=${spec.ref} 找不到主档`); return spec; }
  const arr = sub ? entry[sub] : (entry.rows || entry);
  if (!Array.isArray(arr)) { bad('共享主档', `${where} 的 ref=${spec.ref} 不是数组`); return spec; }
  let rows = arr;
  if (Array.isArray(spec.keys)) {
    const fk = FK_OF[name];
    const map = new Map(arr.map((r) => [String(r[fk]), r]));
    rows = spec.keys.map((k) => {
      const r = map.get(String(k));
      if (!r) bad('共享主档', `${where} 引用了主档不存在的 ${fk}=${k}`);
      return r || {};
    });
  }
  if (Array.isArray(spec.fields) && rows.length && typeof rows[0] === 'object') {
    rows = rows.map((r) => { const o = {}; for (const f of spec.fields) if (f in r) o[f] = r[f]; return o; });
  } else if (Array.isArray(spec.drop) && rows.length && typeof rows[0] === 'object') {
    rows = rows.map((r) => { const o = { ...r }; for (const f of spec.drop) delete o[f]; return o; });
  }
  const out = {};
  for (const [k, v] of Object.entries(spec)) if (!['ref', 'keys', 'fields', 'drop', 'target'].includes(k)) out[k] = v;
  out[spec.target || 'rows'] = rows;
  return out;
}

const master = loadMaster();

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
    if (m[1].startsWith('../../') && !m[1].startsWith('../../shared/')) bad('模块边界', `${where} 引用了其它模块路径 ${m[1]}`);
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
  } else if (e.page.type === 'shop') {
    if (!has('ShopPage')) bad('骨架', `${where} 声明为 shop 却没用 ShopPage`);
    if (has('ListPage') || has('DetailPage') || has('ReportHero') || has('ScanPage')) {
      bad('骨架', `${where} shop 页不得套后台四类骨架`);
    }
  }
  const cssAt = s.indexOf('export const PAGE_CSS');
  const pageSrc = cssAt > -1 ? s.slice(0, cssAt) : s;
  if (/class="wx-report"/.test(pageSrc)) bad('结构', `${where} 报表页外壳请改用 ReportPage，不要自拼 wx-report`);
  if (/class="[a-z0-9-]+-track"/.test(pageSrc)) bad('结构', `${where} 构成横条请改用 BarRows`);
  if (/class="wx-pda-taskcard"/.test(pageSrc)) bad('结构', `${where} PDA 任务卡请改用 PdaTaskCard`);
  if (/-bar\{display:grid/.test(s)) bad('结构', `${where} 横条样式请上提到 ui.mjs 的 .wx-bar*`);
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
  const views = app.id === 'erp-app' ? demoOwners() : [''];
  const data = {};
  for (const e of entries) {
    const raw = read(e.dataFile);
    if (raw == null) { bad('装配清单', `缺演示数据：${rel(e.dataFile)}`); continue; }
    try {
      const v = JSON.parse(raw);
      data[e.page.key] = hydrate(Array.isArray(v) ? { rows: v } : (v && typeof v === 'object' ? v : { rows: [] }), master, rel(e.dataFile));
    } catch (err) { bad('装配清单', `${rel(e.dataFile)} 不是合法 JSON：${err.message}`); }
  }
  const sections = [], overlays = [], styles = [];
  for (const view of views) {
    const scoped = view
      ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, (v && Array.isArray(v.rows)) ? { ...v, rows: v.rows.filter((r) => r.owner === view) } : v]))
      : data;
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
      try { r = mod.renderPage(scoped, ctx); }
      catch (err) { bad('页面装配', `${rel(e.file)} 渲染失败：${err.message}`); continue; }
      const html = typeof r === 'string' ? r : (r && r.html);
      if (typeof html !== 'string' || html.trim().length < 50) { bad('页面装配', `${rel(e.file)} 渲染结果为空`); continue; }
      if (view === views[0]) {
        if (r && typeof r === 'object' && r.overlay) overlays.push(r.overlay);
        if (typeof mod.PAGE_CSS === 'string') styles.push(mod.PAGE_CSS);
      }
      if (r && typeof r === 'object' && r.ownerOverlay) overlays.push(r.ownerOverlay);
      sections.push(`<section class="page" data-page-id="${e.pageId}" data-owner-view="${sharedUi.esc(view)}" data-owner-scoped="${view ? false : e.page.ownerScoped === true}" hidden>${html}</section>`);
    }
  }
  if (sections.length !== entries.length * views.length) bad('页面装配', `装配页数 ${sections.length} 与清单页数 ${entries.length} × 身份数 ${views.length} 不一致`);
  return { sections, overlays, styles };
}

function buildMallHtml(app, entries, built, sharedUi) {
  const esc = sharedUi.esc;
  const navNames = { home: '首页', search: '商品搜索', cart: '进货单', orders: '我的订单' };
  const nav = entries.filter((e) => navNames[e.page.key])
    .map((e) => ({ id: e.pageId, name: navNames[e.page.key] }));
  let cartCount = 0;
  try {
    cartCount = (JSON.parse(read(path.join(PROTO, 'mall', 'data', 'cart.json')) || '{}').rows || []).length;
  } catch (err) { cartCount = 0; }
  const css = [sharedUi.TOKENS_CSS, sharedUi.BASE_CSS, sharedUi.LOGIN_CSS, sharedUi.MALL_CSS, ...built.styles].join('\n');
  const overlay = built.overlays.length
    ? `<div class="wx-overlay" hidden><button type="button" class="wx-drawer" data-drawer-close aria-label="关闭抽屉"></button>${built.overlays.join('')}</div>`
    : '';
  const shell = sharedUi.renderShopShell({
    product: reg.product,
    appName: app.name,
    userLabel: '买家',
    nav,
    categories: sharedUi.SHOP_CATEGORIES || [],
    cartCount,
    content: built.sections.join('\n'),
  });
  return `<!DOCTYPE html>\n<html lang="zh-CN" data-build="__FINGERPRINT__" data-auth="guest">\n<head>\n`
    + `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n`
    + `<title>${esc(app.name)} · ${esc(reg.product)}</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n`
    + shell + overlay + '\n'
    + sharedUi.renderLogin({ product: reg.product, appName: app.name, userLabel: '买家', gate: false })
    + `\n<script>\n${sharedUi.MALL_SCRIPT}\n${sharedUi.LOGIN_SCRIPT}\n</script>\n</body>\n</html>\n`;
}

function buildPdaHtml(app, entries, built, sharedUi) {
  const esc = sharedUi.esc;
  const css = [sharedUi.TOKENS_CSS, sharedUi.BASE_CSS, sharedUi.LOGIN_CSS, sharedUi.PDA_CSS, ...built.styles].join('\n');
  const home = entries.find((e) => e.page.key === 'pda-login')
    || entries.find((e) => e.page.key === 'pda-home')
    || entries[0];
  const mine = entries.find((e) => e.page.key === 'pda-mine');
  const ordered = [home, ...entries.filter((e) => e !== home)];
  const sectionOf = new Map();
  for (const s of built.sections) {
    const m = s.match(/data-page-id="([^"]+)"/);
    if (m) sectionOf.set(m[1], s);
  }
  const sections = ordered.map((e) => sectionOf.get(e.pageId)).filter(Boolean).join('\n');
  const tabs = ordered.map((e) => ({ id: e.pageId, name: e.page.name }));
  let operator = '';
  let device = '';
  const scanEntry = entries.find((e) => e.page.type === 'scan');
  if (scanEntry) {
    try {
      const d = JSON.parse(read(scanEntry.dataFile) || '{}');
      operator = (d.task && d.task.operator) || '';
      device = (d.task && d.task.device) || '';
    } catch (err) { operator = ''; device = ''; }
  }
  const shell = sharedUi.renderPdaShell({
    product: reg.product,
    appName: app.name,
    operator,
    device,
    tabs,
    sections,
    minePageId: mine ? mine.pageId : '',
  });
  return `<!DOCTYPE html>\n<html lang="zh-CN" data-build="__FINGERPRINT__" data-auth="guest">\n<head>\n`
    + `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n`
    + `<title>${esc(app.name)} · ${esc(reg.product)}</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n`
    + shell + `\n<div class="wx-toast" hidden></div>\n`
    + sharedUi.renderLogin({ product: reg.product, appName: app.name, userLabel: reg.subject, demoOwners: [], gate: false })
    + `\n<script>\n${sharedUi.PDA_SCRIPT}\n${sharedUi.LOGIN_SCRIPT}\n</script>\n</body>\n</html>\n`;
}

function navGroups(app, entries) {
  if (!app.nav) {
    const groups = [];
    for (const e of entries) {
      let g = groups.find((x) => x.id === e.module.id);
      if (!g) { g = { id: e.module.id, name: e.module.name, pages: [] }; groups.push(g); }
      g.pages.push({ id: e.pageId, name: e.page.name });
    }
    return groups;
  }
  const byId = new Map(entries.map((e) => [e.pageId, e]));
  return app.nav.map((g) => ({
    id: g.id,
    name: g.name,
    pages: g.pages.map((id) => ({ id, name: byId.has(id) ? byId.get(id).page.name : id })),
  }));
}

function buildHtml(app, entries, built, sharedUi) {
  if (app.shell === 'mall') return buildMallHtml(app, entries, built, sharedUi);
  if (app.shell === 'pda') return buildPdaHtml(app, entries, built, sharedUi);
  const esc = sharedUi.esc;
  const groups = navGroups(app, entries);
  const groupOf = new Map();
  for (const g of groups) for (const p of g.pages) groupOf.set(p.id, g.id);
  const sections = built.sections.map((s) => {
    const m = s.match(/data-page-id="([^"]+)"/);
    const gid = m && groupOf.get(m[1]);
    return gid ? s.replace('<section class="page"', `<section class="page" data-nav-group="${esc(gid)}"`) : s;
  });
  const side = groups.map((g) => `<div class="wx-nav-group">`
    + `<button type="button" class="wx-nav-item" data-nav="${esc(g.id)}" aria-expanded="false"><span class="wx-nav-label">${esc(g.name)}</span><span class="wx-nav-chevron">⌄</span></button>`
    + `<div class="wx-nav-children" data-children="${esc(g.id)}" hidden>`
    + g.pages.map((p) => `<button type="button" class="wx-side-item" data-target="${esc(p.id)}">${esc(p.name)}</button>`).join('')
    + `</div></div>`).join('');
  const headTabs = groups.map((g) => `<div class="wx-head-tabs" data-tabs="${esc(g.id)}" hidden>`
    + g.pages.map((p) => `<button type="button" class="wx-head-tab" data-target="${esc(p.id)}">${esc(p.name)}</button>`).join('')
    + `</div>`).join('');
  const isOwnerApp = app.id === 'erp-app';
  const userLabel = isOwnerApp ? (demoOwners()[0] || '') : reg.subject;
  const mall = mallTarget();
  const mallEntry = isOwnerApp && mall
    ? `<a class="wx-top-mall" href="${encodeURI(mall.href)}?owner=${encodeURIComponent(demoOwners()[0] || '')}" target="_blank" rel="noopener" data-mall-entry data-mall-base="${encodeURI(mall.href)}">前往商城</a>`
    : '';
  const css = [sharedUi.TOKENS_CSS, sharedUi.BASE_CSS, sharedUi.LOGIN_CSS, ...built.styles].join('\n');
  const overlay = built.overlays.length
    ? `<div class="wx-overlay" hidden><button type="button" class="wx-drawer" data-drawer-close aria-label="关闭抽屉"></button>${built.overlays.join('')}</div>`
    : '';
  return `<!DOCTYPE html>\n<html lang="zh-CN" data-build="__FINGERPRINT__" data-auth="guest">\n<head>\n`
    + `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n`
    + `<title>${esc(app.name)} · ${esc(reg.product)}</title>\n<style>\n${css}\n</style>\n</head>\n<body>\n`
    + `<div class="wx-app">\n`
    + `<header class="wx-top">`
    + `<div class="wx-brand"><span class="wx-brand-mark">仓</span><span class="wx-brand-copy"><b>${esc(reg.product)}</b><small>${esc(app.name)}</small></span></div>`
    + `<div class="wx-global-search"><input type="text" placeholder="搜索页面" aria-label="搜索页面" data-global-search></div>`
    + `<div class="wx-top-tools">${mallEntry}<button type="button" class="wx-top-tool" title="帮助" data-toast="帮助（原型示意）">帮助</button>`
    + `<button type="button" class="wx-top-tool" title="通知" data-toast="通知（原型示意）">通知</button>`
    + `<button type="button" class="wx-user" data-session-toggle title="账号与会话"><span class="wx-user-avatar" data-top-avatar>${esc(userLabel ? userLabel.slice(0, 1) : '·')}</span><span data-top-user>${esc(userLabel)}</span></button></div></header>\n`
    + `<div class="wx-shell"><aside class="wx-side"><div class="wx-side-scroll">${side}</div>`
    + `<div class="wx-side-footer"><button type="button" class="wx-side-toggle" data-side-toggle title="收起侧栏" aria-label="收起侧栏">‹</button></div></aside>\n`
    + `<main class="wx-main"><div class="wx-page-header">${headTabs}</div>\n`
    + `<div class="wx-page-body">${sections.join('\n')}</div></main></div>\n`
    + `<div class="wx-toast" hidden></div></div>\n`
    + overlay + `\n` + sharedUi.renderLogin({ product: reg.product, appName: app.name, userLabel, demoOwners: isOwnerApp ? demoOwners() : [] })
    + `\n<script>\n${sharedUi.SHELL_SCRIPT}\n${sharedUi.LOGIN_SCRIPT}\n</script>\n</body>\n</html>\n`;
}

function checkProduct(html, entries, app) {
  if (/https?:\/\//i.test(html)) bad('自包含', `${app.name} 产物出现 http(s) 外链`);
  if (/<script[^>]+src\s*=/i.test(html) || /<link[^>]+href\s*=/i.test(html) || /@import/i.test(html)) bad('自包含', `${app.name} 产物出现外部脚本 / 样式引用`);
  for (const w of SAAS_WORDS) if (html.includes(w)) bad('非SaaS', `${app.name} 产物出现红线词「${w}」`);
  for (const w of DOC_WORDS) if (html.includes(w)) bad('文案', `${app.name} 产物出现过程文字「${w}」`);
  if (/__[A-Z_]+__/.test(html)) bad('文案', `${app.name} 产物残留模板占位符`);
  if (!html.includes('class="wx-login-layer"')) bad('登录', `${app.name} 产物缺登录层`);
  if (!html.includes('var ERR = {')) bad('登录', `${app.name} 产物缺统一错误提示表`);
  if (app.shell === 'mall') {
    if (!html.includes('class="wx-shop-app"')) bad('商城', `${app.name} 产物缺前台外壳`);
    if (!html.includes('data-shop-cart-count')) bad('商城', `${app.name} 产物缺进货单入口`);
    if (!html.includes('data-login-gate="0"')) bad('商城', `${app.name} 产物未启用访客首页`);
    if (!html.includes('data-login-open')) bad('商城', `${app.name} 产物缺登录入口`);
    if (html.includes('class="wx-app"')) bad('商城', `${app.name} 前台端混用了后台外壳`);
  } else if (html.includes('class="wx-shop-app"')) {
    bad('商城', `${app.name} 后台端混用了商城外壳`);
  }
  if (app.shell === 'pda') {
    if (!html.includes('class="wx-pda"')) bad('PDA', `${app.name} 产物缺手机外壳`);
    if (html.includes('class="wx-shell"')) bad('PDA', `${app.name} 产物不应出现后台侧栏`);
    if (html.includes('class="wx-owner-select"')) bad('PDA', `${app.name} 产物不应出现货主切换下拉`);
    const keyCount = (html.match(/data-pda-key="/g) || []).length;
    if (keyCount < 6) bad('PDA', `${app.name} 产物缺物理键盘（当前 ${keyCount} 个键）`);
    if (!html.includes('class="wx-pda-status"')) bad('PDA', `${app.name} 产物缺状态栏`);
    const boot = (html.match(/class="wx-pda"[^>]*data-boot="([^"]+)"/) || [])[1];
    if (!boot) bad('PDA', `${app.name} 产物缺首屏启动页 data-boot`);
    else if (!html.includes(`data-page-id="${boot}"`)) bad('PDA', `${app.name} 的 data-boot=${boot} 不在产物页清单内`);
    if (!html.includes("getAttribute('data-boot')")) bad('PDA', `${app.name} 外壳脚本未消费 data-boot，打开会停留在空白首屏`);
  }
  if (app.id === 'erp-app') {
    if (html.includes('<select class="wx-owner-select"')) bad('货灵ERP', `${app.name} 产物不应出现货主切换下拉`);
    if (html.includes('data-filter-key="owner"')) bad('货灵ERP', `${app.name} 产物不应出现货主筛选控件`);
    const owners = demoOwners();
    for (const ov of owners) {
      if (!html.includes(`data-owner-view="${ov}"`)) bad('货灵ERP', `${app.name} 产物缺演示身份「${ov}」的页面视图`);
    }
    for (const m of html.matchAll(/<section class="page"[^>]*data-owner-view="([^"]*)"[^>]*>([\s\S]*?)<\/section>/g)) {
      for (const other of owners) {
        if (other !== m[1] && m[2].includes(other)) bad('货灵ERP', `${app.name} 身份「${m[1]}」的页面出现其它货主「${other}」的数据`);
      }
    }
  }
  const mall = mallTarget();
  const crossLinks = html.match(/<a\s[^>]*href="[^"]*\.html[^"]*"[^>]*>[\s\S]*?<\/a>/g) || [];
  if (app.id === 'erp-app') {
    if (!mall) bad('跨端', '注册表缺商城端，货灵ERP 无法生成「前往商城」入口');
    else {
      const hits = crossLinks.filter((t) => t.includes('data-mall-entry'));
      if (hits.length !== 1 || crossLinks.length !== 1) bad('跨端', `${app.name} 应恰好有一个「前往商城」入口，当前 ${hits.length} 个`);
      else {
        const tag = hits[0];
        if (!tag.includes(`href="${encodeURI(mall.href)}?owner=`)) bad('跨端', `${app.name} 的「前往商城」未指向 ${mall.href} 或未带 owner 参数`);
        if (!tag.includes(`data-mall-base="${encodeURI(mall.href)}"`)) bad('跨端', `${app.name} 的「前往商城」缺链接基准，运行时无法同步身份`);
        if (!tag.includes('target="_blank"')) bad('跨端', `${app.name} 的「前往商城」未在新页面打开`);
        if (!tag.includes('rel="noopener"')) bad('跨端', `${app.name} 的「前往商城」缺 rel="noopener"`);
        if (!tag.includes('>前往商城</a>')) bad('跨端', `${app.name} 的「前往商城」文案不合规`);
      }
    }
  } else if (crossLinks.length) {
    bad('跨端', `${app.name} 不应出现跨端 HTML 链接`);
  }
  for (const e of entries) if (!html.includes(`data-page-id="${e.pageId}"`)) bad('页面装配', `${app.name} 缺页面容器 ${e.pageId}`);
  for (const m of html.matchAll(/<button[^>]*class="wx-tab[^"]*"[^>]*>/g)) {
    if (m[0].includes('data-tab-all')) continue;
    if (!m[0].includes('data-tab-field') || !/data-tab-value="[^"]+"/.test(m[0])) bad('页签', `${app.name} 状态页签缺 field / value`);
  }
  const drawerIds = new Set([...html.matchAll(/data-drawer-panel="([^"]+)"/g)].map((m) => m[1]));
  for (const id of new Set([...html.matchAll(/data-drawer-open="([^"]+)"/g)].map((m) => m[1]))) {
    if (!drawerIds.has(id)) bad('抽屉', `${app.name} 抽屉入口 ${id} 没有对应面板`);
  }
  for (const m of html.matchAll(/data-drawer-open="([^"]+)" data-drawer-key="([^"]+)"/g)) {
    if (!html.includes(`data-drawer-panel="${m[1]}" data-drawer-key="${m[2]}"`)) {
      bad('抽屉', `${app.name} 抽屉入口 ${m[1]}/${m[2]} 找不到详情面板`);
    }
  }
}

function fingerprint(entries) {
  const files = [
    path.join(PROTO, 'build-app.mjs'),
    path.join(SHARED, 'modules.json'),
    path.join(SHARED, 'tokens.css.mjs'),
    path.join(SHARED, 'ui.mjs'),
  ];
  const masterDir = path.join(SHARED, 'data');
  if (fs.existsSync(masterDir)) {
    for (const f of fs.readdirSync(masterDir).filter((x) => x.endsWith('.json')).sort()) files.push(path.join(masterDir, f));
  }
  for (const e of entries) { files.push(e.file); if (fs.existsSync(e.dataFile)) files.push(e.dataFile); }
  const h = createHash('sha256');
  for (const f of [...new Set(files)].sort()) { h.update(rel(f)); h.update('\0'); h.update(read(f) || ''); h.update('\0'); }
  return h.digest('hex');
}

const distOf = (app) => path.join(DIST, `${app.name}.html`);

if (CHECK) {
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
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
if (!sharedUi.TOKENS_CSS || !sharedUi.BASE_CSS || !sharedUi.SHELL_SCRIPT
  || !sharedUi.LOGIN_CSS || !sharedUi.LOGIN_SCRIPT || typeof sharedUi.renderLogin !== 'function'
  || !sharedUi.MALL_CSS || !sharedUi.MALL_SCRIPT || typeof sharedUi.renderShopShell !== 'function'
  || !sharedUi.PDA_CSS || !sharedUi.PDA_SCRIPT || typeof sharedUi.renderPdaShell !== 'function') {
  bad('装配清单', 'shared/ui.mjs 缺少必要导出、登录层或商城外壳组件');
}
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
  console.log(`build ok：${rel(distOf(app))}（${entries.length} 页${app.id === 'erp-app' ? ` × ${demoOwners().length} 身份` : ''}，${hash.slice(0, 8)}）`);
}
