import { ListPage, DrawerButton, DrawerDetail, StatusTag, ProgressCell, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = { wait: { label: '待作业', type: 'pending' }, busy: { label: '作业中', type: 'enabled' }, blocked: { label: '阻塞', type: 'rejected' }, done: { label: '已完成', type: 'disabled' }, closed: { label: '已取消', type: 'disabled' } };
const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.processStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.processNo, title: '拣货单执行详情', docNo: r.processNo, status: labelOf(r.processStatus), statusTone: toneOf(r.processStatus),
    fields: [
      { label: '来源订单', value: r.sourcePlans }, { label: '波次号', value: r.waveNo }, { label: '区域/路线', value: r.route },
      { label: '执行单元', value: r.execUnit }, { label: '设备任务号', value: r.deviceTaskNo }, { label: '计划数量', value: r.planQty },
      { label: '已拣数量', value: r.doneQty }, { label: '短拣数量', value: r.shortPickQty }, { label: '短拣原因', value: r.shortPickReason },
      { label: '容器数', value: r.containerCount }, { label: '库存后续动作', value: r.stockFollowup }, { label: '执行可信度', value: r.confidence },
    ],
    columns: [{ key: 'event', label: '执行事件', render: (x) => dash(x.event) }, { key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'source', label: '来源', width: '100px', render: (x) => dash(x.source) }],
    rows: r.events || [],
    actions: [{ label: '派工/重派', toast: '已打开执行单元选择（原型示意）' }, { label: '登记短拣', ghost: true, toast: '已打开短拣登记（原型示意）' }, { label: '转人工', ghost: true, toast: '已打开人工接管（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '单', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'processStatus', value }))],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '波次号', key: 'waveNo', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.waveNo))] },
      { label: '任务状态', key: 'processStatus', type: 'select', options: ['全部', ...Object.values(STATUS_META).map((x) => x.label)] },
      { label: '短拣状态', key: 'shortPickStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.shortPickStatus).filter(Boolean))], extra: true },
      { label: '执行单元', key: 'execUnit', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.execUnit).filter(Boolean))], extra: true },
      { label: '工序单号', key: 'processNo', type: 'text', placeholder: '请输入工序单号', extra: true },
    ],
    toolbar: [{ label: '生成拣货单', toast: '生成拣货单（原型示意）' }, { label: '拆任务', ghost: true, toast: '拆任务（原型示意）' }, { label: '合并任务', ghost: true, toast: '合并任务（原型示意）' }, { label: '打印', ghost: true, attrs: { 'data-print': '拣货单' } }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [
      { key: 'processNo', label: '工序单号', width: '160px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.processNo, label: r.processNo }) },
      { key: 'processStatus', label: '工序单状态', width: '105px', render: (r) => StatusTag(labelOf(r.processStatus), toneOf(r.processStatus)) },
      { key: 'sourcePlans', label: '来源计划单', width: '160px', render: (r) => dash(r.sourcePlans) },
      { key: 'waveNo', label: '波次号', width: '145px', render: (r) => dash(r.waveNo) },
      { key: 'route', label: '区域/路线', width: '110px', render: (r) => dash(r.route) },
      { key: 'planQty', label: '计划数量', width: '90px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'doneQty', label: '已拣数量', width: '90px', align: 'right', render: (r) => n(r.doneQty) },
      { key: 'shortPickQty', label: '短拣数量', width: '90px', align: 'right', render: (r) => n(r.shortPickQty) },
      { key: 'progress', label: '作业进度', width: '150px', render: (r) => ProgressCell(r.doneQty, r.planQty) },
      { key: 'execUnit', label: '执行单元', width: '125px', render: (r) => dash(r.execUnit) },
    ], rows, rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.processStatus }), emptyTitle: '暂无拣货单', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
