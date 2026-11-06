import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待确认', type: 'pending' },
  confirmed: { label: '已确认', type: 'enabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.shiftStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待确认', count: count('pending'), field: 'shiftStatus', value: 'pending' },
      { label: '已确认', count: count('confirmed'), field: 'shiftStatus', value: 'confirmed' },
      { label: '已取消', count: count('cancelled'), field: 'shiftStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '班次', key: 'shiftType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.shiftType))] },
      { label: '班组', key: 'teamName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.teamName))] },
      { label: '作业日期', key: 'workDate', type: 'date', extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'shiftCode', label: '排班编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'workDate', label: '作业日期', width: '120px', render: (r) => dash(r.workDate) },
      { key: 'shiftType', label: '班次', width: '120px', render: (r) => dash(r.shiftType) },
      { key: 'teamName', label: '班组', width: '120px', render: (r) => dash(r.teamName) },
      { key: 'startTime', label: '开始时间', width: '120px', render: (r) => dash(r.startTime) },
      { key: 'endTime', label: '结束时间', width: '120px', render: (r) => dash(r.endTime) },
      { key: 'planCount', label: '计划出勤人数', width: '120px', align: 'right', render: (r) => n(r.planCount) },
      { key: 'actualCount', label: '实际出勤人数', width: '120px', align: 'right', render: (r) => n(r.actualCount) },
      { key: 'shiftStatus', label: '排班状态', width: '108px', render: (r) => StatusTag(labelOf(r.shiftStatus), toneOf(r.shiftStatus)) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.shiftStatus }),
    emptyTitle: '暂无排班',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
