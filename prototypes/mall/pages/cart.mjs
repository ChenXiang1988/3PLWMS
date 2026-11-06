import { ShopPage, CartTable, ShopPanel, ShopActions } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const products = (data.home || {}).products || [];
  const find = (code) => products.find((p) => p.skuCode === code) || {};
  const rows = ((data.cart || {}).rows || []).map((r) => ({ ...find(r.skuCode), qty: r.qty }));

  const body = ShopPanel({ title: '进货单', body: CartTable({ rows }) })
    + ShopActions({
      items: [
        { label: '继续选货', ghost: true, target: 'mall/search' },
        { label: '去结算', target: 'mall/checkout' },
      ],
    });

  return ShopPage({ title: ctx.pageName, note: `共 ${rows.length} 件商品`, body });
}

export const PAGE_CSS = ``;
