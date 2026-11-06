import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.carrierStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'carrierStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'carrierStatus', value: 'inactive' },
    ],
    filters: [
      { label: '承运商名称', key: 'carrierName', type: 'text', placeholder: '请输入承运商名称' },
      { label: '状态', key: 'carrierStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.carrierStatus))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'carrierCode', label: '承运商编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'carrierName', label: '承运商名称', render: (r) => dash(r.carrierName) },
      { key: 'contact', label: '联系人', width: '120px', render: (r) => dash(r.contact) },
      { key: 'contactPhone', label: '联系电话', width: '157px', render: (r) => dash(r.contactPhone) },
      { key: 'carrierStatus', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.carrierStatus), toneOf(r.carrierStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.carrierStatus }),
    emptyTitle: '暂无承运商',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
