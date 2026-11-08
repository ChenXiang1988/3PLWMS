import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待审批', type: 'pending' },
    approved: { label: '已通过', type: 'enabled' },
    rejected: { label: '已驳回', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.approveStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待审批', count: count('pending'), field: 'approveStatus', value: 'pending' },
      { label: '已通过', count: count('approved'), field: 'approveStatus', value: 'approved' },
      { label: '已驳回', count: count('rejected'), field: 'approveStatus', value: 'rejected' },
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
      { key: 'diffNo', label: '差异号', width: '150px', render: (r) => dash(r.diffNo) },
      { key: 'countNo', label: '盘点单', width: '150px', render: (r) => dash(r.countNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'locationCode', label: '库位', width: '110px', render: (r) => dash(r.locationCode) },
      { key: 'bookQty', label: '账面数', width: '90px', align: 'right', render: (r) => n(r.bookQty) },
      { key: 'actualQty', label: '实盘数', width: '90px', align: 'right', render: (r) => n(r.actualQty) },
      { key: 'diffQty', label: '差异数', width: '90px', align: 'right', render: (r) => n(r.diffQty) },
      { key: 'diffType', label: '差异类型', width: '90px', render: (r) => dash(r.diffType) },
      { key: 'approveStatus', label: '审批状态', width: '100px', render: (r) => StatusTag(labelOf(r.approveStatus), toneOf(r.approveStatus)) },
      { key: 'adjustNo', label: '调整单', width: '150px', render: (r) => dash(r.adjustNo) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.approveStatus }),
    emptyTitle: '暂无盘点差异审批',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
