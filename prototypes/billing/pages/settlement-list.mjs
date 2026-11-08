import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待审核', type: 'pending' },
    sent: { label: '已发送', type: 'info' },
    confirmed: { label: '已确认', type: 'info' },
    completed: { label: '已完成', type: 'enabled' },
    rejected: { label: '已驳回', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const INVOICE_META = { uninvoiced: { label: '未开票', type: 'pending' }, invoiced: { label: '已开票', type: 'enabled' } };

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.settlementStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待审核', count: count('pending'), field: 'settlementStatus', value: 'pending' },
      { label: '已发送', count: count('sent'), field: 'settlementStatus', value: 'sent' },
      { label: '已确认', count: count('confirmed'), field: 'settlementStatus', value: 'confirmed' },
      { label: '已完成', count: count('completed'), field: 'settlementStatus', value: 'completed' },
      { label: '已驳回', count: count('rejected'), field: 'settlementStatus', value: 'rejected' },
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
      { key: 'settlementNo', label: '结算单号', width: '160px', render: (r) => dash(r.settlementNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'billType', label: '账单类型', render: (r) => dash(r.billType) },
      { key: 'period', label: '账期', width: '100px', render: (r) => dash(r.period) },
      { key: 'billCount', label: '账单数', width: '90px', align: 'right', render: (r) => n(r.billCount) },
      { key: 'currency', label: '币种', width: '80px', render: (r) => dash(r.currency) },
      { key: 'amountWithTax', label: '含税金额', width: '120px', align: 'right', render: (r) => n(r.amountWithTax) },
      { key: 'invoiceStatus', label: '开票状态', width: '100px', render: (r) => StatusTag((INVOICE_META[r.invoiceStatus] || {}).label || dash(r.invoiceStatus), (INVOICE_META[r.invoiceStatus] || {}).type || 'info') },
      { key: 'settlementStatus', label: '结算状态', width: '108px', render: (r) => StatusTag(labelOf(r.settlementStatus), toneOf(r.settlementStatus)) },
      { key: 'approver', label: '审批人', render: (r) => dash(r.approver) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.settlementStatus }),
    emptyTitle: '暂无结算单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
