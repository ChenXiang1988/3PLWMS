import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    enabled: { label: '启用', type: 'enabled' },
    disabled: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.orgStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('enabled'), field: 'orgStatus', value: 'enabled' },
      { label: '停用', count: count('disabled'), field: 'orgStatus', value: 'disabled' },
    ],
    filters: [
      { label: '组织名称', key: 'orgName', type: 'text', placeholder: '请输入组织名称' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'orgCode', label: '组织编码', width: '140px', render: (r) => dash(r.orgCode) },
      { key: 'orgName', label: '组织名称', render: (r) => dash(r.orgName) },
      { key: 'orgType', label: '组织类型', render: (r) => dash(r.orgType) },
      { key: 'parent', label: '上级', render: (r) => dash(r.parent) },
      { key: 'warehouse', label: '所属仓库', render: (r) => dash(r.warehouse) },
      { key: 'leader', label: '负责人', render: (r) => dash(r.leader) },
      { key: 'staffCount', label: '人数', width: '80px', align: 'right', render: (r) => n(r.staffCount) },
      { key: 'orgStatus', label: '状态', width: '90px', render: (r) => StatusTag(labelOf(r.orgStatus), toneOf(r.orgStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.orgStatus }),
    emptyTitle: '暂无组织架构',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
