import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

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
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.processStatus === s).length;

  return ListPage({
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
      { label: '承运商', key: 'carrier', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.carrier))] },
      { label: '工序单号', key: 'processNo', type: 'text', placeholder: '请输入工序单号', extra: true },
      { label: '来源计划单', key: 'sourcePlans', type: 'text', placeholder: '请输入计划单号', extra: true },
    ],
    toolbar: [
      { label: '生成交接单', toast: '生成交接单（原型示意）' },
      { label: '批量确认', ghost: true, toast: '批量确认（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'processNo', label: '工序单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'processStatus', label: '工序单状态', width: '108px', render: (r) => StatusTag(labelOf(r.processStatus), toneOf(r.processStatus)) },
      { key: 'sourcePlans', label: '来源计划单', render: (r) => dash(r.sourcePlans) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'carrier', label: '承运商', width: '120px', render: (r) => dash(r.carrier) },
      { key: 'packageCount', label: '包裹数', width: '120px', align: 'right', render: (r) => n(r.packageCount) },
      { key: 'handoverTime', label: '交接时间', width: '157px', render: (r) => dash(r.handoverTime) },
      { key: 'executor', label: '执行主体', width: '120px', render: (r) => dash(r.executor) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.processStatus }),
    emptyTitle: '暂无交接单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
