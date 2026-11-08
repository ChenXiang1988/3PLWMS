import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待确认', type: 'pending' },
    confirmed: { label: '已确认', type: 'info' },
    arrived: { label: '已到车', type: 'enabled' },
    cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.appointmentStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待确认', count: count('pending'), field: 'appointmentStatus', value: 'pending' },
      { label: '已确认', count: count('confirmed'), field: 'appointmentStatus', value: 'confirmed' },
      { label: '已到车', count: count('arrived'), field: 'appointmentStatus', value: 'arrived' },
      { label: '已取消', count: count('cancelled'), field: 'appointmentStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '仓库', key: 'warehouse', type: 'text', placeholder: '请输入仓库' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'appointmentNo', label: '预约号', width: '150px', render: (r) => dash(r.appointmentNo) },
      { key: 'warehouse', label: '仓库', render: (r) => dash(r.warehouse) },
      { key: 'dock', label: '月台', render: (r) => dash(r.dock) },
      { key: 'docNo', label: '单据号', width: '160px', render: (r) => dash(r.docNo) },
      { key: 'direction', label: '方向', width: '80px', render: (r) => dash(r.direction) },
      { key: 'plateNo', label: '车牌', width: '110px', render: (r) => dash(r.plateNo) },
      { key: 'plannedAt', label: '计划到车', width: '157px', render: (r) => dash(r.plannedAt) },
      { key: 'arrivedAt', label: '实际到车', width: '157px', render: (r) => dash(r.arrivedAt) },
      { key: 'palletCount', label: '托盘数', width: '90px', align: 'right', render: (r) => n(r.palletCount) },
      { key: 'appointmentStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.appointmentStatus), toneOf(r.appointmentStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.appointmentStatus }),
    emptyTitle: '暂无月台预约计划',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
