import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.groupStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'groupStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'groupStatus', value: 'inactive' },
    ],
    filters: [
      { label: '货主组名称', key: 'groupName', type: 'text', placeholder: '请输入货主组名称' },
      { label: '状态', key: 'groupStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.groupStatus))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'groupCode', label: '货主组编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'groupName', label: '货主组名称', render: (r) => dash(r.groupName) },
      { key: 'ownerCount', label: '货主数', width: '120px', align: 'right', render: (r) => n(r.ownerCount) },
      { key: 'warehouseCount', label: '服务仓库数', width: '120px', align: 'right', render: (r) => n(r.warehouseCount) },
      { key: 'groupStatus', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.groupStatus), toneOf(r.groupStatus)) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.groupStatus }),
    emptyTitle: '暂无货主组',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
