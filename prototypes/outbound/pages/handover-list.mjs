import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  wait: { label: '待作业', type: 'pending' },
  busy: { label: '作业中', type: 'enabled' },
  blocked: { label: '异常', type: 'rejected' },
  done: { label: '已完成', type: 'disabled' },
  closed: { label: '已取消', type: 'disabled' },
};
const RECEIPT_META = {
  pending: { label: '待回执', type: 'pending' }, received: { label: '已回执', type: 'enabled' },
  timeout: { label: '回执超时', type: 'rejected' }, partial: { label: '部分回执', type: 'pending' }, duplicate: { label: '重复回执', type: 'info' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const receiptLabel = (s) => (RECEIPT_META[s] || {}).label || s || '—';
const receiptTone = (s) => (RECEIPT_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.processStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.processNo, title: '发运交接与回执补偿', docNo: r.processNo, status: labelOf(r.processStatus), statusTone: toneOf(r.processStatus),
    fields: [
      { label: '来源计划单', value: r.sourcePlans }, { label: '承运商', value: r.carrier }, { label: '包裹数', value: r.packageCount },
      { label: '发运状态', value: labelOf(r.processStatus) }, { label: '回执状态', value: receiptLabel(r.receiptStatus) },
      { label: '回执号', value: r.receiptNo }, { label: '最近回执', value: r.receiptAt }, { label: '重试次数', value: r.retryCount },
      { label: '补偿原因', value: r.compensationReason }, { label: '状态同步', value: r.syncResult },
      { label: '执行主体', value: r.executor }, { label: '交接时间', value: r.handoverTime },
    ],
    columns: [
      { key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) },
      { key: 'event', label: '回执事件', render: (x) => dash(x.event) },
      { key: 'operator', label: '来源', width: '100px', render: (x) => dash(x.operator) },
    ],
    rows: r.events || [],
    actions: [
      { label: '补发回执', toast: `已提交 ${r.processNo} 回执补发（原型示意）` },
      { label: '状态重同步', ghost: true, toast: '已提交发运状态重同步（原型示意）' },
      { label: '查看接口对账', ghost: true, toast: '已打开接口对账（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '单', pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'processStatus', value })),
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '承运商', key: 'carrier', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.carrier))] },
        { label: '回执状态', key: 'receiptStatus', type: 'select', options: ['全部', ...Object.values(RECEIPT_META).map((x) => x.label)] },
        { label: '工序单号', key: 'processNo', type: 'text', placeholder: '请输入工序单号', extra: true },
        { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
      ],
      toolbar: [
        { label: '生成交接单', toast: '生成交接单（原型示意）' },
        { label: '补发回执', ghost: true, toast: '已提交回执补发（原型示意）' },
        { label: '状态重同步', ghost: true, toast: '已提交发运状态重同步（原型示意）' },
        { label: '打印', ghost: true, attrs: { 'data-print': '交接单' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'processNo', label: '工序单号', width: '160px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.processNo, label: r.processNo }) },
        { key: 'processStatus', label: '工序单状态', width: '108px', render: (r) => StatusTag(labelOf(r.processStatus), toneOf(r.processStatus)) },
        { key: 'sourcePlans', label: '来源计划单', render: (r) => dash(r.sourcePlans) },
        { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
        { key: 'carrier', label: '承运商', width: '120px', render: (r) => dash(r.carrier) },
        { key: 'packageCount', label: '包裹数', width: '90px', align: 'right', render: (r) => n(r.packageCount) },
        { key: 'receiptStatus', label: '回执状态', width: '100px', render: (r) => StatusTag(receiptLabel(r.receiptStatus), receiptTone(r.receiptStatus)) },
        { key: 'receiptAt', label: '最近回执', width: '150px', render: (r) => dash(r.receiptAt) },
        { key: 'retryCount', label: '重试次数', width: '80px', align: 'right', render: (r) => n(r.retryCount) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.processStatus }),
      emptyTitle: '暂无交接单', emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
