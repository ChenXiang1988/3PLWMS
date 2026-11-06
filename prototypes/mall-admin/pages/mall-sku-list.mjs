import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  onSale: { label: '在售', type: 'enabled' },
  offSale: { label: '已下架', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.saleStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '在售', count: count('onSale'), field: 'saleStatus', value: 'onSale' },
      { label: '已下架', count: count('offSale'), field: 'saleStatus', value: 'offSale' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '商品类目', key: 'category', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.category))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码', extra: true },
    ],
    toolbar: [
      { label: '上架', toast: '上架（原型示意）' },
      { label: '下架', ghost: true, toast: '下架（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'category', label: '商品类目', width: '120px', render: (r) => dash(r.category) },
      { key: 'saleStatus', label: '在售状态', width: '108px', render: (r) => StatusTag(labelOf(r.saleStatus), toneOf(r.saleStatus)) },
      { key: 'stockQty', label: '在仓现货', width: '120px', align: 'right', render: (r) => n(r.stockQty) },
      { key: 'listTime', label: '上架时间', width: '157px', render: (r) => dash(r.listTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.saleStatus }),
    emptyTitle: '暂无商城商品',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
