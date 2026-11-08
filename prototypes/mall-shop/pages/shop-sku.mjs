import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (v) => rows.filter((r) => r.saleStatus === v).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '在售', count: count('在售'), field: 'saleStatus', value: '在售' },
      { label: '已下架', count: count('已下架'), field: 'saleStatus', value: '已下架' },
    ],
    filters: [
      { label: '商品类目', key: 'category', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.category))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
    ],
    toolbar: [
      { label: '上架', toast: '上架（原型示意）' },
      { label: '下架', ghost: true, toast: '下架（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称' },
      { key: 'category', label: '商品类目', width: '120px', render: (r) => dash(r.category) },
      { key: 'saleStatus', label: '在售状态', width: '108px', render: (r) => StatusTag(r.saleStatus, r.saleStatus === '在售' ? 'enabled' : 'disabled') },
      { key: 'stockQty', label: '在仓现货', width: '120px', align: 'right' },
      { key: 'listTime', label: '上架时间', width: '157px', render: (r) => dash(r.listTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.saleStatus }),
    emptyTitle: '暂无商品',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
