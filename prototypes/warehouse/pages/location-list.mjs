import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  empty: { label: '空闲', type: 'info' },
  occupied: { label: '占用', type: 'enabled' },
  frozen: { label: '冻结', type: 'pending' },
  disabled: { label: '停用', type: 'disabled' },
};

const BIN_TYPES = {
  pallet: '托盘位',
  shelf: '隔板位',
  flow: '流利架位',
  ground: '地堆位',
  drivein: '驶入位',
  buffer: '暂存位',
  crossdock: '越库位',
  defect: '残次位',
};

const statusLabel = (s) => (STATUS_META[s] || {}).label || '—';
const statusTone = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.binStatus === s).length;

  return ListPage({
    unit: '个',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '空闲', count: count('empty'), field: 'binStatus', value: 'empty' },
      { label: '占用', count: count('occupied'), field: 'binStatus', value: 'occupied' },
      { label: '冻结', count: count('frozen'), field: 'binStatus', value: 'frozen' },
      { label: '停用', count: count('disabled'), field: 'binStatus', value: 'disabled' },
    ],
    filters: [
      { label: '库区名称', key: 'zoneName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zoneName))] },
      { label: '库位类型', key: 'binType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.binType))] },
      { label: '库位编码', key: 'binCode', type: 'text', placeholder: '请输入库位编码', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'zoneCode', label: '库区编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'zoneName', label: '库区名称', render: (r) => dash(r.zoneName) },
      { key: 'binCode', label: '库位编码', width: '160px', render: (r) => dash(r.binCode) },
      { key: 'binType', label: '库位类型', width: '120px', render: (r) => dash(BIN_TYPES[r.binType] || r.binType) },
      { key: 'capacity', label: '容量', width: '120px', align: 'right', render: (r) => n(r.capacity) },
      { key: 'usedCapacity', label: '已用容量', width: '120px', align: 'right', render: (r) => n(r.usedCapacity) },
      { key: 'binStatus', label: '状态', width: '108px', render: (r) => StatusTag(statusLabel(r.binStatus), statusTone(r.binStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.binStatus }),
    emptyTitle: '暂无库区库位',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
