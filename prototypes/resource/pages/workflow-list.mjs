import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  enabled: { label: '启用', type: 'enabled' },
  disabled: { label: '停用', type: 'disabled' },
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
    ],
    filters: [
      { label: '单据类型', key: 'docType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.docType))] },
      { label: '所属仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '编排编号', key: 'flowCode', type: 'text', placeholder: '请输入编排编号', extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'flowCode', label: '编排编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'docType', label: '单据类型', width: '160px', render: (r) => dash(r.docType) },
      { key: 'stepCount', label: '工序数', width: '120px', align: 'right', render: (r) => n(r.stepCount) },
      { key: 'version', label: '版本号', width: '120px', render: (r) => dash(r.version) },
      { key: 'status', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.status), toneOf(r.status)) },
      { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
      { key: 'updateBy', label: '更新人', width: '120px', render: (r) => dash(r.updateBy) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.status }),
    emptyTitle: '暂无单据工序编排',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
