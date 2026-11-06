import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.countStatus === s).length;

  return ListPage({
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
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'countNo', label: '盘点单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'countStatus', label: '盘点状态', width: '108px', render: (r) => StatusTag(labelOf(r.countStatus), toneOf(r.countStatus)) },
      { key: 'countScope', label: '盘点范围', render: (r) => dash(r.countScope) },
      { key: 'binCount', label: '库位数', width: '120px', align: 'right', render: (r) => n(r.binCount) },
      { key: 'diffCount', label: '差异数', width: '120px', align: 'right', render: (r) => n(r.diffCount) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.countStatus }),
    emptyTitle: '暂无盘点任务',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
