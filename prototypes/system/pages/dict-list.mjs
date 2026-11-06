import { ListPage, StatusTag, Tag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.dictStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'dictStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'dictStatus', value: 'inactive' },
    ],
    filters: [
      { label: '字典名称', key: 'dictName', type: 'text', placeholder: '请输入字典名称' },
      { label: '字典类型', key: 'dictType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.dictType))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'dictCode', label: '字典编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'dictName', label: '字典名称', render: (r) => dash(r.dictName) },
      { key: 'dictType', label: '字典类型', width: '120px', render: (r) => Tag(r.dictType || '—', r.dictType === '系统字典' ? 'info' : 'default') },
      { key: 'itemCount', label: '字典项数', width: '120px', align: 'right', render: (r) => n(r.itemCount) },
      { key: 'dictStatus', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.dictStatus), toneOf(r.dictStatus)) },
      { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.dictStatus }),
    emptyTitle: '暂无字典',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
