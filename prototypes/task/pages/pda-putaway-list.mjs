import { ListPage, StatusTag, esc } from '../../shared/ui.mjs';

export const STATUS_META = {
  wait: { label: '待作业', type: 'pending' },
  busy: { label: '作业中', type: 'enabled' },
  blocked: { label: '异常', type: 'rejected' },
  done: { label: '已完成', type: 'disabled' },
  closed: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};

  return ListPage({
    unit: '条',
    bare: true,
    rows,
    card: (r) => `<button type="button" class="wx-pda-taskcard" data-pda-tab="inbound/receiving-scan" data-pda-tab-name="收货验收">`
      + `<span class="wx-pda-task-head"><b class="wx-pda-task-id">${esc(r.taskNo)}</b>`
      + `${StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus))}</span>`
      + `<span class="wx-pda-task-meta"><span>${esc(r.owner)}</span><span>${esc(r.skuCode)}</span>`
      + `<span>${esc(r.skuName)}</span></span>`
      + `<span class="wx-pda-task-foot"><span>目标库位 ${esc(r.targetBin)}</span>`
      + `<span>${esc(r.doneQty)} / ${esc(r.planQty)}</span></span>`
      + `</button>`,
    emptyTitle: '暂无待办',
    emptyDesc: '该模块当前没有待作业任务',
  });
}

export const PAGE_CSS = ``;
