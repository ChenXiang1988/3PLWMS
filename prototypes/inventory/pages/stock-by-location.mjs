import { ListPage, DrawerButton, DrawerDetail, n, dash, uniq } from '../../shared/ui.mjs';

const keyOf = (r) => `${r.binCode}|${r.skuCode}|${r.batchNo}`;

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;

  const columns = [
    { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
    { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong', render: (r) => DrawerButton({ label: r.skuCode, pageId, rowKey: keyOf(r) }) },
    { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
    { key: 'batchNo', label: '批次号', width: '160px', render: (r) => dash(r.batchNo) },
    { key: 'binCode', label: '库位编码', width: '120px', render: (r) => dash(r.binCode) },
    { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right', sortable: true, render: (r) => n(r.onHandQty) },
    { key: 'availableQty', label: '可用数量', width: '120px', align: 'right', sortable: true, render: (r) => n(r.availableQty) },
    { key: 'frozenQty', label: '冻结数量', width: '120px', align: 'right', render: (r) => n(r.frozenQty) },
    { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: keyOf(r) }) },
  ];

  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: keyOf(r), title: '仓位库存详情', docNo: r.binCode,
    fields: [
      { label: '货主', value: r.owner },
      { label: '商品编码', value: r.skuCode },
      { label: '商品名称', value: r.skuName },
      { label: '批次号', value: r.batchNo },
      { label: '库位编码', value: r.binCode },
      { label: '在库数量', value: r.onHandQty },
      { label: '可用数量', value: r.availableQty },
      { label: '冻结数量', value: r.frozenQty },
    ],
    actions: [
      { label: '生成移库任务', attrs: { 'data-toast': '已生成移库任务（原型示意）' } },
      { label: '冻结', ghost: true, attrs: { 'data-toast': '已提交冻结（原型示意）' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
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
        { label: '打印', ghost: true, attrs: { 'data-print': '仓位库存' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner }),
      emptyTitle: '暂无仓位库存',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
