import { ListPage, DrawerButton, DrawerDetail, Tag, n, dash, uniq } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.ledgerNo, title: '库存流水来源链路', docNo: r.ledgerNo, status: r.postingStatus || '已过账', statusTone: r.bizType === '冲销' ? 'rejected' : 'info',
    fields: [
      { label: '货主', value: r.owner }, { label: '业务类型', value: r.bizType }, { label: '来源单据号', value: r.docNo }, { label: '来源任务号', value: r.taskNo },
      { label: 'WES 执行实例', value: r.executionNo }, { label: '商品/批次', value: `${r.skuCode} / ${r.batchNo || '—'}` }, { label: '库位/容器', value: `${r.binCode || '—'} / ${r.containerCode || '—'}` },
      { label: '状态变更', value: `${r.fromStatus || '—'} → ${r.toStatus || '—'}` }, { label: '变动前数量', value: r.beforeQty }, { label: '变动数量', value: r.changeQty }, { label: '变动后数量', value: r.afterQty },
      { label: '幂等键', value: r.idempotencyKey }, { label: '数量守恒', value: r.quantityCheck }, { label: '操作人', value: r.operator },
    ],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '关联事件', render: (x) => dash(x.event) }, { key: 'source', label: '来源', width: '100px', render: (x) => dash(x.source) }], rows: r.events || [],
    actions: [{ label: '查看来源任务', toast: '已打开来源任务（原型示意）' }, { label: '查看冲销流水', ghost: true, toast: '已打开冲销流水（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, { label: '已过账', count: rows.filter((r) => r.postingStatus === '已过账').length, field: 'postingStatus', value: '已过账' }, { label: '待补偿', count: rows.filter((r) => r.postingStatus === '待补偿').length, field: 'postingStatus', value: '待补偿' }, { label: '冲销', count: rows.filter((r) => r.bizType === '冲销').length, field: 'bizType', value: '冲销' }],
    filters: [{ label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] }, { label: '业务类型', key: 'bizType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bizType))] }, { label: '来源任务号', key: 'taskNo', type: 'text', placeholder: '请输入任务号' }, { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码', extra: true }, { label: '幂等键', key: 'idempotencyKey', type: 'text', placeholder: '请输入幂等键', extra: true }, { label: '发生时间', key: 'happenTime', type: 'daterange', extra: true }],
    toolbar: [{ label: '数量守恒检查', toast: '已打开数量守恒检查（原型示意）' }, { label: '导出', ghost: true, toast: '导出当前流水（原型示意）' }],
    columns: [{ key: 'ledgerNo', label: '流水号', width: '150px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.ledgerNo, label: r.ledgerNo }) }, { key: 'bizType', label: '业务类型', width: '100px', render: (r) => Tag(r.bizType || '—', r.bizType === '冲销' ? 'danger' : 'info') }, { key: 'docNo', label: '来源单据', width: '145px', render: (r) => dash(r.docNo) }, { key: 'taskNo', label: '来源任务', width: '135px', render: (r) => dash(r.taskNo) }, { key: 'fromStatus', label: '状态变更', width: '155px', render: (r) => dash(`${r.fromStatus || '—'} → ${r.toStatus || '—'}`) }, { key: 'changeQty', label: '变动数量', width: '90px', align: 'right', render: (r) => n(r.changeQty) }, { key: 'afterQty', label: '变动后数量', width: '95px', align: 'right', render: (r) => n(r.afterQty) }, { key: 'postingStatus', label: '过账状态', width: '90px', render: (r) => dash(r.postingStatus) }, { key: 'happenTime', label: '发生时间', width: '145px', render: (r) => dash(r.happenTime) }],
    rows, rowAttrs: (r) => ({ 'data-owner': r.owner }), emptyTitle: '暂无库存流水', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
