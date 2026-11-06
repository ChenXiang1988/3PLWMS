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
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '快照编号', key: 'snapshotNo', type: 'text', placeholder: '请输入快照编号' },
      { label: '快照时间', key: 'snapshotTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'snapshotNo', label: '快照编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'snapshotTime', label: '快照时间', width: '157px', render: (r) => dash(r.snapshotTime) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'batchNo', label: '批次号', width: '160px', render: (r) => dash(r.batchNo) },
      { key: 'binCode', label: '库位编码', width: '120px', render: (r) => dash(r.binCode) },
      { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right', render: (r) => n(r.onHandQty) },
      { key: 'availableQty', label: '可用数量', width: '120px', align: 'right', render: (r) => n(r.availableQty) },
      { key: 'frozenQty', label: '冻结数量', width: '120px', align: 'right', render: (r) => n(r.frozenQty) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner }),
    emptyTitle: '暂无库存快照',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
