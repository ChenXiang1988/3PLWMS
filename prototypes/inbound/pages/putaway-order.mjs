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
  const count = (s) => rows.filter((r) => r.putawayStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待作业', count: count('wait'), field: 'putawayStatus', value: 'wait' },
      { label: '作业中', count: count('busy'), field: 'putawayStatus', value: 'busy' },
      { label: '异常', count: count('blocked'), field: 'putawayStatus', value: 'blocked' },
      { label: '已完成', count: count('done'), field: 'putawayStatus', value: 'done' },
      { label: '已取消', count: count('closed'), field: 'putawayStatus', value: 'closed' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '目标库区', key: 'targetZone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.targetZone))] },
      { label: '上架单号', key: 'putawayNo', type: 'text', placeholder: '请输入上架单号', extra: true },
    ],
    toolbar: [
      { label: '生成上架单', toast: '生成上架单（原型示意）' },
      { label: '拆任务', ghost: true, toast: '拆任务（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'putawayNo', label: '上架单号', width: '160px', cls: 'wx-col-strong' },
      {
        key: 'putawayStatus', label: '上架单状态', width: '108px',
        render: (r) => StatusTag(labelOf(r.putawayStatus), toneOf(r.putawayStatus)),
      },
      { key: 'targetZone', label: '目标库区', width: '120px', render: (r) => dash(r.targetZone) },
      { key: 'sourcePlans', label: '来源计划单', render: (r) => dash(r.sourcePlans) },
      { key: 'rowCount', label: '行数', width: '100px', align: 'right', render: (r) => n(r.rowCount) },
      { key: 'planQty', label: '计划上架量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'doneQty', label: '已上架数量', width: '120px', align: 'right', render: (r) => n(r.doneQty) },
      { key: 'execUnit', label: '执行单元', width: '120px', render: (r) => dash(r.execUnit) },
      { key: 'progress', label: '作业进度', width: '160px', render: (r) => ProgressCell(r.doneQty, r.planQty) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.putawayStatus }),
    emptyTitle: '暂无上架单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
