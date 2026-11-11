import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq, BaseTable, BarRows, EmptyState, Block } from '../../shared/ui.mjs';

export const STATUS_META = { pending: { label: '待处理', type: 'pending' }, doing: { label: '处理中', type: 'info' }, done: { label: '已处理', type: 'enabled' } };
const LEVEL_META = { info: { label: '提示', type: 'info' }, warning: { label: '警告', type: 'pending' }, critical: { label: '严重', type: 'rejected' } };
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.handleStatus === s).length;
  const clusters = Object.values(rows.reduce((acc, row) => {
    const key = row.reasonCategory || row.unifiedCode || '未分类';
    const item = acc[key] || { reasonCategory: key, alarmCount: 0, impactTaskCount: 0, repeatRate: '0%', ruleHitCount: 0 };
    item.alarmCount += 1;
    item.impactTaskCount += Number(row.impactTaskCount || 0);
    item.ruleHitCount += row.ruleHit ? 1 : 0;
    item.repeatRate = row.repeatRate || item.repeatRate;
    acc[key] = item;
    return acc;
  }, {}));
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.alarmNo, title: '告警处置与故障影响闭环', docNo: r.alarmNo, status: labelOf(r.handleStatus), statusTone: toneOf(r.handleStatus),
    fields: [
      { label: '设备', value: r.deviceCode }, { label: '区域', value: r.zone }, { label: '告警级别', value: (LEVEL_META[r.level] || {}).label },
      { label: '告警码', value: r.alarmCode }, { label: '统一错误码', value: r.unifiedCode }, { label: '影响任务数', value: r.impactTaskCount },
      { label: '受影响业务任务', value: r.impactTasks }, { label: '任务处置', value: r.taskDisposition }, { label: '替代资源', value: r.alternativeResource },
      { label: '当前处置人', value: r.handler }, { label: '人工接管结果', value: r.takeoverResult }, { label: 'SLA', value: r.sla },
      { label: '消息状态', value: r.messageStatus }, { label: '恢复校验', value: r.recoveryCheck }, { label: '关闭原因', value: r.closeReason },
    ],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '处置记录', render: (x) => dash(x.event) }, { key: 'operator', label: '操作人', width: '100px', render: (x) => dash(x.operator) }],
    rows: r.events || [],
    actions: [{ label: '认领', toast: '已认领告警（原型示意）' }, { label: '暂停相关任务', ghost: true, confirm: '暂停后受影响任务不再继续下发，是否继续？', toast: '已打开影响任务暂停确认（原型示意）' }, { label: '转人工', ghost: true, confirm: '转人工后自动设备不再执行受影响任务，是否继续？', toast: '已登记人工接管（原型示意）' }, { label: '查看消息流水', ghost: true, toast: '消息流水与死信补发（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  const listHtml = ListPage({
    unit: '条', pageSize: 10,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'handleStatus', value }))],
    filters: [{ label: '设备类型', key: 'deviceType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.deviceType).filter(Boolean))] }, { label: '区域', key: 'zone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zone).filter(Boolean))] }, { label: '告警级别', key: 'level', type: 'select', options: ['全部', '提示', '警告', '严重'] }, { label: '影响任务', key: 'impactTaskCount', type: 'select', options: ['全部', '有影响', '无影响'], extra: true }, { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true }],
    toolbar: [{ label: '认领告警', toast: '已打开告警认领（原型示意）' }, { label: '暂停任务', ghost: true, toast: '已打开影响任务暂停确认（原型示意）' }, { label: '转人工', ghost: true, toast: '已打开人工接管确认（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [
      { key: 'alarmNo', label: '告警号', width: '145px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.alarmNo, label: r.alarmNo }) }, { key: 'deviceCode', label: '设备/区域', width: '130px', render: (r) => dash(`${r.deviceCode || '—'} / ${r.zone || '—'}`) }, { key: 'level', label: '级别', width: '75px', render: (r) => StatusTag((LEVEL_META[r.level] || {}).label || dash(r.level), (LEVEL_META[r.level] || {}).type || 'info') }, { key: 'alarmCode', label: '告警码', width: '90px', render: (r) => dash(r.alarmCode) }, { key: 'raisedAt', label: '触发时间', width: '145px', render: (r) => dash(r.raisedAt) }, { key: 'impactTaskCount', label: '影响任务数', width: '95px', align: 'right', render: (r) => n(r.impactTaskCount ?? 0) }, { key: 'taskDisposition', label: '任务处置', width: '135px', render: (r) => dash(r.taskDisposition) }, { key: 'handleStatus', label: '工单状态', width: '95px', render: (r) => StatusTag(labelOf(r.handleStatus), toneOf(r.handleStatus)) }, { key: 'downMinutes', label: '停机分钟', width: '90px', align: 'right', render: (r) => n(r.downMinutes) },
    ], rows, rowAttrs: (r) => ({ 'data-status': r.handleStatus }), emptyTitle: '暂无告警与故障工单', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  const clusterTable = BaseTable({
    columns: [
      { key: 'reasonCategory', label: '原因分类', width: '180px', render: (r) => dash(r.reasonCategory) },
      { key: 'alarmCount', label: '出现次数', width: '100px', align: 'right', render: (r) => n(r.alarmCount) },
      { key: 'impactTaskCount', label: '影响任务数', width: '110px', align: 'right', render: (r) => n(r.impactTaskCount) },
      { key: 'repeatRate', label: '重复故障率', width: '110px', align: 'right', render: (r) => dash(r.repeatRate) },
      { key: 'ruleHitCount', label: '规则命中', width: '95px', align: 'right', render: (r) => n(r.ruleHitCount) },
    ], rows: clusters, emptyTitle: '暂无异常原因聚类', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  return { html: `${listHtml.html}${Block({ title: '异常原因聚类', note: `共 ${clusters.length} 类`, body: `${clusterTable}<div class="wx-block-head"><b>原因分布</b><span>按出现次数汇总</span></div>${clusters.length ? BarRows(clusters.map((r) => ({ label: r.reasonCategory, value: r.alarmCount }))) : EmptyState({ title: '暂无异常原因聚类', desc: '当前筛选条件下没有任何记录。' })}` })}${overlay}`, overlay };
}
export const PAGE_CSS = ``;
