import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

const STATUS_META = {
  unverified: { label: '未认证', type: 'disabled' },
  pendingReview: { label: '待审核', type: 'pending' },
  approved: { label: '已通过', type: 'enabled' },
  rejectedReview: { label: '已驳回', type: 'rejected' },
  withdrawn: { label: '已撤回', type: 'disabled' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.certStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待审核', count: count('pendingReview'), field: 'certStatus', value: 'pendingReview' },
      { label: '已通过', count: count('approved'), field: 'certStatus', value: 'approved' },
      { label: '已驳回', count: count('rejectedReview'), field: 'certStatus', value: 'rejectedReview' },
      { label: '已撤回', count: count('withdrawn'), field: 'certStatus', value: 'withdrawn' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '认证单号', key: 'certNo', type: 'text', placeholder: '请输入认证单号' },
      { label: '提交时间', key: 'submitTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '审核通过', toast: '审核通过（原型示意）' },
      { label: '驳回', ghost: true, toast: '驳回（原型示意）' },
      { label: '反审核', ghost: true, toast: '反审核（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'certNo', label: '认证单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'enterpriseName', label: '企业名称' },
      { key: 'licenseNo', label: '统一社会信用代码', width: '200px', render: (r) => dash(r.licenseNo) },
      { key: 'certStatus', label: '认证状态', width: '108px', render: (r) => StatusTag(labelOf(r.certStatus), toneOf(r.certStatus)) },
      { key: 'submitTime', label: '提交时间', width: '157px', render: (r) => dash(r.submitTime) },
      { key: 'reviewer', label: '审核人', width: '120px', render: (r) => dash(r.reviewer) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.certStatus }),
    emptyTitle: '暂无认证单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
