import { ListPage, DrawerButton, StatusTag, Tag, dash, n, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [], config = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const statusField = config.statusField;
  const keyField = config.keyField;
  const meta = config.statusMeta || {};
  const labelOf = (v) => (meta[v] || {}).label || v || '—';
  const toneOf = (v) => (meta[v] || {}).tone || 'info';
  const columns = (config.columns || []).map((c) => {
    const base = { key: c.key, label: c.label, width: c.width, type: c.type, button: c.button, cls: c.cls };
    if (c.type === 'status') return { ...base, render: (r) => StatusTag(labelOf(r[c.key]), toneOf(r[c.key])) };
    if (c.type === 'tag') return { ...base, render: (r) => Tag(dash(r[c.key]), 'info') };
    if (c.type === 'action') return { ...base, render: (r) => DrawerButton({ label: c.button || '查看', pageId, rowKey: '__new__', formRow: r[keyField] }) };
    if (c.align === 'right') return { ...base, align: 'right', render: (r) => n(r[c.key]) };
    return { ...base, render: (r) => dash(r[c.key]) };
  });
  const tabs = [{ label: '全部', count: rows.length, active: true }].concat(
    (config.tabs || []).map((t) => ({
      label: t.label,
      count: rows.filter((r) => r[statusField] === t.value).length,
      field: statusField,
      value: t.value,
    }))
  );
  const filters = (config.filters || []).map((f) => (
    f.type === 'select' ? { ...f, options: ['全部', ...uniq(rows.map((r) => r[f.key]))] } : f
  ));
  const toolbar = [{ label: '导出', ghost: true, toast: '导出（原型示意）' }];
  return ListPage({
    unit: config.unit || '条',
    pageSize: 20,
    statusTabs: tabs,
    filters,
    toolbar,
    showCount: true,
    columns,
    rows,
    rowAttrs: (r) => ({ 'data-status': r[statusField], 'data-owner': r.owner }),
    emptyTitle: config.emptyTitle,
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
