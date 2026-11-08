import { ListPage, StatusTag, dash, money } from '../../shared/ui.mjs';

const STATUS_META = {
  unpaid: { label: '待付款', tone: 'pending' },
  unshipped: { label: '待发货', tone: 'info' },
  shipped: { label: '已发货', tone: 'enabled' },
  finished: { label: '已完成', tone: 'disabled' },
  cancelled: { label: '已取消', tone: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (v) => rows.filter((r) => r.orderStatus === v).length;

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
      { label: '订单编号', key: 'orderNo', type: 'text', placeholder: '请输入订单编号' },
      { label: '下单时间', key: 'createTime', type: 'daterange', extra: true },
    ],
    showCount: true,
    columns: [
      { key: 'orderNo', label: '订单编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'buyerOwner', label: '买家货主', width: '120px', render: (r) => dash(r.buyerOwner) },
      { key: 'orderAmount', label: '订单金额', width: '120px', align: 'right', render: (r) => money(r.orderAmount) },
      { key: 'obNo', label: '履约出库单号', width: '160px', render: (r) => dash(r.obNo) },
      { key: 'orderStatus', label: '订单状态', width: '108px', render: (r) => { const s = STATUS_META[r.orderStatus] || STATUS_META.unpaid; return StatusTag(s.label, s.tone); } },
      { key: 'createTime', label: '下单时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.orderStatus }),
    emptyTitle: '暂无订单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
