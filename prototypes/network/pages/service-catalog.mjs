import { ListPage, FormDrawer, DrawerButton, StatusTag, dash, money, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  enabled: { label: '启用', type: 'enabled' },
  disabled: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const minText = (v) => (Number(v) > 0 ? money(v) : '—');
const maxText = (v) => (Number(v) > 0 ? money(v) : '不限');

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.itemStatus === s).length;
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));
  const columns = [
    { key: 'itemCode', label: '项目编码', width: '120px', cls: 'wx-col-strong', type: 'text' },
    { key: 'itemName', label: '项目名称', width: '120px', type: 'text' },
    { key: 'contractNo', label: '合同号', width: '120px', type: 'text', render: (r) => dash(r.contractNo) },
    { key: 'category', label: '服务类别', width: '100px', type: 'text', render: (r) => dash(r.category) },
    { key: 'unit', label: '计费单位', width: '92px', type: 'text', render: (r) => dash(r.unit) },
    { key: 'price', label: '标准价', width: '100px', align: 'right', type: 'money', render: (r) => money(r.price) },
    { key: 'minCharge', label: '最低收费', width: '110px', align: 'right', type: 'money', render: (r) => minText(r.minCharge) },
    { key: 'maxCharge', label: '最高收费', width: '110px', align: 'right', type: 'money', render: (r) => maxText(r.maxCharge) },
    { key: 'cycle', label: '计费周期', width: '100px', type: 'text', render: (r) => dash(r.cycle) },
    { key: 'taxRate', label: '税率', width: '80px', align: 'right', type: 'text', render: (r) => `${r.taxRate}%` },
    { key: 'owner', label: '适用货主', width: '120px', type: 'text', render: (r) => dash(r.owner) },
    { key: 'warehouse', label: '适用仓库', width: '120px', type: 'text', render: (r) => dash(r.warehouse) },
    { key: 'version', label: '版本', width: '80px', type: 'text', render: (r) => dash(r.version) },
    { key: 'effectiveFrom', label: '生效起', width: '110px', type: 'text', render: (r) => dash(r.effectiveFrom) },
    { key: 'validTo', label: '有效期至', width: '110px', type: 'text', render: (r) => dash(r.validTo) },
    { key: 'itemStatus', label: '状态', width: '100px', type: 'status', render: (r) => StatusTag(labelOf(r.itemStatus), toneOf(r.itemStatus)) },
    { key: 'action', label: '操作', width: '80px', type: 'action', button: '改价', render: (r) => DrawerButton({ label: '改价', pageId, rowKey: '__new__', formRow: r.itemCode }) },
  ];

  const overlay = FormDrawer({
    pageId,
    rowKey: '__new__',
    title: '改价',
    note: '改价生成新版本，不回溯已出账单。',
    groups: [
      { title: '报价项目', fields: [
        { label: '项目编码', key: 'itemCode', type: 'text', readonly: true },
        { label: '项目名称', key: 'itemName', type: 'text', readonly: true },
        { label: '合同号', key: 'contractNo', type: 'text', readonly: true },
        { label: '服务类别', key: 'category', type: 'text', readonly: true },
      ] },
      { title: '计价', fields: [
        { label: '计费单位', key: 'unit', type: 'select', options: ['件', '托', '公斤', '立方米', '平方米', '单'] },
        { label: '币种', key: 'currency', type: 'select', options: ['CNY', 'USD', 'EUR'] },
        { label: '标准价', key: 'price', type: 'number', required: true },
        { label: '最低收费', key: 'minCharge', type: 'number' },
        { label: '最高收费', key: 'maxCharge', type: 'number' },
        { label: '计费周期', key: 'cycle', type: 'select', options: ['自然月', '按天', '按单', '按票'] },
        { label: '税率(%)', key: 'taxRate', type: 'number', required: true },
      ] },
      { title: '适用范围', fields: [
        { label: '适用货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '适用仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
        { label: '版本', key: 'version', type: 'text', required: true },
        { label: '生效起', key: 'effectiveFrom', type: 'date', required: true },
        { label: '有效期至', key: 'validTo', type: 'date', required: true },
      ] },
    ],
    actions: [
      { label: '确认改价', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  return {
    html: ListPage({
      unit: '条',
      pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '启用', count: count('enabled'), field: 'itemStatus', value: 'enabled' },
        { label: '停用', count: count('disabled'), field: 'itemStatus', value: 'disabled' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '服务类别', key: 'category', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.category))] },
        { label: '项目名称', key: 'itemName', type: 'text', placeholder: '请输入项目名称' },
        { label: '合同号', key: 'contractNo', type: 'text', placeholder: '请输入合同号', extra: true },
      ],
      toolbar: [
        { label: '新增', toast: '新增（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.itemStatus }),
      emptyTitle: '暂无服务目录与报价',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'itemCode', statusField: 'itemStatus', storageKey: 'service-catalog', statusMeta, columns },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
