import { ListPage, StatusTag, ProgressCell, n, dash, uniq } from '../../shared/ui.mjs';

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
  const count = (s) => rows.filter((r) => r.taskStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待作业', count: count('wait'), field: 'taskStatus', value: 'wait' },
      { label: '作业中', count: count('busy'), field: 'taskStatus', value: 'busy' },
      { label: '异常', count: count('blocked'), field: 'taskStatus', value: 'blocked' },
      { label: '已完成', count: count('done'), field: 'taskStatus', value: 'done' },
      { label: '已取消', count: count('closed'), field: 'taskStatus', value: 'closed' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '任务编号', key: 'taskNo', type: 'text', placeholder: '请输入任务编号' },
      { label: '来源库位', key: 'fromBin', type: 'text', placeholder: '请输入来源库位', extra: true },
    ],
    toolbar: [
      { label: '批量确认', toast: '批量确认（原型示意）' },
      { label: '批量异常登记', ghost: true, toast: '批量异常登记（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'taskNo', label: '任务编号', width: '160px', cls: 'wx-col-strong' },
      {
        key: 'taskStatus', label: '任务状态', width: '108px',
        render: (r) => StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)),
      },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'fromBin', label: '来源库位', width: '120px', render: (r) => dash(r.fromBin) },
      { key: 'toBin', label: '目标库位', width: '120px', render: (r) => dash(r.toBin) },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'doneQty', label: '已补数量', width: '120px', align: 'right', render: (r) => n(r.doneQty) },
      { key: 'progress', label: '作业进度', width: '160px', render: (r) => ProgressCell(r.doneQty, r.planQty) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.taskStatus }),
    emptyTitle: '暂无补货任务',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
