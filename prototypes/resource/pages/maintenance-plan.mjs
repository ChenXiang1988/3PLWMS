import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待维保', type: 'pending' },
    scheduled: { label: '已排期', type: 'info' },
    done: { label: '已完成', type: 'enabled' },
    overdue: { label: '已逾期', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.planStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待维保', count: count('pending'), field: 'planStatus', value: 'pending' },
      { label: '已排期', count: count('scheduled'), field: 'planStatus', value: 'scheduled' },
      { label: '已完成', count: count('done'), field: 'planStatus', value: 'done' },
      { label: '已逾期', count: count('overdue'), field: 'planStatus', value: 'overdue' },
    ],
    filters: [
      { label: '维保类型', key: 'maintenanceType', type: 'text', placeholder: '请输入维保类型' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'planNo', label: '计划号', width: '150px', render: (r) => dash(r.planNo) },
      { key: 'deviceCode', label: '设备编码', width: '130px', render: (r) => dash(r.deviceCode) },
      { key: 'maintenanceType', label: '维保类型', render: (r) => dash(r.maintenanceType) },
      { key: 'cycleDays', label: '周期天数', width: '100px', align: 'right', render: (r) => n(r.cycleDays) },
      { key: 'nextDueAt', label: '下次到期', width: '120px', render: (r) => dash(r.nextDueAt) },
      { key: 'lastDoneAt', label: '上次完成', width: '120px', render: (r) => dash(r.lastDoneAt) },
      { key: 'vendor', label: '供应商', render: (r) => dash(r.vendor) },
      { key: 'planStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.planStatus), toneOf(r.planStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.planStatus }),
    emptyTitle: '暂无维保计划',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
