import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

const keyOf = (r) => `${r.binCode}|${r.containerCode}|${r.skuCode}|${r.batchNo}`;
const STATUS = { available: ['可用', 'enabled'], allocated: ['已分配', 'info'], picking: ['拣选中', 'pending'], frozen: ['冻结', 'rejected'], quality: ['质检中', 'pending'] };

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const state = (s) => STATUS[s] || [s || '—', 'info'];
  const columns = [
    { key: 'owner', label: '货主', width: '110px', render: (r) => dash(r.owner) },
    { key: 'zoneCode', label: '库区', width: '105px', render: (r) => dash(r.zoneCode) },
    { key: 'binCode', label: '库位', width: '115px', cls: 'wx-col-strong', render: (r) => DrawerButton({ label: r.binCode, pageId, rowKey: keyOf(r) }) },
    { key: 'containerCode', label: '容器', width: '125px', render: (r) => dash(r.containerCode) },
    { key: 'skuCode', label: '商品/批次', width: '180px', render: (r) => dash(`${r.skuCode} / ${r.batchNo}`) },
    { key: 'onHandQty', label: '实物量', width: '95px', align: 'right', render: (r) => n(r.onHandQty) },
    { key: 'availableQty', label: '可用量', width: '95px', align: 'right', render: (r) => n(r.availableQty) },
    { key: 'reservedQty', label: '占用量', width: '95px', align: 'right', render: (r) => n(r.reservedQty) },
    { key: 'operationState', label: '作业状态', width: '105px', render: (r) => StatusTag(state(r.operationState)[0], state(r.operationState)[1]) },
    { key: 'lastTaskNo', label: '关联任务', width: '145px', render: (r) => dash(r.lastTaskNo) },
  ];
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: keyOf(r), title: '库位库存详情', docNo: r.binCode, status: state(r.operationState)[0], statusTone: state(r.operationState)[1],
    fields: [
      { label: '货主', value: r.owner }, { label: '库区', value: `${r.zoneCode} · ${r.zoneName}` }, { label: '库位坐标', value: r.coordinate },
      { label: '库位状态', value: r.binStatus }, { label: '容器', value: r.containerCode }, { label: '商品/批次', value: `${r.skuCode} / ${r.batchNo}` },
      { label: '库存状态', value: state(r.operationState)[0] }, { label: '实物量', value: r.onHandQty }, { label: '可用量', value: r.availableQty },
      { label: '占用量', value: r.reservedQty }, { label: '冻结量', value: r.frozenQty }, { label: '关联任务', value: r.lastTaskNo },
    ],
    actions: [{ label: '生成移库任务', toast: '已生成移库任务（原型示意）' }, { label: '冻结库位', ghost: true, toast: '已提交库位冻结（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS).map(([value, meta]) => ({ label: meta[0], count: rows.filter((r) => r.operationState === value).length, field: 'operationState', value }))],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '库区', key: 'zoneCode', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zoneCode))] },
      { label: '库位编码', key: 'binCode', type: 'text', placeholder: '请输入库位编码' },
      { label: '容器', key: 'containerCode', type: 'text', placeholder: '请输入容器号', extra: true },
    ],
    toolbar: [{ label: '导出', ghost: true, toast: '导出当前库位库存（原型示意）' }], showCount: true, columns, rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.operationState }), emptyTitle: '暂无库位库存', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
