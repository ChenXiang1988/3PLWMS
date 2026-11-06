import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
  maintaining: { label: '维保', type: 'pending' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.unitStatus === s).length;

  return ListPage({
    unit: '个',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'unitStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'unitStatus', value: 'inactive' },
      { label: '维保', count: count('maintaining'), field: 'unitStatus', value: 'maintaining' },
    ],
    filters: [
      { label: '单元类型', key: 'unitType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.unitType))] },
      { label: '单元状态', key: 'unitStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.unitStatus))] },
      { label: '所属仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'unitCode', label: '执行单元编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'unitName', label: '执行单元名称', render: (r) => dash(r.unitName) },
      { key: 'unitType', label: '单元类型', width: '120px', render: (r) => dash(r.unitType) },
      { key: 'taskTypes', label: '承接任务类型', width: '160px', render: (r) => dash(r.taskTypes) },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'capacity', label: '处理能力', width: '120px', align: 'right', render: (r) => n(r.capacity) },
      { key: 'teamName', label: '默认班组', width: '120px', render: (r) => dash(r.teamName) },
      { key: 'unitStatus', label: '单元状态', width: '108px', render: (r) => StatusTag(labelOf(r.unitStatus), toneOf(r.unitStatus)) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.unitStatus }),
    emptyTitle: '暂无执行单元',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
