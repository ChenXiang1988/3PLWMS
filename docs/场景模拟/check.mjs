#!/usr/bin/env node
/**
 * 场景模拟分类自检（货灵供应链运营平台）
 *
 * 校验 docs/场景模拟/ 的命名规范与章节完整性（规则见 场景模拟/index.md「使用规则」）：
 *   - 场景文件命名 SC<NN>-<短名>.md，编号从 01 连续不跳号
 *   - 每个场景文件含七个 H2 章节：场景描述 / 参与角色 / 触发条件 / 正常流程 / 异常流程 / 闭环条件 / 闭环验证
 *   - index.md 场景索引与文件双向闭环（索引登记的文件都存在、存在的文件都登记）
 *
 * 用法：node docs/场景模拟/check.mjs
 * 退出码：发现错误=1，否则 0（仅警告仍算通过）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REQUIRED = ['场景描述', '参与角色', '触发条件', '正常流程', '异常流程', '闭环条件', '闭环验证'];
const errors = [];
const warns = [];
const err = (m) => errors.push('[错误] ' + m);
const warn = (m) => warns.push('[警告] ' + m);

const files = fs.readdirSync(DIR).filter((f) => /^SC\d{2}-.+\.md$/.test(f)).sort();

// A. 命名连续 + 章节齐全
let prev = 0;
for (const f of files) {
  const n = parseInt(f.match(/^SC(\d{2})/)[1], 10);
  if (n !== prev + 1) err(`编号不连续：期望 SC${String(prev + 1).padStart(2, '0')}，实际 ${f}`);
  prev = n;
  const text = fs.readFileSync(path.join(DIR, f), 'utf8');
  const heads = [...text.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => m[1].trim());
  for (const r of REQUIRED) {
    if (!heads.includes(r)) err(`${f} 缺少章节「${r}」`);
  }
}

// B. 索引与文件双向闭环
const idx = fs.readFileSync(path.join(DIR, 'index.md'), 'utf8');
const idxSet = new Set([...idx.matchAll(/SC\d{2}-[^\]()\s]+\.md/g)].map((m) => m[0]));
for (const f of files) {
  if (!idxSet.has(f)) err(`场景文件未在索引登记：${f}`);
}
for (const l of idxSet) {
  if (!files.includes(l)) err(`索引登记了不存在的文件：${l}`);
}

console.log('场景模拟自检：');
if (!errors.length && !warns.length) console.log('  ✓ 全部通过');
else {
  errors.forEach((e) => console.log('  ' + e));
  warns.forEach((w) => console.log('  ' + w));
}
console.log(`  场景文件=${files.length} 章节校验=${REQUIRED.length} 索引登记=${idxSet.size} 错误=${errors.length} 警告=${warns.length}`);
process.exit(errors.length ? 1 : 0);
