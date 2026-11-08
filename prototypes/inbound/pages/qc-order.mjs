import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    qualified: { label: '合格', type: 'enabled' },
    partial: { label: '部分合格', type: 'pending' },
    unqualified: { label: '不合格', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.conclusion === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '合格', count: count('qualified'), field: 'conclusion', value: 'qualified' },
      { label: '部分合格', count: count('partial'), field: 'conclusion', value: 'partial' },
      { label: '不合格', count: count('unqualified'), field: 'conclusion', value: 'unqualified' },
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
      { key: 'qcNo', label: '质检号', width: '150px', render: (r) => dash(r.qcNo) },
      { key: 'receivingNo', label: '收货单', width: '160px', render: (r) => dash(r.receivingNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'receivedQty', label: '收货数量', width: '110px', align: 'right', render: (r) => n(r.receivedQty) },
      { key: 'acceptedQty', label: '验收数量', width: '110px', align: 'right', render: (r) => n(r.acceptedQty) },
      { key: 'qualifiedQty', label: '合格数', width: '100px', align: 'right', render: (r) => n(r.qualifiedQty) },
      { key: 'defectiveQty', label: '不合格数', width: '110px', align: 'right', render: (r) => n(r.defectiveQty) },
      { key: 'conclusion', label: '结论', width: '100px', render: (r) => StatusTag(labelOf(r.conclusion), toneOf(r.conclusion)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.conclusion }),
    emptyTitle: '暂无质检单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
