import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    unpair: { label: '待配对', type: 'pending' },
    paired: { label: '已配对', type: 'info' },
    shipped: { label: '已直发', type: 'enabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.crossdockStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待配对', count: count('unpair'), field: 'crossdockStatus', value: 'unpair' },
      { label: '已配对', count: count('paired'), field: 'crossdockStatus', value: 'paired' },
      { label: '已直发', count: count('shipped'), field: 'crossdockStatus', value: 'shipped' },
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
      { key: 'crossdockNo', label: '越库号', width: '150px', render: (r) => dash(r.crossdockNo) },
      { key: 'inPlanNo', label: '入库通知单', width: '160px', render: (r) => dash(r.inPlanNo) },
      { key: 'outPlanNo', label: '出库订单', width: '160px', render: (r) => dash(r.outPlanNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'qty', label: '数量', width: '100px', align: 'right', render: (r) => n(r.qty) },
      { key: 'dock', label: '月台', width: '80px', render: (r) => dash(r.dock) },
      { key: 'crossdockStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.crossdockStatus), toneOf(r.crossdockStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.crossdockStatus }),
    emptyTitle: '暂无越库直发',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
