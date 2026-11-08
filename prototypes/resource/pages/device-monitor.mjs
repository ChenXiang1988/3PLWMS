import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    idle: { label: '空闲', type: 'info' },
    running: { label: '运行', type: 'enabled' },
    fault: { label: '故障', type: 'rejected' },
    charging: { label: '充电', type: 'pending' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.runStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '空闲', count: count('idle'), field: 'runStatus', value: 'idle' },
      { label: '运行', count: count('running'), field: 'runStatus', value: 'running' },
      { label: '故障', count: count('fault'), field: 'runStatus', value: 'fault' },
      { label: '充电', count: count('charging'), field: 'runStatus', value: 'charging' },
    ],
    filters: [
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'deviceCode', label: '设备编码', width: '130px', render: (r) => dash(r.deviceCode) },
      { key: 'deviceType', label: '设备类型', width: '100px', render: (r) => dash(r.deviceType) },
      { key: 'runStatus', label: '运行状态', width: '100px', render: (r) => StatusTag(labelOf(r.runStatus), toneOf(r.runStatus)) },
      { key: 'currentTask', label: '当前任务', width: '150px', render: (r) => dash(r.currentTask) },
      { key: 'batteryLevel', label: '电量', width: '80px', align: 'right', render: (r) => n(r.batteryLevel) },
      { key: 'lastHeartbeat', label: '最近心跳', width: '157px', render: (r) => dash(r.lastHeartbeat) },
      { key: 'alarmCount', label: '告警数', width: '90px', align: 'right', render: (r) => n(r.alarmCount) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.runStatus }),
    emptyTitle: '暂无设备监控',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
