import { ListPage, DrawerButton, DrawerDetail, StatusTag, ProgressCell, n, dash, uniq } from '../../shared/ui.mjs';

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
  const { rows = [], details = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.processStatus === s).length;

  const overlay = rows.map((r) => {
    const d = details.find((x) => x.processNo === r.processNo) || {};
    return DrawerDetail({
      pageId,
      rowKey: r.processNo,
      title: '工序单详情',
      docNo: r.processNo,
      status: labelOf(r.processStatus),
      statusTone: toneOf(r.processStatus),
      fields: [
        { label: '工序单号', value: r.processNo },
        { label: '工序类型', value: d.processType },
        { label: '业务方向', value: d.bizSide },
        { label: '来源计划单', value: r.sourcePlans },
        { label: '仓库', value: d.warehouse },
        { label: '目标库区', value: r.targetZone },
        { label: '工序单状态', value: labelOf(r.processStatus) },
      ],
      columns: [
        { key: 'taskNo', label: '任务编号', width: '160px', cls: 'wx-col-strong' },
        { key: 'executor', label: '执行主体', width: '120px', render: (x) => dash(x.executor) },
        { key: 'targetBin', label: '目标库位', width: '120px', render: (x) => dash(x.targetBin) },
        { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (x) => n(x.planQty) },
        { key: 'doneQty', label: '已完成数量', width: '120px', align: 'right', render: (x) => n(x.doneQty) },
        { key: 'taskStatus', label: '任务状态', width: '108px', render: (x) => StatusTag(labelOf(x.taskStatus), toneOf(x.taskStatus)) },
      ],
      rows: d.rows || [],
      timeline: (d.timeline || []).map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
      actions: [
        { label: '拆任务', toast: '拆任务（原型示意）' },
        { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
      ],
    });
  }).join('');

  return {
    html: ListPage({
      unit: '单',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待作业', count: count('wait'), field: 'processStatus', value: 'wait' },
        { label: '作业中', count: count('busy'), field: 'processStatus', value: 'busy' },
        { label: '异常', count: count('blocked'), field: 'processStatus', value: 'blocked' },
        { label: '已完成', count: count('done'), field: 'processStatus', value: 'done' },
        { label: '已取消', count: count('closed'), field: 'processStatus', value: 'closed' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '目标库区', key: 'targetZone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.targetZone))] },
        { label: '工序单号', key: 'processNo', type: 'text', placeholder: '请输入工序单号', extra: true },
        { label: '来源计划单', key: 'sourcePlans', type: 'text', placeholder: '请输入计划单号', extra: true },
      ],
      toolbar: [
        { label: '生成收货单', toast: '生成收货单（原型示意）' },
        { label: '拆任务', ghost: true, toast: '拆任务（原型示意）' },
        { label: '打印', ghost: true, attrs: { 'data-print': '收货单' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'processNo', label: '工序单号', width: '160px', cls: 'wx-col-strong' },
        { key: 'processStatus', label: '工序单状态', width: '108px', render: (r) => StatusTag(labelOf(r.processStatus), toneOf(r.processStatus)) },
        { key: 'sourcePlans', label: '来源计划单', render: (r) => dash(r.sourcePlans) },
        { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
        { key: 'targetZone', label: '目标库区', width: '120px', render: (r) => dash(r.targetZone) },
        { key: 'rowCount', label: '行数', width: '100px', align: 'right', render: (r) => n(r.rowCount) },
        { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
        { key: 'doneQty', label: '已收数量', width: '120px', align: 'right', render: (r) => n(r.doneQty) },
        { key: 'progress', label: '作业进度', width: '160px', render: (r) => ProgressCell(r.doneQty, r.planQty) },
        { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ pageId, rowKey: r.processNo }) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.processStatus }),
      emptyTitle: '暂无收货单',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
