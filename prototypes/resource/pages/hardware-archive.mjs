import { ListPage, StatusTag, dash, uniq } from '../../01 shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
  maintaining: { label: '维保', type: 'pending' },
  scrapped: { label: '报废', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.deviceStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'deviceStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'deviceStatus', value: 'inactive' },
      { label: '维保', count: count('maintaining'), field: 'deviceStatus', value: 'maintaining' },
      { label: '报废', count: count('scrapped'), field: 'deviceStatus', value: 'scrapped' },
    ],
    filters: [
      { label: '设备类型', key: 'deviceType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.deviceType))] },
      { label: '设备状态', key: 'deviceStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.deviceStatus))] },
      { label: '所属仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '设备编码', key: 'deviceCode', type: 'text', placeholder: '请输入设备编码' },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导入', ghost: true, toast: '导入（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
      { label: '停用', ghost: true, toast: '停用（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'deviceCode', label: '设备编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'deviceName', label: '设备名称', render: (r) => dash(r.deviceName) },
      { key: 'deviceType', label: '设备类型', render: (r) => dash(r.deviceType) },
      { key: 'hardwareModel', label: '设备型号', render: (r) => dash(r.hardwareModel) },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'deviceStatus', label: '设备状态', width: '108px', render: (r) => StatusTag((STATUS_META[r.deviceStatus] || {}).label || '—', (STATUS_META[r.deviceStatus] || {}).type || 'info') },
      { key: 'purchaseDate', label: '购置日期', width: '157px', render: (r) => dash(r.purchaseDate) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.deviceStatus }),
    emptyTitle: '暂无设备',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
