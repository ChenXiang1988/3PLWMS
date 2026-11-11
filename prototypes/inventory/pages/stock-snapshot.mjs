import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

const DIFF_META = { normal: { label: '无差异', type: 'enabled' }, diff: { label: '有差异', type: 'rejected' }, pending: { label: '待核验', type: 'pending' }, adjusted: { label: '已调整', type: 'info' }, blocked: { label: '过账拦截', type: 'rejected' } };
const labelOf = (s) => (DIFF_META[s] || {}).label || s || '—';
const toneOf = (s) => (DIFF_META[s] || {}).type || 'info';
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.diffStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: `${r.snapshotNo}-${r.skuCode}-${r.binCode}`, title: '库存快照差异、过账拦截与核验', docNo: r.snapshotNo, status: labelOf(r.diffStatus), statusTone: toneOf(r.diffStatus),
    fields: [
      { label: '快照时间', value: r.snapshotTime }, { label: '商品/批次', value: `${r.skuCode} / ${r.batchNo}` }, { label: '库位/容器', value: `${r.binCode} / ${r.containerCode || '—'}` },
      { label: '快照数量', value: r.snapshotQty ?? r.onHandQty }, { label: '当前数量', value: r.currentQty ?? r.onHandQty }, { label: '差异数量', value: r.diffQty ?? 0 },
      { label: '设备完成状态', value: r.deviceCompletionStatus }, { label: '过账状态', value: r.postingStatus }, { label: '拦截原因', value: r.postingBlockReason },
      { label: '可用数量', value: r.availableQty }, { label: '冻结数量', value: r.frozenQty }, { label: '可信度', value: r.confidence },
      { label: '核验任务', value: r.auditTaskNo }, { label: '状态同步', value: r.syncResult },
    ],
    columns: [{ key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) }, { key: 'event', label: '核验记录', render: (x) => dash(x.event) }, { key: 'operator', label: '操作人', width: '100px', render: (x) => dash(x.operator) }], rows: r.events || [],
    actions: [{ label: '发起核验', toast: '已生成库存核验任务（原型示意）' }, { label: '状态重同步', ghost: true, toast: '已提交库存状态重同步（原型示意）' }, { label: '查看库存流水', ghost: true, toast: '库存流水（原型示意）' }, { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');
  return { html: ListPage({
    unit: '条', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(DIFF_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'diffStatus', value }))],
    filters: [{ label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] }, { label: '差异状态', key: 'diffStatus', type: 'select', options: ['全部', ...Object.values(DIFF_META).map((x) => x.label)] }, { label: '区域', key: 'zone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zone).filter(Boolean))] }, { label: '过账状态', key: 'postingStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.postingStatus).filter(Boolean))], extra: true }, { label: '库位', key: 'binCode', type: 'text', placeholder: '请输入库位', extra: true }, { label: '快照时间', key: 'snapshotTime', type: 'daterange', extra: true }],
    toolbar: [{ label: '生成快照', toast: '生成库存快照（原型示意）' }, { label: '对比快照', ghost: true, toast: '已打开快照对比（原型示意）' }, { label: '发起核验', ghost: true, toast: '已打开库存核验（原型示意）' }, { label: '状态重同步', ghost: true, toast: '已打开库存状态重同步（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [
      { key: 'snapshotNo', label: '快照编号', width: '145px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: `${r.snapshotNo}-${r.skuCode}-${r.binCode}`, label: r.snapshotNo }) }, { key: 'snapshotTime', label: '快照时间', width: '145px', render: (r) => dash(r.snapshotTime) }, { key: 'owner', label: '货主', width: '100px', render: (r) => dash(r.owner) }, { key: 'skuCode', label: '商品/批次', width: '155px', render: (r) => dash(`${r.skuCode} / ${r.batchNo}`) }, { key: 'binCode', label: '区域/库位', width: '125px', render: (r) => dash(`${r.zone || '—'} / ${r.binCode || '—'}`) }, { key: 'snapshotQty', label: '快照数量', width: '90px', align: 'right', render: (r) => n(r.snapshotQty ?? r.onHandQty) }, { key: 'currentQty', label: '当前数量', width: '90px', align: 'right', render: (r) => n(r.currentQty ?? r.onHandQty) }, { key: 'diffQty', label: '差异数量', width: '85px', align: 'right', render: (r) => n(r.diffQty ?? 0) }, { key: 'deviceCompletionStatus', label: '设备完成', width: '90px', render: (r) => dash(r.deviceCompletionStatus) }, { key: 'postingStatus', label: '过账状态', width: '95px', render: (r) => dash(r.postingStatus) }, { key: 'diffStatus', label: '差异状态', width: '90px', render: (r) => StatusTag(labelOf(r.diffStatus), toneOf(r.diffStatus)) },
    ], rows, rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.diffStatus }), emptyTitle: '暂无库存快照', emptyDesc: '当前筛选条件下没有任何记录。',
  }), overlay };
}
export const PAGE_CSS = ``;
