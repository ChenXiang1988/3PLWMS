import { ListPage, Tag, n, dash, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
    ],
    filters: [
      { label: '业务类型', key: 'bizType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bizType))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      { label: '发生时间', key: 'happenTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'ledgerNo', label: '流水号', width: '160px', cls: 'wx-col-strong' },
      { key: 'bizType', label: '业务类型', width: '120px', render: (r) => Tag(r.bizType || '—', r.bizType === '冲销' ? 'danger' : 'info') },
      { key: 'docNo', label: '单据编号', width: '160px', render: (r) => dash(r.docNo) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'changeQty', label: '变动数量', width: '120px', align: 'right', render: (r) => n(r.changeQty) },
      { key: 'afterQty', label: '变动后数量', width: '120px', align: 'right', render: (r) => n(r.afterQty) },
      { key: 'happenTime', label: '发生时间', width: '157px', render: (r) => dash(r.happenTime) },
    ],
    rows,
    emptyTitle: '暂无库存台账',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
