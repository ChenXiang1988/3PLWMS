import { ListPage, FormDrawer, DrawerButton, StatusTag, Tag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  draft: { label: '草稿', type: 'disabled' },
  pendingReview: { label: '待审核', type: 'pending' },
  approved: { label: '已通过', type: 'enabled' },
  rejectedReview: { label: '已驳回', type: 'rejected' },
  withdrawn: { label: '已撤回', type: 'disabled' },
  voided: { label: '已作废', type: 'disabled' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

const columnsOf = (pageId) => [
  { key: 'applyNo', label: '申请单号', width: '160px', cls: 'wx-col-strong' },
  { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
  { key: 'changeType', label: '变更类型', width: '108px', type: 'tag', render: (r) => Tag(dash(r.changeType), 'info') },
  { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
  { key: 'applicant', label: '申请人', width: '120px', render: (r) => dash(r.applicant) },
  { key: 'submitTime', label: '提交时间', width: '157px', render: (r) => dash(r.submitTime) },
  { key: 'reviewer', label: '审核人', width: '120px', render: (r) => dash(r.reviewer) },
  { key: 'reviewTime', label: '审核时间', width: '157px', render: (r) => dash(r.reviewTime) },
  { key: 'reviewStatus', label: '审核状态', width: '108px', type: 'status', render: (r) => StatusTag(statusLabel(r.reviewStatus), (STATUS_META[r.reviewStatus] || {}).type || 'info') },
  { key: 'action', label: '操作', width: '108px', type: 'action', button: '审核', render: (r) => DrawerButton({ label: '审核', pageId, rowKey: '__new__', formRow: r.applyNo }) },
];

const APPLY_FIELDS = [
  { label: '商品名称', key: 'skuName', type: 'text', readonly: true },
  { label: '变更类型', key: 'changeType', type: 'text', readonly: true },
  { label: '货主', key: 'owner', type: 'text', readonly: true },
  { label: '规格', key: 'spec', type: 'text', readonly: true },
  { label: '条码', key: 'barcode', type: 'text', readonly: true },
  { label: '单位', key: 'unit', type: 'text', readonly: true },
  { label: '箱规', key: 'packageSpec', type: 'text', readonly: true },
  { label: '温区', key: 'storageTemp', type: 'text', readonly: true },
  { label: '商品编码', key: 'skuCode', type: 'text' },
  { label: '申请说明', key: 'applyReason', type: 'textarea', readonly: true },
  { label: '变更前后值', key: 'changeBefore', type: 'textarea', readonly: true },
];

const REVIEW_FIELDS = [
  { label: '审核人', key: 'reviewer', type: 'text', readonly: true },
  { label: '审核时间', key: 'reviewTime', type: 'text', readonly: true },
  { label: '审核意见', key: 'reviewOpinion', type: 'textarea', placeholder: '请输入审核意见' },
  { label: '驳回原因', key: 'rejectReason', type: 'textarea', placeholder: '驳回时必填' },
];

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.reviewStatus === s).length;
  const columns = columnsOf(pageId);
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));

  const overlay = FormDrawer({
    pageId,
    title: '商品主档审核',
    note: '审核通过后按货主赋商品编码、版本递增并发布；已产生单据或批次的发布不可逆。',
    groups: [
      { title: '申请内容', fields: APPLY_FIELDS },
      { title: '审核留痕', fields: REVIEW_FIELDS },
    ],
    actions: [
      { label: '驳回', ghost: true, attrs: { 'data-form-action': 'reject' } },
      { label: '反审核', ghost: true, attrs: { 'data-form-action': 'republish' } },
      { label: '作废', ghost: true, attrs: { 'data-form-action': 'voidApply' } },
      { label: '审核通过', primary: true, attrs: { 'data-form-action': 'approve' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  });

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待审核', count: count('pendingReview'), field: 'reviewStatus', value: 'pendingReview' },
        { label: '已通过', count: count('approved'), field: 'reviewStatus', value: 'approved' },
        { label: '已驳回', count: count('rejectedReview'), field: 'reviewStatus', value: 'rejectedReview' },
        { label: '已撤回', count: count('withdrawn'), field: 'reviewStatus', value: 'withdrawn' },
        { label: '已作废', count: count('voided'), field: 'reviewStatus', value: 'voided' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '变更类型', key: 'changeType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.changeType))] },
        { label: '申请单号', key: 'applyNo', type: 'text', placeholder: '请输入申请单号' },
      ],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.reviewStatus, 'data-owner': r.owner }),
      emptyTitle: '暂无申请',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'applyNo', statusField: 'reviewStatus', storageKey: 'sku-audits', statusMeta, columns },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
