import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待认领', type: 'pending' },
    claimed: { label: '已认领', type: 'enabled' },
    duplicate: { label: '已标记重复', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.claimStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待认领', count: count('pending'), field: 'claimStatus', value: 'pending' },
      { label: '已认领', count: count('claimed'), field: 'claimStatus', value: 'claimed' },
      { label: '已标记重复', count: count('duplicate'), field: 'claimStatus', value: 'duplicate' },
    ],
    filters: [
      { label: '来源', key: 'source', type: 'text', placeholder: '请输入来源' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'source', label: '来源', render: (r) => dash(r.source) },
      { key: 'sourceUrl', label: '来源链接', width: '260px', render: (r) => dash(r.sourceUrl) },
      { key: 'title', label: '标题', render: (r) => dash(r.title) },
      { key: 'claimStatus', label: '认领状态', width: '108px', render: (r) => StatusTag(labelOf(r.claimStatus), toneOf(r.claimStatus)) },
      { key: 'dupStatus', label: '去重状态', width: '108px', render: (r) => dash(r.dupStatus) },
      { key: 'collectTime', label: '采集时间', width: '157px', render: (r) => dash(r.collectTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.claimStatus }),
    emptyTitle: '暂无采集箱',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
