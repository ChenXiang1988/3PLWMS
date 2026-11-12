import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  connected: { label: '已连接', type: 'enabled' },
  disconnected: { label: '未连接', type: 'disabled' },
  failed: { label: '连接失败', type: 'rejected' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.connectStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.driverCode, title: '连接器与协议治理', docNo: r.driverCode,
    status: labelOf(r.connectStatus), statusTone: toneOf(r.connectStatus),
    fields: [
      { label: 'RCS 厂商', value: r.rcsPartner }, { label: '业务任务接入', value: r.businessTaskScope },
      { label: '设备类型', value: r.deviceType }, { label: '协议', value: r.protocol },
      { label: '协议版本', value: r.protocolVersion }, { label: '端点', value: r.endpoint },
      { label: '凭证状态', value: r.credentialStatus }, { label: '心跳秒数', value: r.heartbeatSeconds },
      { label: '连接状态', value: labelOf(r.connectStatus) }, { label: '最近测试', value: r.lastTestAt },
      { label: '状态码映射', value: r.statusMapping }, { label: '错误码映射', value: r.errorMapping },
      { label: '回执处理', value: r.receiptHandling }, { label: '重试策略', value: r.retryPolicy }, { label: '补偿入口', value: r.compensationEntry },
      { label: '健康检查', value: r.healthCheck }, { label: '最近失败', value: r.lastFailure },
    ],
    columns: [
      { key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) },
      { key: 'event', label: '连接事件', render: (x) => dash(x.event) },
      { key: 'result', label: '结果', width: '100px', render: (x) => dash(x.result) },
    ],
    rows: r.events || [],
    actions: [
      { label: '测试连接', toast: '已提交连接测试（原型示意）' },
      { label: '状态重同步', ghost: true, toast: '已提交连接状态重同步（原型示意）' },
      { label: '查看设备能力', ghost: true, toast: '设备能力矩阵（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条', pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '已连接', count: count('connected'), field: 'connectStatus', value: 'connected' },
        { label: '未连接', count: count('disconnected'), field: 'connectStatus', value: 'disconnected' },
        { label: '连接失败', count: count('failed'), field: 'connectStatus', value: 'failed' },
      ],
      filters: [
        { label: '设备类型', key: 'deviceType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.deviceType))] },
        { label: '协议', key: 'protocol', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.protocol))] },
        { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
      ],
      toolbar: [
        { label: '新增连接器', toast: '新增连接器（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'driverCode', label: '驱动编码', width: '140px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.driverCode, label: r.driverCode }) },
        { key: 'rcsPartner', label: 'RCS 厂商', width: '120px', render: (r) => dash(r.rcsPartner) },
        { key: 'deviceType', label: '设备类型', width: '100px', render: (r) => dash(r.deviceType) },
        { key: 'protocol', label: '协议', width: '80px', render: (r) => dash(`${r.protocol} ${r.protocolVersion || ''}`) },
        { key: 'endpoint', label: '端点', width: '220px', render: (r) => dash(r.endpoint) },
        { key: 'credentialStatus', label: '凭证状态', width: '100px', render: (r) => dash(r.credentialStatus) },
        { key: 'heartbeatSeconds', label: '心跳秒数', width: '100px', align: 'right', render: (r) => n(r.heartbeatSeconds) },
        { key: 'connectStatus', label: '连接状态', width: '100px', render: (r) => StatusTag(labelOf(r.connectStatus), toneOf(r.connectStatus)) },
        { key: 'lastTestAt', label: '最近测试', width: '157px', render: (r) => dash(r.lastTestAt) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.connectStatus }),
      emptyTitle: '暂无驱动与协议',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
