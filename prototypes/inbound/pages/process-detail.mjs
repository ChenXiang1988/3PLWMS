import { DetailPage, StatusTag, n, dash } from '../../shared/ui.mjs';

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
  const { doc = {}, rows = [], timeline = [] } = data[ctx.pageKey] || {};
  const st = STATUS_META[doc.processStatus] || STATUS_META.wait;

  return DetailPage({
    docNo: doc.processNo || '—',
    status: st.label,
    statusTone: st.type,
    fields: [
      { label: '工序单号', value: doc.processNo },
      { label: '工序类型', value: doc.processType },
      { label: '业务方向', value: doc.bizSide },
      { label: '来源计划单', value: doc.sourcePlans },
      { label: '仓库', value: doc.warehouse },
      { label: '目标库区', value: doc.targetZone },
      { label: '工序单状态', value: st.label },
    ],
    columns: [
      { key: 'taskNo', label: '任务编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'executor', label: '执行主体', width: '120px', render: (r) => dash(r.executor) },
      { key: 'targetBin', label: '目标库位', width: '120px', render: (r) => dash(r.targetBin) },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'doneQty', label: '已完成数量', width: '120px', align: 'right', render: (r) => n(r.doneQty) },
      { key: 'taskStatus', label: '任务状态', width: '108px', render: (r) => StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)) },
    ],
    rows,
    timeline: timeline.map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
    actions: [
      { label: '拆任务', toast: '拆任务（原型示意）' },
      { label: '返回', ghost: true, toast: '返回（原型示意）' },
    ],
  });
}

export const PAGE_CSS = ``;
