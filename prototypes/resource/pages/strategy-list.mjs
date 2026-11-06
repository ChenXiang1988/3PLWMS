import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  enabled: { label: '启用', type: 'enabled' },
  disabled: { label: '停用', type: 'disabled' },
  draft: { label: '草稿', type: 'pending' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.status === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('enabled'), field: 'status', value: 'enabled' },
      { label: '停用', count: count('disabled'), field: 'status', value: 'disabled' },
      { label: '草稿', count: count('draft'), field: 'status', value: 'draft' },
    ],
    filters: [
      { label: '策略域', key: 'strategyDomain', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.strategyDomain))] },
      { label: '所属仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '单据类型', key: 'docType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.docType))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'strategyCode', label: '策略编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'strategyName', label: '策略名称', render: (r) => dash(r.strategyName) },
      { key: 'strategyDomain', label: '策略域', width: '120px', render: (r) => dash(r.strategyDomain) },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'docType', label: '单据类型', width: '160px', render: (r) => dash(r.docType) },
      { key: 'status', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.status), toneOf(r.status)) },
      { key: 'hitCount', label: '命中次数', width: '120px', align: 'right', render: (r) => n(r.hitCount) },
      { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.status }),
    emptyTitle: '暂无策略',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
