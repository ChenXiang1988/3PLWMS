import { ListPage, StatusTag, dash } from '../../shared/ui.mjs';

export const STATUS_META = {
  unverified: { label: '未认证', type: 'disabled' },
  pendingReview: { label: '待审核', type: 'pending' },
  approved: { label: '已通过', type: 'enabled' },
  rejectedReview: { label: '已驳回', type: 'rejected' },
  withdrawn: { label: '已撤回', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.certStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '未认证', count: count('unverified'), field: 'certStatus', value: 'unverified' },
      { label: '待审核', count: count('pendingReview'), field: 'certStatus', value: 'pendingReview' },
      { label: '已通过', count: count('approved'), field: 'certStatus', value: 'approved' },
      { label: '已驳回', count: count('rejectedReview'), field: 'certStatus', value: 'rejectedReview' },
      { label: '已撤回', count: count('withdrawn'), field: 'certStatus', value: 'withdrawn' },
    ],
    filters: [
      { label: '企业名称', key: 'enterpriseName', type: 'text', placeholder: '请输入企业名称' },
      { label: '统一社会信用代码', key: 'licenseNo', type: 'text', placeholder: '请输入统一社会信用代码' },
      { label: '提交时间', key: 'submitTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '上传营业执照', toast: '上传营业执照（原型示意）' },
      { label: '提交认证', toast: '提交认证（原型示意）' },
      { label: '撤回认证', ghost: true, toast: '撤回认证（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'certNo', label: '认证单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'enterpriseName', label: '企业名称', render: (r) => dash(r.enterpriseName) },
      { key: 'licenseNo', label: '统一社会信用代码', width: '180px', render: (r) => dash(r.licenseNo) },
      { key: 'licenseFile', label: '营业执照', render: (r) => dash(r.licenseFile) },
      { key: 'certStatus', label: '认证状态', width: '108px', render: (r) => StatusTag(labelOf(r.certStatus), toneOf(r.certStatus)) },
      { key: 'submitTime', label: '提交时间', width: '157px', render: (r) => dash(r.submitTime) },
      { key: 'reviewer', label: '审核人', width: '120px', render: (r) => dash(r.reviewer) },
      { key: 'reviewTime', label: '审核时间', width: '157px', render: (r) => dash(r.reviewTime) },
      { key: 'reviewRemark', label: '审批意见', render: (r) => dash(r.reviewRemark) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.certStatus, 'data-owner': r.owner }),
    emptyTitle: '暂无认证单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
