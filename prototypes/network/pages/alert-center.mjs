import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待处理', type: 'pending' },
    doing: { label: '处理中', type: 'info' },
    done: { label: '已处理', type: 'enabled' },
    waived: { label: '已豁免', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const LEVEL_META = { info: { label: '提示', type: 'info' }, warning: { label: '警告', type: 'pending' }, critical: { label: '严重', type: 'rejected' } };

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.handleStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待处理', count: count('pending'), field: 'handleStatus', value: 'pending' },
      { label: '处理中', count: count('doing'), field: 'handleStatus', value: 'doing' },
      { label: '已处理', count: count('done'), field: 'handleStatus', value: 'done' },
      { label: '已豁免', count: count('waived'), field: 'handleStatus', value: 'waived' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '告警类型', key: 'alertType', type: 'text', placeholder: '请输入告警类型' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'alertNo', label: '告警号', width: '150px', render: (r) => dash(r.alertNo) },
      { key: 'alertType', label: '告警类型', render: (r) => dash(r.alertType) },
      { key: 'level', label: '级别', width: '90px', render: (r) => StatusTag((LEVEL_META[r.level] || {}).label || dash(r.level), (LEVEL_META[r.level] || {}).type || 'info') },
      { key: 'warehouse', label: '仓库', render: (r) => dash(r.warehouse) },
      { key: 'objectRef', label: '对象', width: '160px', render: (r) => dash(r.objectRef) },
      { key: 'raisedAt', label: '触发时间', width: '157px', render: (r) => dash(r.raisedAt) },
      { key: 'handleStatus', label: '处理状态', width: '108px', render: (r) => StatusTag(labelOf(r.handleStatus), toneOf(r.handleStatus)) },
      { key: 'workOrderNo', label: '工单号', width: '150px', render: (r) => dash(r.workOrderNo) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.handleStatus }),
    emptyTitle: '暂无告警中心',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
