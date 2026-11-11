import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = { idle: { label: '空闲', type: 'info' }, running: { label: '运行', type: 'enabled' }, fault: { label: '故障', type: 'rejected' }, charging: { label: '充电', type: 'pending' } };
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.runStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.deviceCode, title: '设备执行与业务影响', docNo: r.deviceCode, status: labelOf(r.runStatus), statusTone: toneOf(r.runStatus),
    fields: [
      { label: '设备类型', value: r.deviceType }, { label: '区域', value: r.zone }, { label: '设备状态', value: labelOf(r.runStatus) },
      { label: '连接状态', value: r.connectionStatus }, { label: '业务任务号', value: r.businessTaskNo }, { label: '设备任务号', value: r.deviceTaskNo },
      { label: '目标点', value: r.targetPoint }, { label: '最近心跳', value: r.lastHeartbeat }, { label: '执行耗时', value: r.elapsed },
      { label: '重试次数', value: r.retryCount }, { label: '影响任务数', value: r.impactTaskCount }, { label: '人工接管', value: r.takeoverStatus },
    ],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '指令/回执', render: (x) => dash(x.event) }, { key: 'status', label: '状态', width: '100px', render: (x) => dash(x.status) }],
    rows: r.events || [],
    actions: [{ label: '查看任务队列', toast: '设备任务队列（原型示意）' }, { label: '重试', ghost: true, toast: '已提交设备任务重试（原型示意）' }, { label: '换设备', ghost: true, toast: '已打开换设备确认（原型示意）' }, { label: '转人工', ghost: true, toast: '已打开人工接管（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 10,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'runStatus', value }))],
    filters: [{ label: '区域', key: 'zone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zone).filter(Boolean))] }, { label: '设备类型', key: 'deviceType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.deviceType))] }, { label: '连接状态', key: 'connectionStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.connectionStatus).filter(Boolean))], extra: true }, { label: '业务影响', key: 'businessImpact', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.businessImpact).filter(Boolean))], extra: true }, { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true }],
    toolbar: [{ label: '查看设备任务', toast: '设备任务队列（原型示意）' }, { label: '暂停', ghost: true, toast: '已打开暂停确认（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [
      { key: 'deviceCode', label: '设备编码', width: '120px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.deviceCode, label: r.deviceCode }) },
      { key: 'deviceType', label: '设备类型', width: '90px', render: (r) => dash(r.deviceType) },
      { key: 'zone', label: '区域', width: '90px', render: (r) => dash(r.zone) },
      { key: 'runStatus', label: '设备状态', width: '95px', render: (r) => StatusTag(labelOf(r.runStatus), toneOf(r.runStatus)) },
      { key: 'connectionStatus', label: '连接状态', width: '95px', render: (r) => dash(r.connectionStatus) },
      { key: 'businessTaskNo', label: '业务任务号', width: '140px', render: (r) => dash(r.businessTaskNo || r.currentTask) },
      { key: 'deviceTaskNo', label: '设备任务号', width: '140px', render: (r) => dash(r.deviceTaskNo) },
      { key: 'targetPoint', label: '目标点', width: '100px', render: (r) => dash(r.targetPoint) },
      { key: 'lastHeartbeat', label: '最近心跳', width: '145px', render: (r) => dash(r.lastHeartbeat) },
      { key: 'impactTaskCount', label: '影响任务数', width: '95px', align: 'right', render: (r) => n(r.impactTaskCount ?? 0) },
    ], rows, rowAttrs: (r) => ({ 'data-status': r.runStatus }), emptyTitle: '暂无设备监控', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
