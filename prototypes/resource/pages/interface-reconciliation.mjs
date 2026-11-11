import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  matched: { label: '已对账', type: 'enabled' },
  pending: { label: '待对账', type: 'pending' },
  mismatch: { label: '有差异', type: 'rejected' },
  retrying: { label: '重试中', type: 'info' },
  resolved: { label: '已处理', type: 'disabled' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.reconcileStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.reconcileNo, title: '接口对账与回执链路', docNo: r.reconcileNo,
    status: labelOf(r.reconcileStatus), statusTone: toneOf(r.reconcileStatus),
    fields: [
      { label: '业务任务号', value: r.businessTaskNo }, { label: '设备任务号', value: r.deviceTaskNo },
      { label: '接口方', value: r.partner }, { label: '接口名称', value: r.interfaceName },
      { label: '指令号', value: r.commandNo }, { label: '回执号', value: r.receiptNo },
      { label: '接口状态', value: r.interfaceStatus }, { label: '回执状态', value: r.receiptStatus },
      { label: '原始状态', value: r.rawStatus }, { label: '统一错误码', value: r.unifiedErrorCode },
      { label: '最近请求', value: r.lastRequestAt }, { label: '最近回执', value: r.lastReceiptAt },
      { label: '重试次数', value: r.retryCount }, { label: '差异原因', value: r.diffReason },
    ],
    columns: [
      { key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) },
      { key: 'event', label: '对账事件', render: (x) => dash(x.event) },
      { key: 'operator', label: '来源', width: '100px', render: (x) => dash(x.operator) },
    ],
    rows: r.events || [],
    actions: [
      { label: '重试请求', toast: '已提交接口重试（原型示意）' },
      { label: '状态重同步', ghost: true, toast: '已提交状态重同步（原型示意）' },
      { label: '转异常工单', ghost: true, toast: '已登记异常工单（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条', pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'reconcileStatus', value })),
      ],
      filters: [
        { label: '接口方', key: 'partner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.partner))] },
        { label: '接口名称', key: 'interfaceName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.interfaceName))] },
        { label: '业务任务号', key: 'businessTaskNo', type: 'text', placeholder: '请输入业务任务号', extra: true },
        { label: '设备任务号', key: 'deviceTaskNo', type: 'text', placeholder: '请输入设备任务号', extra: true },
        { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
      ],
      toolbar: [
        { label: '重试', toast: '已打开接口重试确认（原型示意）' },
        { label: '重同步', ghost: true, toast: '已打开状态重同步确认（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'reconcileNo', label: '对账编号', width: '145px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.reconcileNo, label: r.reconcileNo }) },
        { key: 'businessTaskNo', label: '业务任务号', width: '145px', render: (r) => dash(r.businessTaskNo) },
        { key: 'deviceTaskNo', label: '设备任务号', width: '145px', render: (r) => dash(r.deviceTaskNo) },
        { key: 'partner', label: '接口方', width: '90px', render: (r) => dash(r.partner) },
        { key: 'interfaceName', label: '接口名称', width: '135px', render: (r) => dash(r.interfaceName) },
        { key: 'interfaceStatus', label: '接口状态', width: '95px', render: (r) => dash(r.interfaceStatus) },
        { key: 'receiptStatus', label: '回执状态', width: '95px', render: (r) => dash(r.receiptStatus) },
        { key: 'reconcileStatus', label: '对账状态', width: '95px', render: (r) => StatusTag(labelOf(r.reconcileStatus), toneOf(r.reconcileStatus)) },
        { key: 'lastReceiptAt', label: '最近回执', width: '150px', render: (r) => dash(r.lastReceiptAt) },
        { key: 'retryCount', label: '重试次数', width: '80px', align: 'right', render: (r) => n(r.retryCount) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.reconcileStatus }),
      emptyTitle: '暂无接口对账记录',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
