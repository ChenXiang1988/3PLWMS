import { DetailPage, dash } from '../../shared/ui.mjs';

const CERT_META = {
  unverified: { label: '未认证', tone: 'disabled' },
  pendingReview: { label: '待审核', tone: 'pending' },
  approved: { label: '已通过', tone: 'enabled' },
  rejectedReview: { label: '已驳回', tone: 'rejected' },
  withdrawn: { label: '已撤回', tone: 'disabled' },
};

export function renderPage(data, ctx) {
  const certs = (data[ctx.pageKey] || {}).rows || [];
  const doc = certs[0] || {};
  const materials = doc.materials || [];
  const meta = CERT_META[doc.certStatus] || CERT_META.unverified;
  const approved = doc.certStatus === 'approved';

  return DetailPage({
    docNo: doc.certNo || '—',
    status: meta.label,
    statusTone: meta.tone,
    note: '上传企业营业执照，由仓网管理端审批',
    fields: [
      { label: '企业名称', value: doc.enterpriseName },
      { label: '统一社会信用代码', value: doc.licenseNo },
      { label: '营业执照', value: doc.licenseFile },
      { label: '营业执照有效期', value: doc.licenseExpiry },
      { label: '提交时间', value: doc.submitTime },
      { label: '审核人', value: doc.reviewer },
      { label: '审核时间', value: doc.reviewTime },
      { label: '审批意见', value: doc.reviewRemark },
    ],
    columns: [
      { key: 'item', label: '材料', width: '200px' },
      { key: 'fileName', label: '附件', render: (r) => dash(r.fileName) },
      { key: 'uploadTime', label: '上传时间', width: '157px', render: (r) => dash(r.uploadTime) },
      { key: 'remark', label: '说明', render: (r) => dash(r.remark) },
    ],
    rows: materials,
    timeline: (doc.timeline || []).map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
    actions: approved
      ? [{ label: '返回', ghost: true, toast: '返回（原型示意）' }]
      : [
        { label: '上传营业执照', toast: '上传营业执照（原型示意）' },
        { label: doc.certStatus === 'rejectedReview' ? '重新提交' : '提交认证', primary: true, toast: '提交认证（原型示意）' },
        { label: '撤回认证', ghost: true, toast: '撤回认证（原型示意）' },
      ],
  });
}

export const PAGE_CSS = ``;
