import { ReportPage, ReportHero, StatRow, Block, BaseTable, DrawerButton, DrawerDetail, StatusTag, DagGraph, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  normal: { label: '正常', type: 'enabled' },
  degraded: { label: '降级', type: 'pending' },
  fault: { label: '故障', type: 'rejected' },
  offline: { label: '离线', type: 'disabled' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const topology = data[ctx.pageKey] || {};
  const rows = topology.nodes || [];
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.nodeStatus === s).length;
  const faultCount = rows.filter((r) => ['fault', 'degraded'].includes(r.nodeStatus)).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.nodeCode,
    title: '自动化拓扑节点详情',
    docNo: r.nodeCode,
    status: labelOf(r.nodeStatus),
    statusTone: toneOf(r.nodeStatus),
    fields: [
      { label: '库区', value: r.zone }, { label: '工位', value: r.station },
      { label: '节点类型', value: r.nodeType }, { label: '连接状态', value: r.connectionStatus },
      { label: '关联设备', value: r.deviceCode }, { label: '当前任务数', value: r.currentTaskCount },
      { label: '替代路径', value: r.alternativePath }, { label: '节点状态', value: labelOf(r.nodeStatus) },
      { label: '最近告警', value: r.lastAlarm }, { label: '恢复结果', value: r.recoveryResult },
    ],
    columns: [
      { key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) },
      { key: 'event', label: '拓扑事件', render: (x) => dash(x.event) },
      { key: 'operator', label: '操作人', width: '100px', render: (x) => dash(x.operator) },
    ],
    rows: r.events || [],
    actions: [
      { label: '查看影响任务', toast: '影响任务列表（原型示意）' },
      { label: '切换替代路径', ghost: true, toast: '已提交替代路径切换（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  const graph = DagGraph({
    flowKey: `${pageId}-graph`,
    nodes: topology.graphNodes || [],
    edges: topology.edges || [],
    nodeW: 148,
    nodeH: 58,
    gapX: 28,
    gapY: 32,
    pad: 20,
  });
  const table = BaseTable({
    columns: [
      { key: 'nodeCode', label: '节点', width: '140px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.nodeCode, label: r.nodeCode }) },
      { key: 'zone', label: '库区', width: '110px', render: (r) => dash(r.zone) },
      { key: 'station', label: '工位', width: '110px', render: (r) => dash(r.station) },
      { key: 'nodeType', label: '节点类型', width: '110px', render: (r) => dash(r.nodeType) },
      { key: 'connectionStatus', label: '连接状态', width: '105px', render: (r) => dash(r.connectionStatus) },
      { key: 'deviceCode', label: '关联设备', width: '125px', render: (r) => dash(r.deviceCode) },
      { key: 'currentTaskCount', label: '当前任务数', width: '105px', align: 'right', render: (r) => n(r.currentTaskCount) },
      { key: 'alternativePath', label: '替代路径', width: '160px', render: (r) => dash(r.alternativePath) },
      { key: 'nodeStatus', label: '节点状态', width: '95px', render: (r) => StatusTag(labelOf(r.nodeStatus), toneOf(r.nodeStatus)) },
    ],
    rows,
    emptyTitle: '暂无自动化拓扑节点',
    emptyDesc: '当前没有可展示的库区、工位或设备节点。',
  });

  return {
    html: ReportPage({
      hero: ReportHero({ title: ctx.pageName, sub: `${topology.warehouse || '—'} · ${topology.snapshotAt || '—'}` }),
      stats: StatRow([
        { label: '节点总数', value: rows.length, tone: 'default' },
        { label: '正常节点', value: count('normal'), tone: 'ok' },
        { label: '问题节点', value: faultCount, tone: faultCount ? 'warn' : 'default' },
        { label: '当前任务', value: rows.reduce((sum, r) => sum + Number(r.currentTaskCount || 0), 0), tone: 'default' },
      ], { cols: 4 }),
      blocks: [
        Block({ title: '自动化拓扑', note: `${topology.warehouse || '—'} · ${topology.snapshotAt || '—'}`, body: graph }),
        Block({ title: '节点明细', note: `问题节点 ${faultCount} 个`, body: table }),
      ],
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
