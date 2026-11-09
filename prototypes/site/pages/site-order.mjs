import {
  ListPage, StatusTag, Tag, DrawerButton, DrawerDetail, money, dash, uniq,
} from '../../shared/ui.mjs';

const PAY_TONE = {
  待付款: 'pending',
  已付款: 'enabled',
  已退款: 'disabled',
};

const FULFILL_TONE = {
  待发货: 'info',
  已发货: 'enabled',
  已完成: 'disabled',
  已取消: 'disabled',
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (v) => rows.filter((r) => r.fulfillStatus === v).length;

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.orderNo,
    title: '站点订单详情',
    docNo: r.orderNo,
    status: r.fulfillStatus,
    statusTone: FULFILL_TONE[r.fulfillStatus] || 'info',
    fields: [
      { label: '站点', value: `${r.siteName} · ${r.siteType}` },
      { label: '买家', value: r.buyer },
      { label: '订单金额', value: money(r.amount) },
      { label: '支付状态', value: r.payStatus },
      { label: '履约状态', value: r.fulfillStatus },
      { label: '履约单号', value: r.fulfillNo },
      { label: '下单时间', value: r.createdAt },
    ],
    actions: [
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '查看履约单', ghost: true, toast: '查看履约单（原型示意）' },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '单',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待发货', count: count('待发货'), field: 'fulfillStatus', value: '待发货' },
        { label: '已发货', count: count('已发货'), field: 'fulfillStatus', value: '已发货' },
        { label: '已完成', count: count('已完成'), field: 'fulfillStatus', value: '已完成' },
        { label: '已取消', count: count('已取消'), field: 'fulfillStatus', value: '已取消' },
      ],
      filters: [
        { label: '站点', key: 'siteName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteName))] },
        { label: '支付状态', key: 'payStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.payStatus))] },
        { label: '订单编号', key: 'orderNo', type: 'text', placeholder: '请输入订单编号' },
      ],
      toolbar: [{ label: '导出', ghost: true, toast: '导出（原型示意）' }],
      showCount: true,
      columns: [
        { key: 'orderNo', label: '订单编号', width: '160px', cls: 'wx-col-strong' },
        { key: 'siteName', label: '站点', width: '140px' },
        { key: 'siteType', label: '站点类型', width: '108px', render: (r) => Tag(r.siteType, r.siteType === '品牌站' ? 'info' : 'default') },
        { key: 'buyer', label: '买家', width: '140px' },
        { key: 'amount', label: '订单金额', width: '120px', align: 'right', render: (r) => money(r.amount) },
        { key: 'payStatus', label: '支付状态', width: '108px', render: (r) => StatusTag(r.payStatus, PAY_TONE[r.payStatus] || 'info') },
        { key: 'fulfillStatus', label: '履约状态', width: '108px', render: (r) => StatusTag(r.fulfillStatus, FULFILL_TONE[r.fulfillStatus] || 'info') },
        { key: 'createdAt', label: '下单时间', width: '157px', render: (r) => dash(r.createdAt) },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.orderNo }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.fulfillStatus }),
      emptyTitle: '暂无站点订单',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    ownerOverlay: detailOverlays,
  };
}

export const PAGE_CSS = ``;
