import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    unpushed: { label: '未推送', type: 'pending' },
    pushed: { label: '已推送', type: 'enabled' },
    failed: { label: '推送失败', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.pricePushStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '未推送', count: count('unpushed'), field: 'pricePushStatus', value: 'unpushed' },
      { label: '已推送', count: count('pushed'), field: 'pricePushStatus', value: 'pushed' },
      { label: '推送失败', count: count('failed'), field: 'pricePushStatus', value: 'failed' },
    ],
    filters: [
      { label: '平台', key: 'platform', type: 'text', placeholder: '请输入平台' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'listingCode', label: 'Listing 编码', width: '160px', render: (r) => dash(r.listingCode) },
      { key: 'platform', label: '平台', render: (r) => dash(r.platform) },
      { key: 'shop', label: '店铺', render: (r) => dash(r.shop) },
      { key: 'platformItemId', label: '平台商品 ID', width: '160px', render: (r) => dash(r.platformItemId) },
      { key: 'platformSku', label: '平台 SKU', width: '140px', render: (r) => dash(r.platformSku) },
      { key: 'spuCode', label: 'SPU', width: '140px', render: (r) => dash(r.spuCode) },
      { key: 'pricePushStatus', label: '价格推送', width: '108px', render: (r) => StatusTag(labelOf(r.pricePushStatus), toneOf(r.pricePushStatus)) },
      { key: 'stockPushStatus', label: '库存推送', width: '108px', render: (r) => StatusTag(labelOf(r.stockPushStatus), toneOf(r.stockPushStatus)) },
      { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.pricePushStatus }),
    emptyTitle: '暂无平台 Listing',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
