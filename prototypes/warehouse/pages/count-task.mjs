import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const TASK_META = {
  wait: { label: '待作业', type: 'pending' },
  busy: { label: '作业中', type: 'enabled' },
  blocked: { label: '异常', type: 'rejected' },
  done: { label: '已完成', type: 'disabled' },
  closed: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const taskLabel = (s) => (TASK_META[s] || {}).label || '—';
const taskTone = (s) => (TASK_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [], details = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.countStatus === s).length;

  const overlay = rows.map((r) => {
    const d = details.find((x) => x.countNo === r.countNo) || {};
    return DrawerDetail({
      pageId,
      rowKey: r.countNo,
      title: '盘点单详情',
      docNo: r.countNo,
      status: labelOf(r.countStatus),
      statusTone: toneOf(r.countStatus),
      fields: [
        { label: '盘点单号', value: r.countNo },
        { label: '盘点状态', value: labelOf(r.countStatus) },
        { label: '盘点范围', value: r.countScope },
        { label: '库位数', value: n(r.binCount) },
        { label: '差异数', value: n(r.diffCount) },
        { label: '创建时间', value: r.createTime },
      ],
      columns: [
        { key: 'taskNo', label: '任务编号', width: '160px', cls: 'wx-col-strong' },
        { key: 'operator', label: '执行人', width: '108px', render: (x) => dash(x.operator) },
        { key: 'zone', label: '目标库区', width: '140px', render: (x) => dash(x.zone) },
        { key: 'planQty', label: '计划数量', width: '108px', align: 'right', render: (x) => n(x.planQty) },
        { key: 'doneQty', label: '已做数量', width: '108px', align: 'right', render: (x) => n(x.doneQty) },
        { key: 'taskStatus', label: '任务状态', width: '108px', render: (x) => StatusTag(taskLabel(x.taskStatus), taskTone(x.taskStatus)) },
      ],
      rows: d.tasks || [],
      timeline: (d.timeline || []).map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
      actions: [
        { label: '差异复核', toast: '差异复核（原型示意）' },
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
        { label: '待处理', count: count('pending'), field: 'countStatus', value: 'pending' },
        { label: '进行中', count: count('doing'), field: 'countStatus', value: 'doing' },
        { label: '异常待处理', count: count('exception'), field: 'countStatus', value: 'exception' },
        { label: '已完成', count: count('completed'), field: 'countStatus', value: 'completed' },
        { label: '已取消', count: count('cancelled'), field: 'countStatus', value: 'cancelled' },
      ],
      filters: [
        { label: '盘点单号', key: 'countNo', type: 'text', placeholder: '请输入盘点单号' },
        { label: '盘点范围', key: 'countScope', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.countScope))], extra: true },
      ],
      toolbar: [
        { label: '差异复核', toast: '差异复核（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'countNo', label: '盘点单号', width: '160px', cls: 'wx-col-strong' },
        { key: 'countStatus', label: '盘点状态', width: '108px', render: (r) => StatusTag(labelOf(r.countStatus), toneOf(r.countStatus)) },
        { key: 'countScope', label: '盘点范围', render: (r) => dash(r.countScope) },
        { key: 'binCount', label: '库位数', width: '108px', align: 'right', render: (r) => n(r.binCount) },
        { key: 'diffCount', label: '差异数', width: '108px', align: 'right', render: (r) => n(r.diffCount) },
        { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
        { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ pageId, rowKey: r.countNo }) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.countStatus }),
      emptyTitle: '暂无盘点单',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
