import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  unpaid: { label: '待付款', type: 'pending' },
  unshipped: { label: '待发货', type: 'info' },
  shipped: { label: '已发货', type: 'enabled' },
  finished: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const money = (v) => (v == null || v === '' ? '—' : `￥${Number(v).toFixed(2)}`);

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.orderStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待付款', count: count('unpaid'), field: 'orderStatus', value: 'unpaid' },
      { label: '待发货', count: count('unshipped'), field: 'orderStatus', value: 'unshipped' },
      { label: '已发货', count: count('shipped'), field: 'orderStatus', value: 'shipped' },
      { label: '已完成', count: count('finished'), field: 'orderStatus', value: 'finished' },
      { label: '已取消', count: count('cancelled'), field: 'orderStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '订单编号', key: 'orderNo', type: 'text', placeholder: '请输入订单编号' },
      { label: '下单时间', key: 'createTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'orderNo', label: '订单编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'account', label: '下单账号', width: '120px', render: (r) => dash(r.account) },
      { key: 'orderAmount', label: '订单金额', width: '120px', align: 'right', render: (r) => money(r.orderAmount) },
      { key: 'obNo', label: '履约出库单号', width: '160px', render: (r) => dash(r.obNo) },
      { key: 'orderStatus', label: '订单状态', width: '108px', render: (r) => StatusTag(labelOf(r.orderStatus), toneOf(r.orderStatus)) },
      { key: 'createTime', label: '下单时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.orderStatus }),
    emptyTitle: '暂无商城订单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
