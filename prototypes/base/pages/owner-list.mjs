import { ListPage, StatusTag, dash } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.ownerStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'ownerStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'ownerStatus', value: 'inactive' },
    ],
    filters: [
      { label: '货主编码', key: 'ownerCode', type: 'text', placeholder: '请输入货主编码' },
      { label: '货主名称', key: 'ownerName', type: 'text', placeholder: '请输入货主名称' },
      { label: '联系人', key: 'contact', type: 'text', placeholder: '请输入联系人' },
      { label: '创建时间', key: 'createTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导入', ghost: true, toast: '导入（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
      { label: '停用', ghost: true, toast: '停用（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'ownerCode', label: '货主编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'ownerName', label: '货主名称', render: (r) => dash(r.ownerName) },
      { key: 'contact', label: '联系人', render: (r) => dash(r.contact) },
      { key: 'contactPhone', label: '联系电话', render: (r) => dash(r.contactPhone) },
      { key: 'ownerStatus', label: '状态', width: '108px', render: (r) => StatusTag(statusLabel(r.ownerStatus), (STATUS_META[r.ownerStatus] || {}).type || 'info') },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.ownerStatus }),
    emptyTitle: '暂无货主',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
