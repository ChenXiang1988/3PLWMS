import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  normal: { label: '正常', type: 'enabled' },
  warning: { label: '预警', type: 'pending' },
  shortage: { label: '缺货', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.warnStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '正常', count: count('normal'), field: 'warnStatus', value: 'normal' },
      { label: '预警', count: count('warning'), field: 'warnStatus', value: 'warning' },
      { label: '缺货', count: count('shortage'), field: 'warnStatus', value: 'shortage' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right', render: (r) => n(r.onHandQty) },
      { key: 'safetyQty', label: '安全库存', width: '120px', align: 'right', render: (r) => n(r.safetyQty) },
      { key: 'gapQty', label: '缺口数量', width: '120px', align: 'right', render: (r) => n(r.gapQty) },
      { key: 'warnStatus', label: '预警状态', width: '108px', render: (r) => StatusTag(labelOf(r.warnStatus), toneOf(r.warnStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.warnStatus }),
    emptyTitle: '暂无低库存预警',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
