import { ListPage, FormDrawer, DrawerDetail, DrawerButton, StatusTag, dash, money, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待确认', type: 'pending' },
  disputed: { label: '已申诉', type: 'info' },
  confirmed: { label: '已确认', type: 'enabled' },
  closed: { label: '已关闭', type: 'disabled' },
  uninvoiced: { label: '未开票', type: 'pending' },
  invoiced: { label: '已开票', type: 'enabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

const DETAIL_COLUMNS = [
  { key: 'feeType', label: '费用类型', width: '100px' },
  { key: 'feeItem', label: '费用项目', width: '120px' },
  { key: 'billingMode', label: '计费方式', width: '90px' },
  { key: 'qty', label: '计费量', width: '90px', align: 'right', render: (r) => n(r.qty) },
  { key: 'unit', label: '单位', width: '70px' },
  { key: 'unitPrice', label: '单价', width: '90px', align: 'right', render: (r) => money(r.unitPrice) },
  { key: 'amountBeforeTax', label: '不含税金额', width: '110px', align: 'right', render: (r) => money(r.amountBeforeTax) },
  { key: 'taxRate', label: '税率', width: '70px', align: 'right', render: (r) => `${r.taxRate}%` },
  { key: 'amount', label: '含税金额', width: '110px', align: 'right', render: (r) => money(r.amount) },
  { key: 'ruleNo', label: '规则编号', width: '120px' },
  { key: 'ruleVersion', label: '规则版本', width: '80px' },
  { key: 'sourceDocNo', label: '来源单据', width: '140px' },
  { key: 'snapshotDate', label: '快照日期', width: '110px' },
];

export function renderPage(data, ctx) {
  const { rows = [], details = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.billStatus === s).length;
  const viewRows = rows.map((r) => ({ ...r, invoiceStatusLabel: labelOf(r.invoiceStatus) }));
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));

  const columns = [
    { key: 'billNo', label: '账单编号', width: '160px', cls: 'wx-col-strong', type: 'text', render: (r) => dash(r.billNo) },
    { key: 'billType', label: '账单类型', width: '100px', type: 'text', render: (r) => dash(r.billType) },
    { key: 'owner', label: '货主', width: '120px', type: 'text', render: (r) => dash(r.owner) },
    { key: 'period', label: '账期', width: '100px', type: 'text', render: (r) => dash(r.period) },
    { key: 'costObject', label: '计费对象', width: '130px', type: 'text', render: (r) => dash(r.costObject) },
    { key: 'totalAmount', label: '费用合计', width: '120px', align: 'right', type: 'money', render: (r) => money(r.totalAmount) },
    { key: 'confirmedAmount', label: '已确认金额', width: '120px', align: 'right', type: 'money', render: (r) => money(r.confirmedAmount) },
    { key: 'differenceAmount', label: '差异金额', width: '110px', align: 'right', type: 'money', render: (r) => money(r.differenceAmount) },
    { key: 'invoiceStatus', label: '开票状态', width: '100px', type: 'status', render: (r) => StatusTag(labelOf(r.invoiceStatus), toneOf(r.invoiceStatus)) },
    { key: 'billStatus', label: '账单状态', width: '108px', type: 'status', render: (r) => StatusTag(labelOf(r.billStatus), toneOf(r.billStatus)) },
    { key: 'sourceCount', label: '来源单据数', width: '100px', align: 'right', type: 'text', render: (r) => n(r.sourceCount) },
    { key: 'generateTime', label: '生成时间', width: '157px', type: 'text', render: (r) => dash(r.generateTime) },
    { key: 'action', label: '操作', width: '80px', type: 'action', action: 'detail', button: '查看', render: (r) => DrawerButton({ label: '查看', pageId, rowKey: r.billNo }) },
  ];

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.billNo,
    title: '费用账单',
    docNo: r.billNo,
    fields: [
      { label: '账单编号', value: r.billNo },
      { label: '账单类型', value: r.billType },
      { label: '货主', value: r.owner },
      { label: '账期', value: r.period },
      { label: '计费对象', value: r.costObject },
      { label: '费用合计', value: money(r.totalAmount) },
      { label: '已确认金额', value: money(r.confirmedAmount) },
      { label: '差异金额', value: money(r.differenceAmount) },
      { label: '开票状态', value: labelOf(r.invoiceStatus) },
      { label: '生成时间', value: r.generateTime },
      { label: '应结日期', value: r.dueDate },
      { label: '结算单号', value: r.settlementNo },
      ...(r.disputeReason ? [{ label: '申诉原因', value: r.disputeReason }] : []),
    ],
    columns: DETAIL_COLUMNS,
    rows: details[r.billNo] || [],
    actions: [
      ...(r.billStatus === 'pending'
        ? [{ label: '确认', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__confirm__', 'data-form-row': r.billNo } }]
        : []),
      ...(r.billStatus === 'disputed'
        ? [{ label: '申诉处理', ghost: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__appeal__', 'data-form-row': r.billNo } }]
        : []),
      ...(r.billStatus !== 'closed'
        ? [{ label: '账单调整', ghost: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__adjust__', 'data-form-row': r.billNo } }]
        : []),
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  const confirmDrawer = FormDrawer({
    pageId,
    rowKey: '__confirm__',
    title: '确认账单',
    note: '确认后账单进入已确认，不再改写已出账明细。',
    groups: [
      { title: '账单', fields: [
        { label: '账单编号', key: 'billNo', type: 'text', readonly: true },
        { label: '费用合计', key: 'totalAmount', type: 'text', readonly: true },
        { label: '确认金额', key: 'confirmedAmount', type: 'number', required: true },
        { label: '差异金额', key: 'differenceAmount', type: 'number', required: true },
        { label: '确认人', key: 'confirmBy', type: 'text', readonly: true },
        { label: '确认时间', key: 'confirmTime', type: 'text', readonly: true },
      ] },
      { title: '确认意见', fields: [
        { label: '确认意见', key: 'confirmNote', type: 'textarea', placeholder: '请输入确认意见' },
      ] },
    ],
    actions: [
      { label: '确认', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  const appealDrawer = FormDrawer({
    pageId,
    rowKey: '__appeal__',
    title: '申诉处理',
    note: '处理完成后退回已确认；差异金额保留在账单明细。',
    groups: [
      { title: '申诉', fields: [
        { label: '账单编号', key: 'billNo', type: 'text', readonly: true },
        { label: '申诉原因', key: 'disputeReason', type: 'textarea', readonly: true },
        { label: '确认金额', key: 'confirmedAmount', type: 'number', required: true },
        { label: '差异金额', key: 'differenceAmount', type: 'number', required: true },
        { label: '处理说明', key: 'handleNote', type: 'textarea', required: true, placeholder: '请输入处理说明' },
      ] },
    ],
    actions: [
      { label: '处理完成', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  const adjustDrawer = FormDrawer({
    pageId,
    rowKey: '__adjust__',
    title: '账单调整',
    note: '调整只改账单金额与留痕，不改写来源明细。',
    groups: [
      { title: '调整', fields: [
        { label: '账单编号', key: 'billNo', type: 'text', readonly: true },
        { label: '费用合计', key: 'totalAmount', type: 'number', required: true },
        { label: '差异金额', key: 'differenceAmount', type: 'number', required: true },
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
        { label: '待确认', count: count('pending'), field: 'billStatus', value: 'pending' },
        { label: '已申诉', count: count('disputed'), field: 'billStatus', value: 'disputed' },
        { label: '已确认', count: count('confirmed'), field: 'billStatus', value: 'confirmed' },
        { label: '已关闭', count: count('closed'), field: 'billStatus', value: 'closed' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '账单编号', key: 'billNo', type: 'text', placeholder: '请输入账单编号' },
        { label: '账期', key: 'period', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.period))] },
        { label: '开票状态', key: 'invoiceStatusLabel', type: 'select', options: ['全部', ...uniq(viewRows.map((r) => r.invoiceStatusLabel))], extra: true },
      ],
      toolbar: [
        { label: '生成账单', toast: '生成账单（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows: viewRows,
      rowAttrs: (r) => ({ 'data-status': r.billStatus, 'data-owner': r.owner }),
      emptyTitle: '暂无费用账单',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'billNo', statusField: 'billStatus', storageKey: 'bill-list', statusMeta, columns, actionStatus: { confirm: 'confirmed', appeal: 'disputed' } },
    }),
    overlay: detailOverlays + confirmDrawer + appealDrawer + adjustDrawer,
  };
}

export const PAGE_CSS = ``;
