import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待开始', type: 'pending' },
    doing: { label: '进行中', type: 'info' },
    done: { label: '已完成', type: 'enabled' },
    cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.kittingStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待开始', count: count('pending'), field: 'kittingStatus', value: 'pending' },
      { label: '进行中', count: count('doing'), field: 'kittingStatus', value: 'doing' },
      { label: '已完成', count: count('done'), field: 'kittingStatus', value: 'done' },
      { label: '已取消', count: count('cancelled'), field: 'kittingStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'taskNo', label: '任务号', width: '150px', render: (r) => dash(r.taskNo) },
      { key: 'taskType', label: '加工类型', width: '100px', render: (r) => dash(r.taskType) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'srcSku', label: '源商品', width: '150px', render: (r) => dash(r.srcSku) },
      { key: 'destSku', label: '目标商品', width: '150px', render: (r) => dash(r.destSku) },
      { key: 'qty', label: '数量', width: '90px', align: 'right', render: (r) => n(r.qty) },
      { key: 'consumeQty', label: '耗用数量', width: '110px', align: 'right', render: (r) => n(r.consumeQty) },
      { key: 'team', label: '班组', render: (r) => dash(r.team) },
      { key: 'kittingStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.kittingStatus), toneOf(r.kittingStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.kittingStatus }),
    emptyTitle: '暂无组套与库内加工',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
