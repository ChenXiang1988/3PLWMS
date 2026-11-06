import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '生效', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const hours = (v) => (v == null || v === '' ? '—' : `${n(v)} 小时`);

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.slaStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '生效', count: count('active'), field: 'slaStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'slaStatus', value: 'inactive' },
    ],
    filters: [
      { label: '仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '业务类型', key: 'bizType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bizType))], extra: true },
      { label: '协议状态', key: 'slaStatus', type: 'select', options: ['全部', '生效', '停用'], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'slaCode', label: '协议编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'bizType', label: '业务类型', width: '120px', render: (r) => dash(r.bizType) },
      { key: 'slaHours', label: '作业时效', width: '120px', align: 'right', render: (r) => hours(r.slaHours) },
      { key: 'cutoffTime', label: '截单时间', width: '120px', render: (r) => dash(r.cutoffTime) },
      { key: 'accuracyRate', label: '准确率目标', width: '120px', align: 'right', render: (r) => (r.accuracyRate == null ? '—' : `${r.accuracyRate}%`) },
      { key: 'slaStatus', label: '协议状态', width: '108px', render: (r) => StatusTag(labelOf(r.slaStatus), toneOf(r.slaStatus)) },
      { key: 'effectDate', label: '生效日期', width: '120px', render: (r) => dash(r.effectDate) },
      { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.slaStatus }),
    emptyTitle: '暂无时效协议',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
