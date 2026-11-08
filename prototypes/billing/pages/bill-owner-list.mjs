import { ListPage, FormDrawer, DrawerButton, StatusTag, dash, moneyOrDash as money } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待确认', type: 'pending' },
  confirmed: { label: '已确认', type: 'enabled' },
  invoiced: { label: '已开票', type: 'info' },
  paid: { label: '已付款', type: 'enabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.billStatus === s).length;
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));
  const columns = [
    { key: 'billNo', label: '账单编号', width: '160px', cls: 'wx-col-strong' },
    { key: 'billStatus', label: '账单状态', width: '108px', type: 'status', render: (r) => StatusTag(labelOf(r.billStatus), toneOf(r.billStatus)) },
    { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
    { key: 'period', label: '账期', width: '120px', render: (r) => dash(r.period) },
    { key: 'totalFee', label: '费用合计', width: '120px', align: 'right', type: 'money', render: (r) => money(r.totalFee) },
    { key: 'createTime', label: '生成时间', width: '157px', render: (r) => dash(r.createTime) },
    { key: 'confirmTime', label: '确认时间', width: '157px', render: (r) => dash(r.confirmTime) },
    { key: 'action', label: '操作', width: '108px', type: 'action', button: '查看', render: (r) => DrawerButton({ label: '查看', pageId, rowKey: '__new__', formRow: r.billNo }) },
  ];

  const overlay = FormDrawer({
    pageId,
    title: '本货主费用账单',
    note: '确认与对账申诉只改变账单状态和留痕，不改写已出账明细。',
    groups: [
      { title: '账单明细', fields: [
        { label: '账单编号', key: 'billNo', type: 'text', readonly: true },
        { label: '账期', key: 'period', type: 'text', readonly: true },
        { label: '费用项目', key: 'feeItem', type: 'text', readonly: true },
        { label: '计费方式', key: 'billingMode', type: 'text', readonly: true },
        { label: '单价', key: 'unitPrice', type: 'text', readonly: true },
        { label: '计费量', key: 'qty', type: 'text', readonly: true },
        { label: '金额', key: 'amount', type: 'text', readonly: true },
        { label: '来源单据号', key: 'docNo', type: 'text', readonly: true },
      ] },
      { title: '确认与申诉', fields: [
        { label: '确认时间', key: 'confirmTime', type: 'text', readonly: true },
        { label: '确认人', key: 'confirmBy', type: 'text', readonly: true },
        { label: '申诉原因', key: 'disputeReason', type: 'textarea', placeholder: '请输入申诉原因' },
      ] },
    ],
    actions: [
      { label: '异议申诉', ghost: true, attrs: { 'data-form-action': 'appeal' } },
      { label: '确认', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  return {
    html: ListPage({
      unit: '单',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待确认', count: count('pending'), field: 'billStatus', value: 'pending' },
        { label: '已确认', count: count('confirmed'), field: 'billStatus', value: 'confirmed' },
        { label: '已开票', count: count('invoiced'), field: 'billStatus', value: 'invoiced' },
        { label: '已付款', count: count('paid'), field: 'billStatus', value: 'paid' },
        { label: '已取消', count: count('cancelled'), field: 'billStatus', value: 'cancelled' },
      ],
      filters: [
        { label: '账单编号', key: 'billNo', type: 'text', placeholder: '请输入账单编号' },
        { label: '账期', key: 'period', type: 'select', options: ['全部', ...Array.from(new Set(rows.map((r) => r.period)))], extra: true },
      ],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.billStatus, 'data-owner': r.owner }),
      emptyTitle: '暂无费用账单',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'billNo', statusField: 'billStatus', storageKey: 'bill-owner', statusMeta, columns, actionStatus: { confirm: 'confirmed', appeal: 'pending' } },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
