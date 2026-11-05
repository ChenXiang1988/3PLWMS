import { ShopPage, OrderCard, StatusTag } from '../../01 shared/ui.mjs';

const STATUS_META = {
  unpaid: { label: '待付款', type: 'pending' },
  unshipped: { label: '待发货', type: 'info' },
  shipped: { label: '已发货', type: 'enabled' },
  finished: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const products = (data.home || {}).products || [];
  const find = (code) => products.find((p) => p.skuCode === code) || {};
  const rows = (data.orders || {}).rows || [];

  const cards = rows.map((o) => {
    const p = find(o.skuCode);
    const meta = STATUS_META[o.status] || { label: o.status, type: 'info' };
    return OrderCard({
      ...o,
      skuName: p.skuName,
      owner: p.owner,
      unit: p.unit,
      price: p.price,
      tone: p.tone,
      statusHtml: StatusTag(meta.label, meta.type),
    });
  }).join('');

  return ShopPage({ title: ctx.pageName, note: `共 ${rows.length} 单`, body: cards });
}

export const PAGE_CSS = ``;
