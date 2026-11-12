import { ListPage, FormDrawer, DrawerDetail, DrawerButton, StatusTag, dash, money, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待审核', type: 'pending' },
  sent: { label: '已发送', type: 'info' },
  confirmed: { label: '已确认', type: 'info' },
  completed: { label: '已完成', type: 'enabled' },
  rejected: { label: '已驳回', type: 'rejected' },
};

const INVOICE_META = {
  uninvoiced: { label: '未开票', type: 'pending' },
  invoiced: { label: '已开票', type: 'enabled' },
};

const BILL_STATUS_META = {
  pending: { label: '待确认', type: 'pending' },
  disputed: { label: '已申诉', type: 'info' },
  confirmed: { label: '已确认', type: 'enabled' },
  closed: { label: '已关闭', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const invoiceLabel = (s) => (INVOICE_META[s] || {}).label || s || '—';
const invoiceTone = (s) => (INVOICE_META[s] || {}).type || 'info';
const billLabel = (s) => (BILL_STATUS_META[s] || {}).label || s || '—';
const billTone = (s) => (BILL_STATUS_META[s] || {}).type || 'info';

const BILL_COLUMNS = [
  { key: 'billNo', label: '账单编号', width: '160px' },
  { key: 'period', label: '账期', width: '100px' },
  { key: 'totalAmount', label: '费用合计', width: '120px', align: 'right', render: (r) => money(r.totalAmount) },
  { key: 'invoiceStatus', label: '开票状态', width: '100px', render: (r) => StatusTag(invoiceLabel(r.invoiceStatus), invoiceTone(r.invoiceStatus)) },
  { key: 'billStatus', label: '账单状态', width: '108px', render: (r) => StatusTag(billLabel(r.billStatus), billTone(r.billStatus)) },
];

export function renderPage(data, ctx) {
  const { rows = [], bills = {}, traces = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.invoiceStatus === s).length;

  const columns = [
    { key: 'settlementNo', label: '结算单号', width: '160px', cls: 'wx-col-strong', render: (r) => dash(r.settlementNo) },
    { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
    { key: 'billType', label: '账单类型', width: '100px', render: (r) => dash(r.billType) },
    { key: 'period', label: '账期', width: '100px', render: (r) => dash(r.period) },
    { key: 'billCount', label: '账单数', width: '80px', align: 'right', render: (r) => n(r.billCount) },
    { key: 'sourceNo', label: '来源编号', width: '160px', render: (r) => dash(r.sourceNo) },
    { key: 'currency', label: '币种', width: '80px', render: (r) => dash(r.currency) },
    { key: 'taxRate', label: '税率', width: '80px', align: 'right', render: (r) => `${r.taxRate}%` },
    { key: 'amountBeforeTax', label: '不含税金额', width: '120px', align: 'right', render: (r) => money(r.amountBeforeTax) },
    { key: 'amountWithTax', label: '含税金额', width: '120px', align: 'right', render: (r) => money(r.amountWithTax) },
    { key: 'invoiceStatus', label: '开票状态', width: '100px', render: (r) => StatusTag(invoiceLabel(r.invoiceStatus), invoiceTone(r.invoiceStatus)) },
    { key: 'settlementStatus', label: '结算状态', width: '108px', render: (r) => StatusTag(labelOf(r.settlementStatus), toneOf(r.settlementStatus)) },
    { key: 'approver', label: '审批人', width: '100px', render: (r) => dash(r.approver) },
    { key: 'createdAt', label: '生成时间', width: '157px', render: (r) => dash(r.createdAt) },
    { key: 'action', label: '操作', width: '80px', render: (r) => DrawerButton({ label: '查看', pageId, rowKey: r.settlementNo }) },
  ];

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.settlementNo,
    title: '结算单',
    docNo: r.settlementNo,
    status: labelOf(r.settlementStatus),
    statusTone: toneOf(r.settlementStatus),
    fields: [
      { label: '结算单号', value: r.settlementNo },
      { label: '货主', value: r.owner },
      { label: '账单类型', value: r.billType },
      { label: '账期', value: r.period },
      { label: '账单数', value: r.billCount },
      { label: '来源编号', value: r.sourceNo },
      { label: '币种', value: r.currency },
      { label: '税率', value: `${r.taxRate}%` },
      { label: '不含税金额', value: money(r.amountBeforeTax) },
      { label: '含税金额', value: money(r.amountWithTax) },
      { label: '开票状态', value: invoiceLabel(r.invoiceStatus) },
      { label: '审批人', value: r.approver },
      { label: '生成时间', value: r.createdAt },
    ],
    columns: BILL_COLUMNS,
    rows: bills[r.settlementNo] || [],
    timeline: traces[r.settlementNo] || [],
    actions: [
      { label: '审核', primary: true, toast: '审核（原型示意）' },
      { label: '发送', ghost: true, toast: '发送（原型示意）' },
      { label: '确认', ghost: true, toast: '确认（原型示意）' },
      { label: '完成', ghost: true, toast: '完成（原型示意）' },
      { label: '账单调整', ghost: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__adjust__', 'data-form-row': r.settlementNo } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  const adjustDrawer = FormDrawer({
    pageId,
    rowKey: '__adjust__',
    title: '账单调整',
    note: '调整只改结算金额与留痕，不改写来源账单。',
    groups: [
      { title: '调整', fields: [
        { label: '结算单号', key: 'settlementNo', type: 'text', readonly: true },
        { label: '含税金额', key: 'amountWithTax', type: 'number', required: true },
        { label: '调整原因', key: 'adjustReason', type: 'textarea', required: true, placeholder: '请输入调整原因' },
      ] },
    ],
    actions: [
      { label: '保存调整', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  return {
    html: ListPage({
      unit: '单',
      pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '未开票', count: count('uninvoiced'), field: 'invoiceStatus', value: 'uninvoiced' },
        { label: '已开票', count: count('invoiced'), field: 'invoiceStatus', value: 'invoiced' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '结算单号', key: 'settlementNo', type: 'text', placeholder: '请输入结算单号' },
        { label: '账期', key: 'period', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.period))], extra: true },
      ],
      toolbar: [
        { label: '生成结算单', toast: '生成结算单（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.settlementStatus }),
      emptyTitle: '暂无结算单',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: detailOverlays + adjustDrawer,
  };
}

export const PAGE_CSS = ``;
