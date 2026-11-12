import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待分播', type: 'pending' },
    doing: { label: '分播中', type: 'info' },
    closed: { label: '已结格', type: 'enabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.sortStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待分播', count: count('pending'), field: 'sortStatus', value: 'pending' },
      { label: '分播中', count: count('doing'), field: 'sortStatus', value: 'doing' },
      { label: '已结格', count: count('closed'), field: 'sortStatus', value: 'closed' },
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
      { key: 'sortNo', label: '分播号', width: '150px', render: (r) => dash(r.sortNo) },
      { key: 'waveNo', label: '波次', width: '150px', render: (r) => dash(r.waveNo) },
      { key: 'station', label: '工作站', width: '110px', render: (r) => dash(r.station) },
      { key: 'firstContainer', label: '一次下架容器', width: '140px', render: (r) => dash(r.firstContainer) },
      { key: 'secondContainer', label: '分拣容器', width: '130px', render: (r) => dash(r.secondContainer) },
      { key: 'grid', label: '格口', width: '80px', render: (r) => dash(r.grid) },
      { key: 'orderCount', label: '订单数', width: '90px', align: 'right', render: (r) => n(r.orderCount) },
      { key: 'lineCount', label: '订单行数', width: '90px', align: 'right', render: (r) => n(r.lineCount) },
      { key: 'containerCount', label: '容器数', width: '85px', align: 'right', render: (r) => n(r.containerCount) },
      { key: 'pickedQty', label: '已拣数', width: '100px', align: 'right', render: (r) => n(r.pickedQty) },
      { key: 'sortStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.sortStatus), toneOf(r.sortStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.sortStatus }),
    emptyTitle: '暂无分播播种',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
