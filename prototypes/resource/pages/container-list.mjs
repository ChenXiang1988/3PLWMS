import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = { idle: { label: '空闲', type: 'info' }, busy: { label: '在用', type: 'enabled' }, repairing: { label: '维修', type: 'pending' }, scrapped: { label: '报废', type: 'disabled' } };
const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.containerStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.containerCode, title: '容器能力与流转', docNo: r.containerCode, status: labelOf(r.containerStatus), statusTone: toneOf(r.containerStatus),
    fields: [
      { label: '容器类型', value: r.containerType }, { label: '规格', value: r.spec }, { label: '有效容积', value: r.volume },
      { label: '载重上限', value: r.loadLimit }, { label: '当前装载率', value: r.loadRate }, { label: '当前库位', value: r.binCode },
      { label: '占用单据', value: r.bizNo }, { label: '当前设备任务', value: r.deviceTaskNo }, { label: '回流状态', value: r.returnStatus },
      { label: '容器池水位', value: r.poolLevel }, { label: '货物量', value: r.goodsQty }, { label: '占用状态', value: r.occupyStatus },
    ],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '流转事件', render: (x) => dash(x.event) }, { key: 'operator', label: '来源', width: '100px', render: (x) => dash(x.operator) }],
    rows: r.events || [],
    actions: [{ label: '绑定任务', toast: '已打开容器任务绑定（原型示意）' }, { label: '登记回流', ghost: true, toast: '已打开空容器回流（原型示意）' }, { label: '维修', ghost: true, toast: '已打开容器维修登记（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'containerStatus', value }))],
    filters: [{ label: '容器类型', key: 'containerType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.containerType))] }, { label: '容器状态', key: 'containerStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.containerStatus))] }, { label: '占用状态', key: 'occupyStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.occupyStatus).filter(Boolean))], extra: true }, { label: '回流状态', key: 'returnStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.returnStatus).filter(Boolean))], extra: true }, { label: '任务号', key: 'deviceTaskNo', type: 'text', placeholder: '请输入任务号', extra: true }, { label: '归属货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner).filter(Boolean))], extra: true }],
    toolbar: [{ label: '新增容器', toast: '新增容器（原型示意）' }, { label: '登记回流', ghost: true, toast: '已打开空容器回流（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [{ key: 'containerCode', label: '容器编码', width: '145px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.containerCode, label: r.containerCode }) }, { key: 'containerType', label: '类型', width: '90px', render: (r) => dash(r.containerType) }, { key: 'spec', label: '规格', width: '140px', render: (r) => dash(r.spec) }, { key: 'loadRate', label: '装载率', width: '80px', render: (r) => dash(r.loadRate) }, { key: 'containerStatus', label: '状态', width: '85px', render: (r) => StatusTag(labelOf(r.containerStatus), toneOf(r.containerStatus)) }, { key: 'binCode', label: '区域/库位', width: '125px', render: (r) => dash([r.zone, r.binCode].filter(Boolean).join(' / ')) }, { key: 'bizNo', label: '占用单据', width: '145px', render: (r) => dash(r.bizNo) }, { key: 'deviceTaskNo', label: '设备任务', width: '135px', render: (r) => dash(r.deviceTaskNo) }, { key: 'returnStatus', label: '回流状态', width: '90px', render: (r) => dash(r.returnStatus) }],
    rows, rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.containerStatus }), emptyTitle: '暂无容器', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
