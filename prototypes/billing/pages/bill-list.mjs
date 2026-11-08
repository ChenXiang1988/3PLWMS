import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待确认', type: 'pending' },
    confirmed: { label: '已确认', type: 'enabled' },
    disputed: { label: '已申诉', type: 'info' },
    closed: { label: '已关闭', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.billStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待确认', count: count('pending'), field: 'billStatus', value: 'pending' },
      { label: '已确认', count: count('confirmed'), field: 'billStatus', value: 'confirmed' },
      { label: '已申诉', count: count('disputed'), field: 'billStatus', value: 'disputed' },
      { label: '已关闭', count: count('closed'), field: 'billStatus', value: 'closed' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'billNo', label: '账单编号', width: '160px', render: (r) => dash(r.billNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'period', label: '账期', width: '100px', render: (r) => dash(r.period) },
      { key: 'amount', label: '费用合计', width: '120px', align: 'right', render: (r) => n(r.amount) },
      { key: 'confirmed', label: '已确认金额', width: '120px', align: 'right', render: (r) => n(r.confirmed) },
      { key: 'billStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.billStatus), toneOf(r.billStatus)) },
      { key: 'sourceCount', label: '来源单据数', width: '120px', align: 'right', render: (r) => n(r.sourceCount) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.billStatus }),
    emptyTitle: '暂无费用账单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
