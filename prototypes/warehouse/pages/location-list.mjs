import { ListPage, StatusTag, FormDrawer, DrawerButton, DrawerDetail, n, dash, uniq } from '../../shared/ui.mjs';

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
const typeLabel = (t) => BIN_TYPES[t] || t || '—';

const BIN_FIELDS = [
  { label: '库区编码', key: 'zoneCode', type: 'text', required: true, placeholder: '请输入库区编码' },
  { label: '库区名称', key: 'zoneName', type: 'text', required: true, placeholder: '请输入库区名称' },
  { label: '库位编码', key: 'binCode', type: 'text', required: true, placeholder: '请输入库位编码' },
  { label: '库位类型', key: 'binType', type: 'select', required: true, options: Object.entries(BIN_TYPES).map(([value, label]) => ({ label, value })) },
  { label: '容量', key: 'capacity', type: 'number', required: true },
];

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.binStatus === s).length;
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));

  const columns = [
    { key: 'zoneCode', label: '库区编码', width: '160px', cls: 'wx-col-strong', type: 'text', render: (r) => DrawerButton({ label: r.zoneCode, pageId, rowKey: r.binCode }) },
    { key: 'zoneName', label: '库区名称', type: 'text', render: (r) => dash(r.zoneName) },
    { key: 'binCode', label: '库位编码', width: '160px', type: 'text', render: (r) => dash(r.binCode) },
    { key: 'binType', label: '库位类型', width: '120px', type: 'text', render: (r) => dash(typeLabel(r.binType)) },
    { key: 'capacity', label: '容量', width: '120px', align: 'right', type: 'num', sortable: true, render: (r) => n(r.capacity) },
    { key: 'usedCapacity', label: '已用容量', width: '120px', align: 'right', type: 'num', sortable: true, render: (r) => n(r.usedCapacity) },
    { key: 'binStatus', label: '状态', width: '108px', type: 'status', render: (r) => StatusTag(statusLabel(r.binStatus), statusTone(r.binStatus)) },
    { key: 'action', label: '操作', width: '108px', type: 'action', action: 'detail', button: '查看详情', render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.binCode }) },
  ];

  const overlay = FormDrawer({
    pageId,
    title: '新增库位',
    groups: [{ title: '库位信息', fields: BIN_FIELDS }],
    actions: [
      { label: '确认', primary: true, attrs: { 'data-form-action': 'confirm' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  }) + rows.map((r) => DrawerDetail({
    pageId, rowKey: r.binCode, title: '库位详情', docNo: r.binCode,
    status: statusLabel(r.binStatus), statusTone: statusTone(r.binStatus),
    fields: [
      { label: '库区编码', value: r.zoneCode },
      { label: '库区名称', value: r.zoneName },
      { label: '库位编码', value: r.binCode },
      { label: '库位类型', value: typeLabel(r.binType) },
      { label: '容量', value: r.capacity },
      { label: '已用容量', value: r.usedCapacity },
      { label: '状态', value: statusLabel(r.binStatus) },
    ],
    actions: [
      { label: '停用', attrs: { 'data-toast': '库位已停用（原型示意）' } },
      { label: '冻结', ghost: true, attrs: { 'data-toast': '库位已冻结（原型示意）' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
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
        { label: '库位类型', key: 'binType', type: 'select', options: ['全部', ...Object.keys(BIN_TYPES)] },
        { label: '库位编码', key: 'binCode', type: 'text', placeholder: '请输入库位编码', extra: true },
      ],
      toolbar: [
        { label: '新增', attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__new__', 'data-form-row': '__new__' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.binStatus }),
      emptyTitle: '暂无库区库位',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'binCode', statusField: 'binStatus', storageKey: 'wh-bins', statusMeta, columns, actionStatus: { confirm: 'empty' } },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
