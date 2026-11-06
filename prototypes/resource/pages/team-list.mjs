import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.teamStatus === s).length;

  return ListPage({
    unit: '个',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'teamStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'teamStatus', value: 'inactive' },
    ],
    filters: [
      { label: '班组类型', key: 'teamType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.teamType))] },
      { label: '班次', key: 'shiftType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.shiftType))] },
      { label: '班组状态', key: 'teamStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.teamStatus))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'teamCode', label: '班组编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'teamName', label: '班组名称', render: (r) => dash(r.teamName) },
      { key: 'teamType', label: '班组类型', width: '120px', render: (r) => dash(r.teamType) },
      { key: 'shiftType', label: '班次', width: '120px', render: (r) => dash(r.shiftType) },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'leaderName', label: '班组长', width: '120px', render: (r) => dash(r.leaderName) },
      { key: 'memberCount', label: '班组人数', width: '120px', align: 'right', render: (r) => n(r.memberCount) },
      { key: 'teamStatus', label: '班组状态', width: '108px', render: (r) => StatusTag(labelOf(r.teamStatus), toneOf(r.teamStatus)) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.teamStatus }),
    emptyTitle: '暂无班组',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
