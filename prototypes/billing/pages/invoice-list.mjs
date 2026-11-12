import { ListPage, FormDrawer, DrawerDetail, DrawerButton, StatusTag, dash, money, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  unpaid: { label: '待收款', type: 'pending' },
  partial: { label: '部分收款', type: 'info' },
  paid: { label: '已收款', type: 'enabled' },
  overdue: { label: '逾期', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

const RECEIPT_COLUMNS = [
  { key: 'receiveDate', label: '收款时间', width: '120px' },
  { key: 'receiveAmount', label: '收款金额', width: '120px', align: 'right', render: (r) => money(r.receiveAmount) },
  { key: 'receiveMethod', label: '收款方式', width: '120px' },
  { key: 'voucherNo', label: '收款凭证', width: '160px' },
];

export function renderPage(data, ctx) {
  const { rows = [], receipts = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.receiveStatus === s).length;

  const columns = [
    { key: 'invoiceNo', label: '发票号', width: '160px', cls: 'wx-col-strong', render: (r) => dash(r.invoiceNo) },
    { key: 'settlementNo', label: '结算单号', width: '160px', render: (r) => dash(r.settlementNo) },
    { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
    { key: 'invoiceType', label: '发票类型', width: '140px', render: (r) => dash(r.invoiceType) },
    { key: 'currency', label: '币种', width: '80px', render: (r) => dash(r.currency) },
    { key: 'taxRate', label: '税率', width: '80px', align: 'right', render: (r) => `${r.taxRate}%` },
    { key: 'amount', label: '开票金额', width: '120px', align: 'right', render: (r) => money(r.amount) },
    { key: 'attachmentName', label: '附件', width: '150px', render: (r) => dash(r.attachmentName) },
    { key: 'invoicedAt', label: '开票时间', width: '110px', render: (r) => dash(r.invoicedAt) },
    { key: 'receivedAmount', label: '已收金额', width: '120px', align: 'right', render: (r) => money(r.receivedAmount) },
    { key: 'receiveStatus', label: '收款状态', width: '108px', render: (r) => StatusTag(labelOf(r.receiveStatus), toneOf(r.receiveStatus)) },
    { key: 'dueDate', label: '到期日', width: '110px', render: (r) => dash(r.dueDate) },
    { key: 'action', label: '操作', width: '80px', render: (r) => DrawerButton({ label: '查看', pageId, rowKey: r.invoiceNo }) },
  ];

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.invoiceNo,
    title: '发票与收款',
    docNo: r.invoiceNo,
    status: labelOf(r.receiveStatus),
    statusTone: toneOf(r.receiveStatus),
    fields: [
      { label: '发票号', value: r.invoiceNo },
      { label: '结算单号', value: r.settlementNo },
      { label: '货主', value: r.owner },
      { label: '发票类型', value: r.invoiceType },
      { label: '币种', value: r.currency },
      { label: '税率', value: `${r.taxRate}%` },
      { label: '开票金额', value: money(r.amount) },
      { label: '已收金额', value: money(r.receivedAmount) },
      { label: '收款状态', value: labelOf(r.receiveStatus) },
      { label: '开票时间', value: r.invoicedAt },
      { label: '到期日', value: r.dueDate },
      { label: '附件', value: r.attachmentName },
    ],
    columns: RECEIPT_COLUMNS,
    rows: receipts[r.invoiceNo] || [],
    actions: [
      { label: '登记收款', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__receive__', 'data-form-row': r.invoiceNo } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  const receiveDrawer = FormDrawer({
    pageId,
    rowKey: '__receive__',
    title: '登记收款',
    note: '收款记录只追加，不退改已登记记录。',
    groups: [
      { title: '发票', fields: [
        { label: '发票号', key: 'invoiceNo', type: 'text', readonly: true },
        { label: '开票金额', key: 'amount', type: 'text', readonly: true },
        { label: '已收金额', key: 'receivedAmount', type: 'text', readonly: true },
      ] },
      { title: '收款', fields: [
        { label: '收款金额', key: 'receiveAmount', type: 'number', required: true },
        { label: '收款时间', key: 'receiveDate', type: 'date', required: true },
        { label: '收款方式', key: 'receiveMethod', type: 'select', required: true, options: ['银行转账', '银行承兑', '现金', '其他'] },
        { label: '收款凭证', key: 'voucherNo', type: 'text', placeholder: '请输入凭证号' },
      ] },
    ],
    actions: [
      { label: '登记收款', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  return {
    html: ListPage({
      unit: '张',
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
        { label: '发票号', key: 'invoiceNo', type: 'text', placeholder: '请输入发票号' },
        { label: '结算单号', key: 'settlementNo', type: 'text', placeholder: '请输入结算单号', extra: true },
      ],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.receiveStatus }),
      emptyTitle: '暂无发票与收款',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: detailOverlays + receiveDrawer,
  };
}

export const PAGE_CSS = ``;
