import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  preparing: { label: '筹建中', type: 'pending' },
  active: { label: '启用', type: 'enabled' },
  disabled: { label: '停用', type: 'disabled' },
  closed: { label: '关闭', type: 'disabled' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.warehouseStatus === s).length;
  const options = (key) => ['全部', ...uniq(rows.map((r) => r[key]))];

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'warehouseStatus', value: 'active' },
      { label: '停用', count: count('disabled'), field: 'warehouseStatus', value: 'disabled' },
      { label: '筹建中', count: count('preparing'), field: 'warehouseStatus', value: 'preparing' },
      { label: '关闭', count: count('closed'), field: 'warehouseStatus', value: 'closed' },
    ],
    filters: [
      { label: '仓库类型', key: 'warehouseType', type: 'select', options: options('warehouseType') },
      { label: '温区配置', key: 'tempZones', type: 'select', options: options('tempZones') },
      { label: '所属法人主体', key: 'legalEntity', type: 'select', options: options('legalEntity') },
      { label: '仓库编码', key: 'warehouseCode', type: 'text', placeholder: '请输入仓库编码' },
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
      { key: 'warehouseCode', label: '仓库编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'warehouseName', label: '仓库名称', render: (r) => dash(r.warehouseName) },
      { key: 'warehouseType', label: '仓库类型', render: (r) => dash(r.warehouseType) },
      { key: 'tempZones', label: '温区配置', render: (r) => dash(r.tempZones) },
      { key: 'valueAddedServices', label: '增值服务', render: (r) => dash(r.valueAddedServices) },
      { key: 'qcMode', label: '质检方式', width: '108px', render: (r) => dash(r.qcMode) },
      { key: 'warehouseStatus', label: '仓库状态', width: '108px', render: (r) => StatusTag(statusLabel(r.warehouseStatus), (STATUS_META[r.warehouseStatus] || {}).type || 'info') },
      { key: 'legalEntity', label: '所属法人主体', render: (r) => dash(r.legalEntity) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.warehouseStatus }),
    emptyTitle: '暂无仓库',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
