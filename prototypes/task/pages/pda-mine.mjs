import { StatRow, Block, ReportPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};
  const num = (k) => Number(doc[k] || 0);

  const stats = StatRow([
    { label: '今日完成', value: num('doneToday'), tone: 'ok' },
    { label: '上架', value: num('putawayCount'), tone: 'default' },
    { label: '拣货', value: num('pickingCount'), tone: 'default' },
    { label: '盘点', value: num('countCount'), tone: 'default' },
  ], { cols: 4 });

  const head = `<div class="wx-pda-mine-head">`
    + `<span class="wx-pda-mine-avatar">${esc(String(doc.staffName || '·').slice(0, 1))}</span>`
    + `<span class="wx-pda-mine-info"><b>${esc(doc.staffName)}</b>`
    + `<small>${esc(doc.zone)} · ${esc(doc.shift)}</small>`
    + `<small>${esc(doc.roleName)} · ${esc(doc.warehouseScope)}</small>`
    + `<small>设备 ${esc(doc.device)}</small></span></div>`;

  const entries = `<div class="wx-pda-stack">`
    + `<button type="button" class="wx-pda-entry" data-toast="我的权限（原型示意）">`
    + `<span class="wx-pda-entry-icon">◈</span>`
    + `<span class="wx-pda-entry-body"><b>我的权限</b><small>${esc(doc.roleName)} · ${esc(doc.warehouseScope)}</small></span>`
    + `<span class="wx-pda-entry-arrow">›</span></button>`
    + `<button type="button" class="wx-pda-entry" data-toast="我的设备（原型示意）">`
    + `<span class="wx-pda-entry-icon">▣</span>`
    + `<span class="wx-pda-entry-body"><b>我的设备</b><small>${esc(doc.device)} · 序列号与换机</small></span>`
    + `<span class="wx-pda-entry-arrow">›</span></button>`
    + `<button type="button" class="wx-pda-entry" data-toast="版本与更新（原型示意）">`
    + `<span class="wx-pda-entry-icon">⤓</span>`
    + `<span class="wx-pda-entry-body"><b>版本与更新</b><small>当前 v1.0.4 · 检查更新</small></span>`
    + `<span class="wx-pda-entry-arrow">›</span></button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-toast="退出登录（原型示意）">退出登录</button>`
    + `</div>`;

  return ReportPage({ hero: head, stats, blocks: [Block({ title: '明细', note: '', body: entries })] });
}

export const PAGE_CSS = `
.wx-pda .wx-stat-row{grid-template-columns:repeat(4,1fr)!important;gap:var(--wx-sp-2)}
.wx-pda .wx-stat{padding:var(--wx-sp-2);border-radius:8px}
.wx-pda .wx-stat span{font-size:var(--wx-fs-xs)}
.wx-pda .wx-stat b{font-size:var(--wx-fs-lg)}
`;
