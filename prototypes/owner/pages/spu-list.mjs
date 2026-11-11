import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '在售', type: 'enabled' },
  hot: { label: '热销', type: 'info' },
  fresh: { label: '新品', type: 'info' },
  slow: { label: '滞销', type: 'pending' },
  clearance: { label: '清仓', type: 'pending' },
  stopped: { label: '停售', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.lifecycleStatus === s).length;

  const overlay = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.spuCode,
    title: '商品详情与配对',
    docNo: r.spuCode,
    status: labelOf(r.lifecycleStatus),
    statusTone: toneOf(r.lifecycleStatus),
    fields: [
      { label: 'SPU 编码', value: r.spuCode },
      { label: '品名', value: r.spuName },
      { label: '品类', value: r.category },
      { label: '生命周期', value: labelOf(r.lifecycleStatus) },
      { label: '变体数', value: n(r.variantCount) },
      { label: 'Listing 数', value: n(r.listingCount) },
      { label: '仓储 SKU 数', value: n(r.skuCount) },
      { label: '更新时间', value: r.updateTime },
    ],
    columns: [
      { key: 'objectType', label: '对象', width: '160px' },
      { key: 'objectCount', label: '数量', width: '100px', align: 'right' },
      { key: 'matchStatus', label: '配对状态', width: '120px' },
    ],
    rows: [
      { objectType: '变体', objectCount: r.variantCount, matchStatus: '—' },
      { objectType: '平台 Listing', objectCount: r.listingCount, matchStatus: r.skuCount > 0 ? '已配对' : '未配对' },
      { objectType: '仓储 SKU', objectCount: r.skuCount, matchStatus: r.skuCount > 0 ? '已配对' : '未配对' },
    ],
    timeline: [
      { time: r.updateTime, text: '更新 SPU 主数据', operator: '商品组' },
    ],
    actions: [
      { label: '类目匹配', ghost: true, toast: '类目匹配（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条',
      pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '在售', count: count('active'), field: 'lifecycleStatus', value: 'active' },
        { label: '热销', count: count('hot'), field: 'lifecycleStatus', value: 'hot' },
        { label: '新品', count: count('fresh'), field: 'lifecycleStatus', value: 'fresh' },
        { label: '滞销', count: count('slow'), field: 'lifecycleStatus', value: 'slow' },
        { label: '清仓', count: count('clearance'), field: 'lifecycleStatus', value: 'clearance' },
        { label: '停售', count: count('stopped'), field: 'lifecycleStatus', value: 'stopped' },
      ],
      filters: [
        { label: 'SPU 编码', key: 'spuCode', type: 'text', placeholder: '请输入 SPU 编码' },
        { label: '品名', key: 'spuName', type: 'text', placeholder: '请输入品名' },
        { label: '品类', key: 'category', type: 'text', placeholder: '请输入品类', extra: true },
      ],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'spuCode', label: 'SPU 编码', width: '160px', cls: 'wx-col-strong' },
        { key: 'spuName', label: '品名', render: (r) => dash(r.spuName) },
        { key: 'category', label: '品类', render: (r) => dash(r.category) },
        { key: 'variantCount', label: '变体数', width: '100px', align: 'right', render: (r) => n(r.variantCount) },
        { key: 'listingCount', label: 'Listing 数', width: '110px', align: 'right', render: (r) => n(r.listingCount) },
        { key: 'skuCount', label: '仓储 SKU 数', width: '120px', align: 'right', render: (r) => n(r.skuCount) },
        { key: 'lifecycleStatus', label: '生命周期', width: '108px', render: (r) => StatusTag(labelOf(r.lifecycleStatus), toneOf(r.lifecycleStatus)) },
        { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
        { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ label: '查看', pageId, rowKey: r.spuCode }) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.lifecycleStatus }),
      emptyTitle: '暂无 SPU',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    ownerOverlay: overlay,
  };
}

export const PAGE_CSS = ``;
