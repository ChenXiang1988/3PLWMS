import { ListPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { unit = '', device = '', zone = '', rows = [] } = data[ctx.pageKey] || {};
  const pending = (t) => rows.filter((r) => r.taskType === t
    && (r.taskStatus === 'wait' || r.taskStatus === 'busy')).length;

  const entries = [
    { tab: 'task/pda-putaway-list', name: '上架作业任务', icon: '↥', qty: pending('上架') },
    { tab: 'task/pda-picking-list', name: '拣货任务', icon: '⇢', qty: pending('拣货') },
    { tab: 'task/pda-stocktaking-list', name: '盘点作业任务', icon: '✓', qty: pending('盘点') },
  ];

  const before = `<div class="wx-pda-ctx">`
    + `<div class="wx-pda-ctx-row"><span>执行单元</span><b>${esc(unit)}</b></div>`
    + `<div class="wx-pda-ctx-row"><span>终端</span><b>${esc(device)}</b></div>`
    + `<div class="wx-pda-ctx-row"><span>区域</span><b>${esc(zone)}</b></div>`
    + `</div>`;

  return ListPage({
    unit: '条',
    bare: true,
    before,
    rows: entries,
    card: (e) => `<button type="button" class="wx-pda-entry" data-pda-tab="${e.tab}" data-pda-tab-name="${e.name}">`
      + `<span class="wx-pda-entry-icon">${e.icon}</span>`
      + `<span class="wx-pda-entry-body"><b>${e.name}</b>`
      + `<small>${e.qty ? `待办 ${e.qty} 条` : '暂无待办'}</small></span>`
      + `<span class="wx-pda-entry-arrow">›</span></button>`,
    emptyTitle: '暂无待办',
    emptyDesc: '该模块当前没有待作业任务',
  });
}

export const PAGE_CSS = ``;
