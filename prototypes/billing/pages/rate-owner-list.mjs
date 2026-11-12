import { ListPage, DrawerDetail, DrawerButton, StatusTag, dash, money, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  enabled: { label: '启用', type: 'enabled' },
  disabled: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.ruleStatus === s).length;

  const columns = [
    { key: 'ruleNo', label: '规则编号', width: '150px', cls: 'wx-col-strong', render: (r) => dash(r.ruleNo) },
    { key: 'itemCode', label: '项目编码', width: '100px', render: (r) => dash(r.itemCode) },
    { key: 'itemName', label: '费用项目', width: '120px', render: (r) => dash(r.itemName) },
    { key: 'contractNo', label: '合同号', width: '120px', render: (r) => dash(r.contractNo) },
    { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
    { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
    { key: 'unit', label: '计费单位', width: '92px', render: (r) => dash(r.unit) },
    { key: 'costPeriod', label: '计费周期', width: '100px', render: (r) => dash(r.costPeriod) },
    { key: 'price', label: '参考单价', width: '100px', align: 'right', render: (r) => money(r.price) },
    { key: 'effectiveFrom', label: '生效起', width: '110px', render: (r) => dash(r.effectiveFrom) },
    { key: 'validTo', label: '有效期至', width: '110px', render: (r) => dash(r.validTo) },
    { key: 'ruleStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.ruleStatus), toneOf(r.ruleStatus)) },
    { key: 'action', label: '操作', width: '80px', render: (r) => DrawerButton({ label: '查看', pageId, rowKey: r.ruleNo }) },
  ];

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.ruleNo,
    title: '费用规则',
    docNo: r.ruleNo,
    status: labelOf(r.ruleStatus),
    statusTone: toneOf(r.ruleStatus),
    fields: [
      { label: '规则编号', value: r.ruleNo },
      { label: '项目编码', value: r.itemCode },
      { label: '费用项目', value: r.itemName },
      { label: '合同号', value: r.contractNo },
      { label: '费用类型', value: r.feeType },
      { label: '货主', value: r.owner },
      { label: '仓库', value: r.warehouse },
      { label: '计费单位', value: r.unit },
      { label: '计费周期', value: r.costPeriod },
      { label: '参考单价', value: money(r.price) },
      { label: '生效起', value: r.effectiveFrom },
      { label: '有效期至', value: r.validTo },
    ],
    actions: [{ label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '启用', count: count('enabled'), field: 'ruleStatus', value: 'enabled' },
        { label: '停用', count: count('disabled'), field: 'ruleStatus', value: 'disabled' },
      ],
      filters: [
        { label: '费用类型', key: 'feeType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.feeType))] },
        { label: '费用项目', key: 'itemName', type: 'text', placeholder: '请输入费用项目' },
      ],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      emptyTitle: '暂无费用规则',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    ownerOverlay: detailOverlays,
  };
}

export const PAGE_CSS = ``;
