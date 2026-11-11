import { ListPage, DrawerButton, DrawerDetail, Tag, n, dash, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.ledgerNo, title: '库存流水来源链路', docNo: r.ledgerNo, status: r.bizType || '库存事实', statusTone: r.bizType === '冲销' ? 'rejected' : 'info',
    fields: [{ label: '来源单据号', value: r.docNo }, { label: '来源任务号', value: r.taskNo }, { label: '工序单号', value: r.processNo }, { label: '商品/批次', value: `${r.skuCode} / ${r.batchNo || '—'}` }, { label: '库位/容器', value: `${r.binCode || '—'} / ${r.containerCode || '—'}` }, { label: '变动前数量', value: r.beforeQty }, { label: '变动数量', value: r.changeQty }, { label: '变动后数量', value: r.afterQty }, { label: '变动原因', value: r.reason }, { label: '操作人', value: r.operator }, { label: '数量守恒', value: r.quantityCheck }],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '关联事件', render: (x) => dash(x.event) }, { key: 'source', label: '来源', width: '100px', render: (x) => dash(x.source) }], rows: r.events || [],
    actions: [{ label: '查看来源任务', toast: '已打开来源任务（原型示意）' }, { label: '查看设备回执', ghost: true, toast: '已打开设备回执（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }],
    filters: [{ label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] }, { label: '业务类型', key: 'bizType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bizType))] }, { label: '来源任务号', key: 'taskNo', type: 'text', placeholder: '请输入任务号' }, { label: '库位', key: 'binCode', type: 'text', placeholder: '请输入库位', extra: true }, { label: '容器', key: 'containerCode', type: 'text', placeholder: '请输入容器', extra: true }, { label: '单据编号', key: 'docNo', type: 'text', placeholder: '请输入单据编号', extra: true }, { label: '发生时间', key: 'happenTime', type: 'daterange', extra: true }],
    toolbar: [{ label: '查看数量守恒', toast: '已打开数量守恒检查（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [{ key: 'ledgerNo', label: '流水号', width: '150px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.ledgerNo, label: r.ledgerNo }) }, { key: 'bizType', label: '业务类型', width: '95px', render: (r) => Tag(r.bizType || '—', r.bizType === '冲销' ? 'danger' : 'info') }, { key: 'docNo', label: '来源单据', width: '145px', render: (r) => dash(r.docNo) }, { key: 'taskNo', label: '来源任务', width: '135px', render: (r) => dash(r.taskNo) }, { key: 'skuCode', label: '商品编码', width: '125px', render: (r) => dash(r.skuCode) }, { key: 'changeQty', label: '变动数量', width: '90px', align: 'right', render: (r) => n(r.changeQty) }, { key: 'afterQty', label: '变动后数量', width: '95px', align: 'right', render: (r) => n(r.afterQty) }, { key: 'quantityCheck', label: '数量守恒', width: '85px', render: (r) => dash(r.quantityCheck) }, { key: 'happenTime', label: '发生时间', width: '145px', render: (r) => dash(r.happenTime) }],
    rows, rowAttrs: (r) => ({ 'data-owner': r.owner }), emptyTitle: '暂无库存台账', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
