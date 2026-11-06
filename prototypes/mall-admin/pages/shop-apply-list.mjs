import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pendingReview: { label: '待审核', type: 'pending' },
  approved: { label: '已通过', type: 'enabled' },
  rejectedReview: { label: '已驳回', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.reviewStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待审核', count: count('pendingReview'), field: 'reviewStatus', value: 'pendingReview' },
      { label: '已通过', count: count('approved'), field: 'reviewStatus', value: 'approved' },
      { label: '已驳回', count: count('rejectedReview'), field: 'reviewStatus', value: 'rejectedReview' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '申请单号', key: 'applyNo', type: 'text', placeholder: '请输入申请单号' },
      { label: '申请时间', key: 'applyTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '审核通过', toast: '审核通过（原型示意）' },
      { label: '驳回', ghost: true, toast: '驳回（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'applyNo', label: '申请单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'applyTime', label: '申请时间', width: '157px', render: (r) => dash(r.applyTime) },
      { key: 'reviewStatus', label: '审核状态', width: '108px', render: (r) => StatusTag(labelOf(r.reviewStatus), toneOf(r.reviewStatus)) },
      { key: 'applicant', label: '申请人', width: '120px', render: (r) => dash(r.applicant) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.reviewStatus }),
    emptyTitle: '暂无入驻申请',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
