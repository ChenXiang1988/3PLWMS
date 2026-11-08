import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待提交', type: 'pending' },
    running: { label: '刊登中', type: 'info' },
    done: { label: '已刊登', type: 'enabled' },
    failed: { label: '失败', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.taskStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待提交', count: count('pending'), field: 'taskStatus', value: 'pending' },
      { label: '刊登中', count: count('running'), field: 'taskStatus', value: 'running' },
      { label: '已刊登', count: count('done'), field: 'taskStatus', value: 'done' },
      { label: '失败', count: count('failed'), field: 'taskStatus', value: 'failed' },
    ],
    filters: [
      { label: '目标平台', key: 'platform', type: 'text', placeholder: '请输入目标平台' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'taskNo', label: '任务号', width: '160px', render: (r) => dash(r.taskNo) },
      { key: 'platform', label: '目标平台', render: (r) => dash(r.platform) },
      { key: 'shop', label: '店铺', render: (r) => dash(r.shop) },
      { key: 'listingCount', label: 'Listing 数', width: '110px', align: 'right', render: (r) => n(r.listingCount) },
      { key: 'taskStatus', label: '任务状态', width: '108px', render: (r) => StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)) },
      { key: 'failReason', label: '失败原因', render: (r) => dash(r.failReason) },
      { key: 'retryCount', label: '重试次数', width: '100px', align: 'right', render: (r) => n(r.retryCount) },
      { key: 'submitTime', label: '提交时间', width: '157px', render: (r) => dash(r.submitTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.taskStatus }),
    emptyTitle: '暂无刊登任务',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
