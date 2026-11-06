import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.checkStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待处理', count: count('pending'), field: 'checkStatus', value: 'pending' },
      { label: '进行中', count: count('doing'), field: 'checkStatus', value: 'doing' },
      { label: '异常待处理', count: count('exception'), field: 'checkStatus', value: 'exception' },
      { label: '已完成', count: count('completed'), field: 'checkStatus', value: 'completed' },
      { label: '已取消', count: count('cancelled'), field: 'checkStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '检查单号', key: 'checkNo', type: 'text', placeholder: '请输入检查单号' },
      { label: '检查日期', key: 'checkDate', type: 'date', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'checkNo', label: '检查单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'checkStatus', label: '检查状态', width: '108px', render: (r) => StatusTag(labelOf(r.checkStatus), toneOf(r.checkStatus)) },
      { key: 'checkDate', label: '检查日期', width: '120px', render: (r) => dash(r.checkDate) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'binCount', label: '库位数', width: '120px', align: 'right', render: (r) => n(r.binCount) },
      { key: 'diffCount', label: '差异数', width: '120px', align: 'right', render: (r) => n(r.diffCount) },
      { key: 'handler', label: '处理人', width: '120px', render: (r) => dash(r.handler) },
      { key: 'finishTime', label: '完成时间', width: '157px', render: (r) => dash(r.finishTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.checkStatus }),
    emptyTitle: '暂无日清检查',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
