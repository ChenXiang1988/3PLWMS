import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    connected: { label: '已连接', type: 'enabled' },
    disconnected: { label: '未连接', type: 'disabled' },
    failed: { label: '连接失败', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.connectStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '已连接', count: count('connected'), field: 'connectStatus', value: 'connected' },
      { label: '未连接', count: count('disconnected'), field: 'connectStatus', value: 'disconnected' },
      { label: '连接失败', count: count('failed'), field: 'connectStatus', value: 'failed' },
    ],
    filters: [
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'driverCode', label: '驱动编码', width: '140px', render: (r) => dash(r.driverCode) },
      { key: 'deviceType', label: '设备类型', width: '100px', render: (r) => dash(r.deviceType) },
      { key: 'protocol', label: '协议', width: '80px', render: (r) => dash(r.protocol) },
      { key: 'endpoint', label: '端点', width: '220px', render: (r) => dash(r.endpoint) },
      { key: 'heartbeatSeconds', label: '心跳秒数', width: '100px', align: 'right', render: (r) => n(r.heartbeatSeconds) },
      { key: 'connectStatus', label: '连接状态', width: '100px', render: (r) => StatusTag(labelOf(r.connectStatus), toneOf(r.connectStatus)) },
      { key: 'lastTestAt', label: '最近测试', width: '157px', render: (r) => dash(r.lastTestAt) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.connectStatus }),
    emptyTitle: '暂无驱动与协议',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
