import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    unpaid: { label: '待收款', type: 'pending' },
    partial: { label: '部分收款', type: 'info' },
    paid: { label: '已收款', type: 'enabled' },
    overdue: { label: '逾期', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.receiveStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待收款', count: count('unpaid'), field: 'receiveStatus', value: 'unpaid' },
      { label: '部分收款', count: count('partial'), field: 'receiveStatus', value: 'partial' },
      { label: '已收款', count: count('paid'), field: 'receiveStatus', value: 'paid' },
      { label: '逾期', count: count('overdue'), field: 'receiveStatus', value: 'overdue' },
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
      { key: 'invoiceNo', label: '发票号', width: '160px', render: (r) => dash(r.invoiceNo) },
      { key: 'settlementNo', label: '结算单号', width: '160px', render: (r) => dash(r.settlementNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'invoiceType', label: '发票类型', render: (r) => dash(r.invoiceType) },
      { key: 'amount', label: '开票金额', width: '120px', align: 'right', render: (r) => n(r.amount) },
      { key: 'receivedAmount', label: '已收金额', width: '120px', align: 'right', render: (r) => n(r.receivedAmount) },
      { key: 'receiveStatus', label: '收款状态', width: '108px', render: (r) => StatusTag(labelOf(r.receiveStatus), toneOf(r.receiveStatus)) },
      { key: 'dueDate', label: '到期日', width: '120px', render: (r) => dash(r.dueDate) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.receiveStatus }),
    emptyTitle: '暂无发票与收款',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
