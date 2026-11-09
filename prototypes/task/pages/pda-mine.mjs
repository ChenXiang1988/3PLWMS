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

  const entry = (tab, name, icon, sub) => `<button type="button" class="wx-pda-entry" data-pda-tab="${tab}" data-pda-tab-name="${name}">`
    + `<span class="wx-pda-entry-icon">${icon}</span>`
    + `<span class="wx-pda-entry-body"><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</span>`
    + `<span class="wx-pda-entry-arrow">›</span></button>`;

  const entries = `<div class="wx-pda-stack">`
    + `<button type="button" class="wx-pda-entry" data-toast="我的权限（原型示意）">`
    + `<span class="wx-pda-entry-icon">◈</span>`
    + `<span class="wx-pda-entry-body"><b>我的权限</b><small>${esc(doc.roleName)} · ${esc(doc.warehouseScope)}</small></span>`
    + `<span class="wx-pda-entry-arrow">›</span></button>`
    + entry('pda/pda-my-device', '我的设备', '▣', '')
    + entry('pda/pda-face', '人脸识别', '☻', '')
    + entry('pda/pda-invite', '接入自带手机', '⇄', '')
    + entry('pda/pda-activate', '激活本机', '✓', '')
    + entry('pda/pda-version', '版本与更新', '⤓', '')
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="pda/pda-login" data-pda-tab-name="登录">退出登录</button>`
    + `</div>`;

  return ReportPage({ hero: head, stats, blocks: [Block({ title: '明细', note: '', body: entries })] });
}

export const PAGE_CSS = `
.wx-pda .wx-stat-row{grid-template-columns:repeat(4,1fr)!important;gap:var(--wx-sp-2)}
.wx-pda .wx-stat{padding:var(--wx-sp-2);border-radius:8px}
.wx-pda .wx-stat span{font-size:var(--wx-fs-xs)}
.wx-pda .wx-stat b{font-size:var(--wx-fs-lg)}
`;
