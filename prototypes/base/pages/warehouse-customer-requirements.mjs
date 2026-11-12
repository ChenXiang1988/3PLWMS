import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '生效', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const hours = (v) => (v == null || v === '' ? dash(v) : `${n(v)} 小时`);
const percent = (v) => (v == null || v === '' ? dash(v) : `${v}%`);

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.requirementStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '生效', count: count('active'), field: 'requirementStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'requirementStatus', value: 'inactive' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '业务类型', key: 'bizType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bizType))] },
      { label: '要求状态', key: 'requirementStatus', type: 'select', options: ['全部', '生效', '停用'], extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'requirementNo', label: '要求编号', width: '145px', cls: 'wx-col-strong' },
      { key: 'owner', label: '货主', width: '130px', render: (r) => dash(r.owner) },
      { key: 'bizType', label: '业务类型', width: '110px', render: (r) => dash(r.bizType) },
      { key: 'slaHours', label: '作业时效', width: '110px', align: 'right', render: (r) => hours(r.slaHours) },
      { key: 'cutoffTime', label: '截单时间', width: '110px', render: (r) => dash(r.cutoffTime) },
      { key: 'accuracyRate', label: '准确率目标', width: '120px', align: 'right', render: (r) => percent(r.accuracyRate) },
      { key: 'packRule', label: '包装要求', width: '180px', render: (r) => dash(r.packRule) },
      { key: 'requirementStatus', label: '要求状态', width: '105px', render: (r) => StatusTag(labelOf(r.requirementStatus), toneOf(r.requirementStatus)) },
      { key: 'effectDate', label: '生效日期', width: '120px', render: (r) => dash(r.effectDate) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.requirementStatus }),
    emptyTitle: '暂无客户作业要求',
    emptyDesc: '当前仓库没有符合条件的客户作业要求。',
  });
}

export const PAGE_CSS = ``;
