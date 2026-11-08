import { ListPage, FormDrawer, DrawerDetail, DrawerButton, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [], config = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const statusField = config.statusField;
  const keyField = config.keyField;
  const meta = config.statusMeta || {};
  const adapterDetails = config.adapterDetails || {};
  const labelOf = (v) => (meta[v] || {}).label || v || '—';
  const toneOf = (v) => (meta[v] || {}).tone || 'info';

  const columns = (config.columns || []).map((c) => {
    const base = { key: c.key, label: c.label, width: c.width, type: c.type, button: c.button, detailButton: c.detailButton, cls: c.cls };
    if (c.type === 'status') return { ...base, render: (r) => StatusTag(labelOf(r[c.key]), toneOf(r[c.key])) };
    if (c.type === 'action') {
      return {
        ...base,
        render: (r) => DrawerButton({ label: c.button || '发布', pageId, rowKey: '__new__', formRow: r[keyField] })
          + ' ' + DrawerButton({ label: c.detailButton || '查看适配配置', pageId, rowKey: r[keyField] }),
      };
    }
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

  const form = config.form;
  const formOverlay = form
    ? FormDrawer({ pageId, title: form.title, note: form.note, groups: form.groups, actions: form.actions })
    : '';

  const detailOverlays = rows.map((r) => {
    const d = adapterDetails[r[keyField]] || {};
    return DrawerDetail({
      pageId,
      rowKey: r[keyField],
      title: '平台适配器',
      docNo: r[keyField],
      status: labelOf(r[statusField]),
      statusTone: toneOf(r[statusField]),
      fields: [
        { label: '平台 / 平台模式', value: `${dash(r.platform)} / ${dash(r.platformMode)}` },
        { label: '授权方式', value: dash(r.authMode) },
        { label: '原单有无', value: dash(r.rawOrder) },
        { label: '面单来源', value: dash(r.labelSource) },
        { label: '履约责任', value: dash(r.fulfillDuty) },
        { label: '限流', value: dash(r.rateLimit) },
        { label: '字段映射', value: dash(d.fieldMapCount) },
        { label: '状态映射', value: dash(d.statusMapCount) },
        { label: '能力', value: dash(d.capabilityCount) },
        { label: '适配器版本', value: dash(r.adapterVersion) },
      ],
      columns: [
        { key: 'mapType', label: '映射类型', width: '108px' },
        { key: 'platformSide', label: '平台字段或状态', width: '180px' },
        { key: 'erpSide', label: 'ERP 字段或状态', width: '180px' },
        { key: 'support', label: '支持情况', width: '108px' },
        { key: 'appVersion', label: '适用版本', width: '108px' },
      ],
      rows: d.mappings || [],
      timeline: d.timeline || [],
      actions: [{ label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
    });
  }).join('');

  return {
    html: ListPage({
      unit: config.unit || '条',
      pageSize: 20,
      statusTabs: tabs,
      filters,
      toolbar: [{ label: '导出', ghost: true, toast: '导出（原型示意）' }],
      showCount: true,
      scopeNote: config.scopeNote,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r[statusField], 'data-owner': r.owner }),
      emptyTitle: config.emptyTitle,
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: form
        ? { keyField, statusField, storageKey: ctx.pageKey, statusMeta: meta, columns, actionStatus: config.actionStatus }
        : null,
    }),
    overlay: formOverlay,
    ownerOverlay: detailOverlays,
  };
}

export const PAGE_CSS = ``;
