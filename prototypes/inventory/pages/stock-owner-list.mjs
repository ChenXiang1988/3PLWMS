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
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      { label: '批次号', key: 'batchNo', type: 'text', placeholder: '请输入批次号', extra: true },
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
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'safetyQty', label: '安全库存', width: '108px', align: 'right', tipKey: '按安全库存、在途、未发占用、已占用、可用与总量分别统计', render: (r) => n(r.safetyQty ?? Math.round(r.onHandQty * 0.1)) },
      { key: 'inboundQty', label: '在途', width: '96px', align: 'right', render: (r) => n(r.inboundQty) },
      { key: 'unshippedQty', label: '未发占用', width: '108px', align: 'right', render: (r) => n(r.unshippedQty ?? r.reservedQty) },
      { key: 'reservedQty', label: '已占用', width: '108px', align: 'right', render: (r) => n(r.reservedQty) },
      { key: 'availableQty', label: '可用', width: '108px', align: 'right', render: (r) => n(r.availableQty) },
      { key: 'totalQty', label: '总量', width: '108px', align: 'right', render: (r) => n(r.totalQty ?? r.onHandQty + r.inboundQty) },
      { key: 'atpQty', label: '可承诺', width: '108px', align: 'right', tipKey: '可用数量减未发订单占用加在途入库', render: (r) => n(r.atpQty) },
      { key: 'frozenQty', label: '冻结数量', width: '120px', align: 'right', render: (r) => n(r.frozenQty) },
      { key: 'atpUpdatedAt', label: '数据截止', width: '157px', render: (r) => dash(r.atpUpdatedAt) },
    ],
    rows,
    emptyTitle: '暂无库存',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
