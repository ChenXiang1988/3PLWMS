import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待生效', type: 'pending' },
    active: { label: '已生效', type: 'enabled' },
    disabled: { label: '已停用', type: 'disabled' },
    expired: { label: '已过期', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.authStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待生效', count: count('pending'), field: 'authStatus', value: 'pending' },
      { label: '已生效', count: count('active'), field: 'authStatus', value: 'active' },
      { label: '已停用', count: count('disabled'), field: 'authStatus', value: 'disabled' },
      { label: '已过期', count: count('expired'), field: 'authStatus', value: 'expired' },
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
      { key: 'authNo', label: '授权号', width: '150px', render: (r) => dash(r.authNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'warehouse', label: '仓库', render: (r) => dash(r.warehouse) },
      { key: 'serviceScope', label: '服务范围', render: (r) => dash(r.serviceScope) },
      { key: 'agreementNo', label: '关联协议', width: '150px', render: (r) => dash(r.agreementNo) },
      { key: 'validFrom', label: '生效开始', width: '120px', render: (r) => dash(r.validFrom) },
      { key: 'validTo', label: '生效结束', width: '120px', render: (r) => dash(r.validTo) },
      { key: 'authStatus', label: '授权状态', width: '108px', render: (r) => StatusTag(labelOf(r.authStatus), toneOf(r.authStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.authStatus }),
    emptyTitle: '暂无货主仓授权',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
