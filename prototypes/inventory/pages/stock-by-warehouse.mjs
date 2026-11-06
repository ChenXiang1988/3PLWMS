import { ListPage, n, dash, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
    ],
    filters: [
      { label: '仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'warehouse', label: '仓库', width: '120px', cls: 'wx-col-strong', render: (r) => dash(r.warehouse) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right', render: (r) => n(r.onHandQty) },
      { key: 'availableQty', label: '可用数量', width: '120px', align: 'right', render: (r) => n(r.availableQty) },
      { key: 'frozenQty', label: '冻结数量', width: '120px', align: 'right', render: (r) => n(r.frozenQty) },
      { key: 'binCount', label: '库位数', width: '120px', align: 'right', render: (r) => n(r.binCount) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner }),
    emptyTitle: '暂无分仓库存',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
