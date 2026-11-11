import { ListPage, StatusTag, DrawerButton, DrawerDetail, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  wait: { label: '待作业', type: 'pending' },
  busy: { label: '作业中', type: 'enabled' },
  blocked: { label: '异常', type: 'rejected' },
  done: { label: '已完成', type: 'disabled' },
  closed: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const pctOf = (done, plan) => (plan ? `${Math.min(100, Math.round(((Number(done) || 0) / Number(plan)) * 100))}%` : '—');

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.taskStatus === s).length;
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));

  const columns = [
    { key: 'taskNo', label: '任务编号', width: '160px', cls: 'wx-col-strong', type: 'text', render: (r) => DrawerButton({ label: r.taskNo, pageId, rowKey: r.taskNo }) },
    { key: 'taskStatus', label: '任务状态', width: '108px', type: 'status', render: (r) => StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)) },
    { key: 'owner', label: '货主', width: '120px', type: 'text', render: (r) => dash(r.owner) },
    { key: 'skuCode', label: '商品编码', width: '160px', type: 'text', render: (r) => dash(r.skuCode) },
    { key: 'fromBin', label: '来源库位', width: '120px', type: 'text', render: (r) => dash(r.fromBin) },
    { key: 'toBin', label: '目标库位', width: '120px', type: 'text', render: (r) => dash(r.toBin) },
    { key: 'planQty', label: '计划数量', width: '120px', align: 'right', type: 'num', render: (r) => n(r.planQty) },
    { key: 'doneQty', label: '已补数量', width: '120px', align: 'right', type: 'num', sortable: true, render: (r) => n(r.doneQty) },
    { key: 'createTime', label: '创建时间', width: '157px', type: 'text', sortable: true, render: (r) => dash(r.createTime) },
    { key: 'action', label: '操作', width: '108px', type: 'action', action: 'detail', button: '查看详情', render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.taskNo }) },
  ];

  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.taskNo, title: '补货任务详情', docNo: r.taskNo,
    status: labelOf(r.taskStatus), statusTone: toneOf(r.taskStatus),
    fields: [
      { label: '货主', value: r.owner },
      { label: '商品编码', value: r.skuCode },
      { label: '来源库位', value: r.fromBin },
      { label: '目标库位', value: r.toBin },
      { label: '计划数量', value: r.planQty },
      { label: '已补数量', value: r.doneQty },
      { label: '作业进度', value: pctOf(r.doneQty, r.planQty) },
      { label: '创建时间', value: r.createTime },
    ],
    actions: [
      { label: '确认完成', attrs: { 'data-toast': '确认完成（原型示意）' } },
      { label: '异常登记', ghost: true, attrs: { 'data-toast': '异常登记（原型示意）' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待作业', count: count('wait'), field: 'taskStatus', value: 'wait' },
        { label: '作业中', count: count('busy'), field: 'taskStatus', value: 'busy' },
        { label: '异常', count: count('blocked'), field: 'taskStatus', value: 'blocked' },
        { label: '已完成', count: count('done'), field: 'taskStatus', value: 'done' },
        { label: '已取消', count: count('closed'), field: 'taskStatus', value: 'closed' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '任务编号', key: 'taskNo', type: 'text', placeholder: '请输入任务编号' },
        { label: '来源库位', key: 'fromBin', type: 'text', placeholder: '请输入来源库位', extra: true },
      ],
      selectable: true,
      selectKey: 'taskNo',
      bulk: [{ label: '批量确认', status: 'done' }, { label: '批量异常登记', status: 'blocked' }],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.taskStatus }),
      emptyTitle: '暂无补货任务',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'taskNo', statusField: 'taskStatus', storageKey: 'wh-replenish', statusMeta, columns },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
