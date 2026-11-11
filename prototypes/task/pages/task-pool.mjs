import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待派', type: 'pending' }, assigned: { label: '已派', type: 'info' }, doing: { label: '执行中', type: 'info' },
  blocked: { label: '阻塞', type: 'rejected' }, done: { label: '已完成', type: 'enabled' }, cancelled: { label: '已取消', type: 'disabled' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const pageIdOf = (ctx) => `${ctx.moduleId}/${ctx.pageKey}`;

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = pageIdOf(ctx);
  const count = (s) => rows.filter((r) => r.taskStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.taskNo, title: '任务准入、重排与人工接管', docNo: r.taskNo, status: labelOf(r.taskStatus), statusTone: toneOf(r.taskStatus),
    fields: [
      { label: '来源单据', value: r.docNo }, { label: '任务类型', value: r.taskType }, { label: '区域', value: r.zone },
      { label: '设备状态', value: r.deviceStatus }, { label: '执行单元', value: r.execUnit || r.assignee }, { label: '设备任务号', value: r.deviceTaskNo },
      { label: '阻塞原因', value: r.blockReason }, { label: '影响告警', value: r.impactAlarmNo }, { label: '替代资源', value: r.alternativeResource },
      { label: '重排结果', value: r.rescheduleResult }, { label: '人工接管', value: r.manualTakeover }, { label: '状态可信度', value: r.confidence },
      { label: '重试次数', value: r.retryCount }, { label: 'SLA 截止', value: r.slaDue },
    ],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '任务事件', render: (x) => dash(x.event) }, { key: 'operator', label: '来源', width: '100px', render: (x) => dash(x.operator) }],
    rows: r.events || [],
    actions: [
      { label: '重新排程', toast: `已提交 ${r.taskNo} 重排（原型示意）` },
      { label: '切换替代资源', ghost: true, toast: '已登记替代资源切换（原型示意）' },
      { label: '转人工接管', ghost: true, confirm: '转人工后自动设备不再继续执行该任务，是否继续？', toast: '已登记人工接管（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');
  return {
    html: ListPage({
      unit: '条', pageSize: 10,
      statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'taskStatus', value }))],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner).filter(Boolean))] },
        { label: '区域', key: 'zone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zone).filter(Boolean))] },
        { label: '阻塞原因', key: 'blockReason', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.blockReason).filter(Boolean))] },
        { label: '执行单元', key: 'execUnit', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.execUnit).filter(Boolean))], extra: true },
        { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
      ],
      toolbar: [{ label: '派工', toast: '已打开派工确认（原型示意）' }, { label: '重排', ghost: true, toast: '已打开重排确认（原型示意）' }, { label: '转人工', ghost: true, toast: '已打开人工接管确认（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
      showCount: true,
      columns: [
        { key: 'taskNo', label: '任务号', width: '150px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.taskNo, label: r.taskNo }) },
        { key: 'taskType', label: '任务类型', width: '100px', render: (r) => dash(r.taskType) }, { key: 'docNo', label: '来源单据', width: '145px', render: (r) => dash(r.docNo) },
        { key: 'taskStatus', label: '任务状态', width: '92px', render: (r) => StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)) }, { key: 'zone', label: '区域', width: '90px', render: (r) => dash(r.zone) },
        { key: 'blockReason', label: '阻塞原因', width: '130px', render: (r) => dash(r.blockReason) }, { key: 'alternativeResource', label: '替代资源', width: '145px', render: (r) => dash(r.alternativeResource) },
        { key: 'execUnit', label: '执行单元', width: '135px', render: (r) => dash(r.execUnit || r.assignee) }, { key: 'manualTakeover', label: '人工接管', width: '100px', render: (r) => dash(r.manualTakeover) },
        { key: 'retryCount', label: '重试次数', width: '90px', align: 'right', render: (r) => n(r.retryCount) },
      ], rows, rowAttrs: (r) => ({ 'data-status': r.taskStatus, 'data-block-reason': r.blockReason || '' }), emptyTitle: '暂无任务池与派工', emptyDesc: '当前筛选条件下没有任何记录。',
    }), overlay,
  };
}
export const PAGE_CSS = ``;
