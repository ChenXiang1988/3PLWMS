import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待派', type: 'pending' },
    assigned: { label: '已派', type: 'info' },
    doing: { label: '执行中', type: 'info' },
    done: { label: '已完成', type: 'enabled' },
    cancelled: { label: '已取消', type: 'disabled' },
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
      { label: '待派', count: count('pending'), field: 'taskStatus', value: 'pending' },
      { label: '已派', count: count('assigned'), field: 'taskStatus', value: 'assigned' },
      { label: '执行中', count: count('doing'), field: 'taskStatus', value: 'doing' },
      { label: '已完成', count: count('done'), field: 'taskStatus', value: 'done' },
      { label: '已取消', count: count('cancelled'), field: 'taskStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '执行人', key: 'assignee', type: 'text', placeholder: '请输入执行人' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'taskNo', label: '任务号', width: '150px', render: (r) => dash(r.taskNo) },
      { key: 'taskType', label: '任务类型', width: '110px', render: (r) => dash(r.taskType) },
      { key: 'docNo', label: '单据号', width: '160px', render: (r) => dash(r.docNo) },
      { key: 'taskStatus', label: '任务状态', width: '100px', render: (r) => StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)) },
      { key: 'deviceStatus', label: '设备状态', width: '100px', render: (r) => dash(r.deviceStatus) },
      { key: 'assignee', label: '执行人', render: (r) => dash(r.assignee) },
      { key: 'priority', label: '优先级', width: '80px', render: (r) => dash(r.priority) },
      { key: 'retryCount', label: '重试次数', width: '100px', align: 'right', render: (r) => n(r.retryCount) },
      { key: 'plannedAt', label: '计划时间', width: '157px', render: (r) => dash(r.plannedAt) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.taskStatus }),
    emptyTitle: '暂无任务池与派工',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
