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
  const { task = {}, back = {}, scan = {} } = data[ctx.pageKey] || {};
  const plan = Number(task.planQty || 0);
  const done = Number(task.doneQty || 0);
  const unit = task.qtyUnit || '件';
  const pct = plan ? Math.min(100, Math.round((done / plan) * 100)) : 0;
  const row = (label, value) => `<div class="wx-pda-kv-row"><span>${label}</span><b>${esc(value ?? '—')}</b></div>`;

  const kv = `<div class="wx-pda-kv">`
    + row('任务编号', task.taskNo)
    + `<div class="wx-pda-kv-row"><span>任务状态</span><b>${StatusTag(labelOf(task.taskStatus), toneOf(task.taskStatus))}</b></div>`
    + row('货主', task.owner)
    + row('商品编码', task.skuCode)
    + row('商品名称', task.skuName)
    + row('目标库位', task.bin)
    + row('计划数量', plan)
    + row('已做数量', done)
    + row('操作员', task.operator)
    + row('设备', task.device)
    + `</div>`;

  const progress = `<div class="tk-pda-detail-progress">`
    + `<div class="wx-pda-kv-row"><span>作业进度</span><b>${done} / ${plan} ${esc(unit)}</b></div>`
    + `<div class="wx-pda-progress"><i style="width:${pct}%"></i></div></div>`;

  const actions = `<div class="tk-pda-detail-actions">`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="${esc(back.tab)}" data-pda-tab-name="${esc(back.name)}">返回</button>`
    + `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="${esc(scan.tab)}" data-pda-tab-name="${esc(scan.name)}">开始作业</button>`
    + `</div>`;

  return ListPage({ unit: '项', bare: true, body: `<div class="tk-pda-detail">${kv}${progress}${actions}</div>`, rows: [] });
}

export const PAGE_CSS = `
.tk-pda-detail{display:flex;flex-direction:column;gap:var(--wx-sp-3)}
.tk-pda-detail-progress{display:flex;flex-direction:column;gap:var(--wx-sp-2);padding:var(--wx-sp-3);background:var(--wx-white);border-radius:var(--wx-r-md)}
.tk-pda-detail-progress .wx-pda-kv-row b{font-size:var(--wx-fs-xl)}
.tk-pda-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:var(--wx-sp-2)}
.tk-pda-detail-actions .wx-btn{min-height:var(--wx-touch)}
`;
