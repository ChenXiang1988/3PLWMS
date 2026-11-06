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
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      { label: '批次号', key: 'batchNo', type: 'text', placeholder: '请输入批次号', extra: true },
      { label: '库位编码', key: 'binCode', type: 'text', placeholder: '请输入库位编码', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'batchNo', label: '批次号', width: '160px', render: (r) => dash(r.batchNo) },
      { key: 'binCode', label: '库位编码', width: '120px', render: (r) => dash(r.binCode) },
      { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right', render: (r) => n(r.onHandQty) },
      { key: 'availableQty', label: '可用数量', width: '120px', align: 'right', render: (r) => n(r.availableQty) },
      { key: 'countFrozenQty', label: '盘点冻结', width: '120px', align: 'right', render: (r) => n(r.countFrozenQty) },
      { key: 'planLockedQty', label: '计划单锁定', width: '120px', align: 'right', render: (r) => n(r.planLockedQty) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner }),
    emptyTitle: '暂无库存',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
