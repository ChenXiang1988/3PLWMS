#!/usr/bin/env node
/**
 * 模块脚手架生成脚本（3pl-wms-proto skill）。
 *
 * 定位：把 templates/ 下的模板复制成「一个可独立装配的模块源目录」，并替换占位符。
 *       端构建入口 prototypes/build-app.mjs 由本脚本一并建立；模块目录不再单独出产物。
 *
 *   node init-module.mjs --list
 *   node init-module.mjs inbound
 *   node init-module.mjs --root <工作区路径> inbound
 *
 * 保护：prototypes/01 shared/ 与端构建入口已存在时不覆盖；目标模块目录已存在时直接拒绝。
 * 退出码：0 成功；1 参数或状态不满足；2 运行环境不满足。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.dirname(HERE);
const TEMPLATES = path.join(SKILL, 'templates');
const DEFAULT_ROOT = path.resolve(HERE, '..', '..', '..', '..');

const ARGS = process.argv.slice(2);
let ROOT = DEFAULT_ROOT;
let LIST = false;
let MODULE_ID = null;
for (let i = 0; i < ARGS.length; i++) {
  if (ARGS[i] === '--root' && ARGS[i + 1]) { ROOT = path.resolve(ARGS[++i]); continue; }
  if (ARGS[i] === '--list') { LIST = true; continue; }
  if (!ARGS[i].startsWith('--')) MODULE_ID = ARGS[i];
}
const PROTO = path.join(ROOT, 'prototypes');
const SHARED = path.join(PROTO, '01 shared');

const TEMPLATE_BY_TYPE = { list: 'page-list.mjs', detail: 'page-detail.mjs', report: 'page-report.mjs', scan: 'page-scan.mjs' };

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

function registry() {
  const f = fs.existsSync(path.join(SHARED, 'modules.json'))
    ? path.join(SHARED, 'modules.json')
    : path.join(TEMPLATES, 'modules.json');
  const s = read(f);
  if (s == null) { console.error(`找不到模块注册表：${f}`); process.exit(2); }
  return JSON.parse(s);
}

function list(reg) {
  console.log(`3PL 云仓原型端与模块清单（${reg.product} · ${reg.edition}）\n`);
  for (const a of reg.apps || []) {
    const n = (reg.modules || []).reduce((sum, m) => sum + (m.pages || []).filter((p) => p.app === a.id).length, 0);
    console.log(`  端 ${a.id.padEnd(10)} ${a.name.padEnd(8)} ${n} 页`);
  }
  console.log('');
  for (const m of reg.modules) {
    console.log(`  模块 ${m.id.padEnd(10)} ${m.name.padEnd(8)} ${String(m.prefix).padEnd(7)} `
      + `${m.tier === 'core' ? '核心' : '扩展'} ${m.deployed ? '已部署' : '未部署'} ${m.pages.length} 页  ${m.scope}`);
  }
  console.log('\n  初始化：node .codebuddy/skills/3pl-wms-proto/scripts/init-module.mjs <模块ID>');
}

function ensureShared() {
  if (!fs.existsSync(path.join(SHARED, 'modules.json'))) {
    fs.mkdirSync(SHARED, { recursive: true });
    for (const f of ['modules.json', 'tokens.css.mjs', 'ui.mjs']) {
      fs.copyFileSync(path.join(TEMPLATES, f), path.join(SHARED, f));
    }
    console.log(`✓ 已建立共享层：${rel(SHARED)}`);
  } else console.log(`· 共享层已存在，保持不变：${rel(SHARED)}`);
  const build = path.join(PROTO, 'build-app.mjs');
  if (!fs.existsSync(build)) {
    fs.copyFileSync(path.join(TEMPLATES, 'build-app.mjs'), build);
    console.log(`✓ 已建立端构建入口：${rel(build)}`);
  }
}

function ensureGitignore() {
  const rules = ['prototypes/00 dist/', 'prototypes/*/dist/'];
  const f = path.join(ROOT, '.gitignore');
  const s = read(f) || '';
  const lines = s.split(/\r?\n/).map((l) => l.trim());
  const missing = rules.filter((r) => !lines.includes(r));
  if (!missing.length) return;
  const next = (s ? s.replace(/\s*$/, '') + '\n' : '')
    + (lines.includes('# 3PL 云仓原型产物不入库（3pl-wms-proto）') ? '' : '# 3PL 云仓原型产物不入库（3pl-wms-proto）\n')
    + missing.join('\n') + '\n';
  fs.writeFileSync(f, next, 'utf8');
  console.log(`✓ 已写入 ${rel(f)}：${missing.join('、')}`);
}

function placeholders(text, ctx) {
  return text
    .replace(/__MODULE_ID__/g, ctx.moduleId)
    .replace(/__MODULE_NAME__/g, ctx.moduleName)
    .replace(/__PAGE_KEY__/g, ctx.pageKey)
    .replace(/__PAGE_NAME__/g, ctx.pageName)
    .replace(/__PREFIX__/g, ctx.prefix);
}

function initModule(id, reg) {
  const entry = reg.modules.find((m) => m.id === id);
  if (!entry) {
    console.error(`模块 ${id} 不在注册表里。可用 ID：${reg.modules.map((m) => m.id).join('、')}`);
    process.exit(1);
  }
  const dir = path.join(PROTO, id);
  if (fs.existsSync(dir)) {
    console.error(`模块目录已存在，拒绝覆盖：${rel(dir)}。需要补页面请手工从 templates/ 复制。`);
    process.exit(1);
  }

  ensureShared();
  fs.mkdirSync(path.join(dir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true });

  const manifest = JSON.parse(read(path.join(TEMPLATES, 'module.json')));
  manifest.id = id;
  manifest.name = entry.name;
  manifest.owner = entry.owner || '';
  manifest.tier = entry.tier;
  manifest.deployed = entry.deployed;
  manifest.scope = entry.scope || '';
  fs.writeFileSync(path.join(dir, 'module.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

  for (const p of entry.pages) {
    const tplName = TEMPLATE_BY_TYPE[p.type];
    if (!tplName) { console.error(`${p.key} 的 type=${p.type} 没有对应模板`); process.exit(1); }
    const tpl = read(path.join(TEMPLATES, tplName));
    const ctx = { moduleId: id, moduleName: entry.name, pageKey: p.key, pageName: p.name, prefix: `${entry.prefix}${p.key}` };
    const outFile = path.join(dir, p.file);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, placeholders(tpl, ctx), 'utf8');
    fs.writeFileSync(path.join(dir, 'data', `${p.key}.json`), JSON.stringify({ rows: [] }, null, 2) + '\n', 'utf8');
  }

  ensureGitignore();
  console.log(`✓ 模块 ${id}（${entry.name}）已生成：${rel(dir)}`);
  console.log(`  页面 ${entry.pages.length} 个：${entry.pages.map((p) => `${p.name}[${p.type}]`).join('、')}`);
  console.log(`  下一步：node prototypes/build-app.mjs`);
}

function main() {
  if (Number(process.versions.node.split('.')[0]) < 18) { console.error('Node 版本低于 18'); process.exit(2); }
  const reg = registry();
  if (LIST) { list(reg); return; }
  if (!MODULE_ID) { console.error('用法：node init-module.mjs <模块ID>  |  node init-module.mjs --list'); process.exit(1); }
  initModule(MODULE_ID, reg);
}

main();
