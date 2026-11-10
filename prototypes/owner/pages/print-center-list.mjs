import { ListPage, FormDrawer, DrawerDetail, DrawerButton, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [], config = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const statusField = config.statusField;
  const keyField = config.keyField;
  const meta = config.statusMeta || {};
  const labelOf = (v) => (meta[v] || {}).label || v || '—';
  const toneOf = (v) => (meta[v] || {}).tone || 'info';
  const actionLabel = (c, r) => (c.buttonByStatus && c.buttonByStatus[r[statusField]]) || c.button || '处理';
  const openKey = (c, r) => {
    if (c.actionMode === 'detail') return r[keyField];
    if (c.actionMode === 'preview') return `preview:${r[keyField]}`;
    if (c.actionMode === 'form-status') return `action-${r[statusField]}`;
    return '__new__';
  };
  const columns = (config.columns || []).map((c) => {
    const base = { key: c.key, label: c.label, width: c.width, type: c.type, button: c.button, buttonByStatus: c.buttonByStatus, actionMode: c.actionMode, cls: c.cls };
    if (c.type === 'status') return { ...base, render: (r) => StatusTag(labelOf(r[c.key]), toneOf(r[c.key])) };
    if (c.type === 'action') {
      return {
        ...base,
        render: (r) => DrawerButton({
          label: actionLabel(c, r),
          pageId,
          rowKey: openKey(c, r),
          formRow: c.actionMode === 'form-status' ? r[keyField] : '',
        }),
      };
    }
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
  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: `${r[keyField]}`,
    title: '打印任务详情',
    docNo: r[keyField],
    status: labelOf(r[statusField]),
    statusTone: toneOf(r[statusField]),
    fields: [
      { label: '来源单号', value: r.sourceDocNo },
      { label: '单据类型', value: r.sourceDocType },
      { label: '打印类型', value: r.printType },
      { label: '模板', value: r.templateName },
      { label: '纸张规格', value: r.paperSize },
      { label: '请求份数', value: r.printCount },
      { label: '成功数', value: r.successCount },
      { label: '失败数', value: r.failCount },
      { label: '创建时间', value: r.createdTime },
      { label: '完成时间', value: r.completedTime },
      { label: '失败原因', value: r.failReason },
    ],
    columns: [
      { key: 'itemNo', label: '明细编号', width: '108px' },
      { key: 'packageNo', label: '包裹号 / 箱号', width: '160px' },
      { key: 'waybillNo', label: '运单号', width: '160px' },
      { key: 'status', label: '输出状态', width: '108px' },
      { key: 'fileName', label: '文件名', width: '190px' },
      { key: 'failReason', label: '失败原因', width: '220px' },
    ],
    rows: r.items || [],
    timeline: r.timeline || [],
    actions: [{ label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  const previewOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: `preview:${r[keyField]}`,
    title: '打印预览',
    docNo: r[keyField],
    status: '预览',
    statusTone: 'info',
    fields: [
      { label: '打印类型', value: r.printType },
      { label: '模板', value: r.templateName },
      { label: '纸张规格', value: r.paperSize },
      { label: '示例数据', value: r.previewData },
    ],
    columns: [
      { key: 'field', label: '字段', width: '140px' },
      { key: 'value', label: '预览值', width: '360px' },
    ],
    rows: r.previewRows || [],
    actions: [
      { label: '打印', primary: true, toast: '打印（原型示意）' },
      { label: '导出模板', ghost: true, toast: '导出模板（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');
  const statusForms = (config.tabs || []).map((t) => {
    const form = config.forms && config.forms[t.value];
    if (!form) return '';
    return FormDrawer({
      pageId,
      rowKey: `action-${t.value}`,
      title: form.title,
      groups: form.groups,
      actions: form.actions,
    });
  }).join('');
  return {
    html: ListPage({
      unit: config.unit || '个',
      pageSize: 20,
      statusTabs: tabs,
      filters,
      toolbar: [{ label: '导出', ghost: true, toast: '导出（原型示意）' }],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r[statusField], 'data-owner': r.owner }),
      emptyTitle: config.emptyTitle,
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: {
        keyField,
        statusField,
        storageKey: ctx.pageKey,
        statusMeta: meta,
        columns,
        actionStatus: config.actionStatus,
      },
    }),
    overlay: detailOverlays + previewOverlays + statusForms,
  };
}

export const PAGE_CSS = ``;
