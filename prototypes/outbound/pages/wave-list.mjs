import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  wait: { label: '待作业', type: 'pending' },
  busy: { label: '作业中', type: 'enabled' },
  blocked: { label: '异常', type: 'rejected' },
  done: { label: '已完成', type: 'disabled' },
  closed: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.waveStatus === s).length;

  return ListPage({
    unit: '个',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待作业', count: count('wait'), field: 'waveStatus', value: 'wait' },
      { label: '作业中', count: count('busy'), field: 'waveStatus', value: 'busy' },
      { label: '异常', count: count('blocked'), field: 'waveStatus', value: 'blocked' },
      { label: '已完成', count: count('done'), field: 'waveStatus', value: 'done' },
      { label: '已取消', count: count('closed'), field: 'waveStatus', value: 'closed' },
    ],
    filters: [
      { label: '波次号', key: 'waveNo', type: 'text', placeholder: '请输入波次号' },
      { label: '作业时段', key: 'workWindow', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.workWindow))], extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'waveNo', label: '波次号', width: '160px', cls: 'wx-col-strong' },
      {
        key: 'waveStatus', label: '波次状态', width: '108px',
        render: (r) => StatusTag(labelOf(r.waveStatus), toneOf(r.waveStatus)),
      },
      { key: 'workWindow', label: '作业时段', width: '157px', render: (r) => dash(r.workWindow) },
      { key: 'capacity', label: '容量上限', width: '120px', align: 'right', render: (r) => n(r.capacity) },
      { key: 'orderCount', label: '已排订单数', width: '120px', align: 'right', render: (r) => n(r.orderCount) },
      { key: 'remainCount', label: '剩余余量', width: '120px', align: 'right', render: (r) => n(Math.max(Number(r.capacity || 0) - Number(r.orderCount || 0), 0)) },
      { key: 'taskCount', label: '拣货任务数', width: '120px', align: 'right', render: (r) => n(r.taskCount) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.waveStatus }),
    emptyTitle: '暂无波次计划',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
