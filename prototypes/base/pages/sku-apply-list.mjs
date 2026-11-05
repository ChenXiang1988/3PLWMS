import { ListPage, StatusTag, Tag, dash, uniq } from '../../01 shared/ui.mjs';

export const STATUS_META = {
  pendingReview: { label: '待审核', type: 'pending' },
  approved: { label: '已通过', type: 'enabled' },
  rejectedReview: { label: '已驳回', type: 'rejected' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

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
      { label: '变更类型', key: 'changeType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.changeType))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      { label: '提交时间', key: 'submitTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '提交审核', toast: '提交审核（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    scopeNote: `本模块：${ctx.moduleName}`,
    columns: [
      { key: 'applyNo', label: '申请单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'changeType', label: '变更类型', width: '108px', render: (r) => Tag(dash(r.changeType), 'info') },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'reviewStatus', label: '审核状态', width: '108px', render: (r) => StatusTag(statusLabel(r.reviewStatus), (STATUS_META[r.reviewStatus] || {}).type || 'info') },
      { key: 'submitTime', label: '提交时间', width: '157px', render: (r) => dash(r.submitTime) },
      { key: 'applicant', label: '申请人', width: '120px', render: (r) => dash(r.applicant) },
    ],
    rows,
    rowAttrs: ctx.ownerScoped
      ? (r) => ({ 'data-owner': r.owner, 'data-status': r.reviewStatus })
      : (r) => ({ 'data-status': r.reviewStatus }),
    emptyTitle: '暂无申请',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
