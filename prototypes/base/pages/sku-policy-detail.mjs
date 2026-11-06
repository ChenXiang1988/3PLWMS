import { DetailPage } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [], doc = {}, timeline = [] } = data[ctx.pageKey] || {};
  const st = STATUS_META[doc.skuStatus] || STATUS_META.active;

  return DetailPage({
    docNo: doc.skuCode || '—',
    status: st.label,
    statusTone: st.type,
    fields: [
      { label: '商品编码', value: doc.skuCode },
      { label: '商品名称', value: doc.skuName },
      { label: '货主', value: doc.owner },
      { label: '版本号', value: doc.version },
      { label: '商品状态', value: st.label },
    ],
    columns: [
      { key: 'policyItem', label: '策略项', width: '160px', cls: 'wx-col-strong' },
      { key: 'policyValue', label: '策略取值', render: (r) => dashText(r.policyValue) },
    ],
    rows,
    timeline: timeline.map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
    actions: [
      { label: '返回', ghost: true, toast: '返回（原型示意）' },
      { label: '取消', ghost: true, toast: '取消（原型示意）' },
      { label: '保存', primary: true, toast: '保存（原型示意）' },
    ],
    note: `本模块：${ctx.moduleName}`,
  });
}

const dashText = (v) => (v === undefined || v === null || v === '' ? '—' : String(v));

export const PAGE_CSS = ``;
