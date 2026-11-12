import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '已生效', type: 'enabled' },
  pending: { label: '待生效', type: 'pending' },
  disabled: { label: '已停用', type: 'disabled' },
  expired: { label: '已过期', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.authStatus === s).length;

  return ListPage({
    unit: '家',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '已生效', count: count('active'), field: 'authStatus', value: 'active' },
      { label: '待生效', count: count('pending'), field: 'authStatus', value: 'pending' },
      { label: '已停用', count: count('disabled'), field: 'authStatus', value: 'disabled' },
      { label: '已过期', count: count('expired'), field: 'authStatus', value: 'expired' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '服务范围', key: 'serviceScope', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.serviceScope))] },
      { label: '授权状态', key: 'authStatus', type: 'select', options: ['全部', ...Object.values(STATUS_META).map((s) => s.label)], extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'ownerCode', label: '客户编码', width: '120px', cls: 'wx-col-strong', render: (r) => dash(r.ownerCode) },
      { key: 'owner', label: '客户名称', width: '150px', render: (r) => dash(r.owner) },
      { key: 'contact', label: '联系人', width: '110px', render: (r) => dash(r.contact) },
      { key: 'contactPhone', label: '联系电话', width: '145px', render: (r) => dash(r.contactPhone) },
      { key: 'serviceScope', label: '服务范围', width: '160px', render: (r) => dash(r.serviceScope) },
      { key: 'agreementNo', label: '关联协议', width: '140px', render: (r) => dash(r.agreementNo) },
      { key: 'authStatus', label: '服务状态', width: '108px', render: (r) => StatusTag(labelOf(r.authStatus), toneOf(r.authStatus)) },
      { key: 'validTo', label: '有效期至', width: '120px', render: (r) => dash(r.validTo) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.authStatus }),
    emptyTitle: '暂无本仓客户',
    emptyDesc: '当前仓库没有符合条件的客户服务关系。',
  });
}

export const PAGE_CSS = ``;
