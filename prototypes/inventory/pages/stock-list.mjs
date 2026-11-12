import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

const STATUS = {
  available: { label: '可用', tone: 'enabled' },
  allocated: { label: '已分配', tone: 'info' },
  picking: { label: '拣选中', tone: 'pending' },
  quality: { label: '质检中', tone: 'pending' },
  frozen: { label: '冻结', tone: 'rejected' },
  diff: { label: '差异待核验', tone: 'rejected' },
};
const labelOf = (s) => STATUS[s]?.label || s || '—';
const toneOf = (s) => STATUS[s]?.tone || 'info';

export function renderPage(data, ctx) {
  const { rows = [], summary = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const keyOf = (r) => `${r.owner}|${r.skuCode}|${r.batchNo}|${r.binCode}`;
  const columns = [
    { key: 'owner', label: '货主', width: '110px', render: (r) => dash(r.owner) },
    { key: 'skuCode', label: '商品编码', width: '140px', cls: 'wx-col-strong', render: (r) => DrawerButton({ label: r.skuCode, pageId, rowKey: keyOf(r) }) },
    { key: 'batchNo', label: '批次号', width: '145px', render: (r) => dash(r.batchNo) },
    { key: 'location', label: '库区/库位', width: '145px', render: (r) => dash(`${r.zoneCode} / ${r.binCode}`) },
    { key: 'containerCode', label: '容器', width: '125px', render: (r) => dash(r.containerCode) },
    { key: 'onHandQty', label: '实物量', width: '95px', align: 'right', render: (r) => n(r.onHandQty) },
    { key: 'availableQty', label: '可用量', width: '95px', align: 'right', render: (r) => n(r.availableQty) },
    { key: 'committedQty', label: '已承诺', width: '95px', align: 'right', render: (r) => n(r.committedQty) },
    { key: 'allocatedQty', label: '已分配', width: '95px', align: 'right', render: (r) => n(r.allocatedQty) },
    { key: 'pickingQty', label: '拣选中', width: '95px', align: 'right', render: (r) => n(r.pickingQty) },
    { key: 'status', label: '库存状态', width: '105px', render: (r) => StatusTag(labelOf(r.status), toneOf(r.status)) },
  ];
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: keyOf(r), title: '库存明细', docNo: r.skuCode, status: labelOf(r.status), statusTone: toneOf(r.status),
    fields: [
      { label: '货主', value: r.owner }, { label: '商品', value: r.skuName }, { label: '批次号', value: r.batchNo },
      { label: '库区/库位', value: `${r.zoneCode} / ${r.binCode}` }, { label: '容器', value: r.containerCode }, { label: '库存状态', value: labelOf(r.status) },
      { label: '实物量', value: r.onHandQty }, { label: '可用量', value: r.availableQty }, { label: '已承诺', value: r.committedQty },
      { label: '已分配', value: r.allocatedQty }, { label: '拣选中', value: r.pickingQty }, { label: '复核中', value: r.checkingQty },
      { label: '待发运', value: r.shippingQty }, { label: '冻结', value: r.frozenQty }, { label: '质检中', value: r.qualityQty }, { label: '差异量', value: r.diffQty },
    ],
    actions: [
      { label: '查看库存流水', toast: '已打开库存流水（原型示意）' },
      { label: '发起库存调整', ghost: true, toast: '已打开库存调整（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 20, scopeNote: `实物 ${n(summary.onHandQty)} · 可用 ${n(summary.availableQty)} · 已承诺 ${n(summary.committedQty)} · 差异 ${n(summary.diffQty)}`,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS).map(([value, meta]) => ({ label: meta.label, count: rows.filter((r) => r.status === value).length, field: 'status', value }))],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      { label: '批次号', key: 'batchNo', type: 'text', placeholder: '请输入批次号', extra: true },
      { label: '容器', key: 'containerCode', type: 'text', placeholder: '请输入容器号', extra: true },
    ],
    toolbar: [{ label: '导出库存', ghost: true, toast: '导出当前库存结果（原型示意）' }], showCount: true, columns, rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.status }), emptyTitle: '暂无库存', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
