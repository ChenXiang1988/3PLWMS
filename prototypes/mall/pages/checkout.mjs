import {
  ShopPage, CartTable, ShopSummary, ShopFields, ShopPanel, ShopActions,
} from '../../01 shared/ui.mjs';

export function renderPage(data, ctx) {
  const products = (data.home || {}).products || [];
  const find = (code) => products.find((p) => p.skuCode === code) || {};
  const conf = data.checkout || {};
  const r = conf.receiver || {};
  const rows = (conf.rows || []).map((x) => ({ ...find(x.skuCode), qty: x.qty }));

  const body = ShopFields({
    items: [
      { label: '收货方', value: r.receiverName },
      { label: '收货地址', value: r.address },
      { label: '承运商', value: r.carrier },
      { label: '联系电话', value: r.phone },
    ],
  })
    + ShopPanel({ title: '商品清单', body: CartTable({ rows, readonly: true }) })
    + ShopSummary({ freight: 0 })
    + ShopActions({
      items: [
        { label: '返回商城', ghost: true, target: 'mall/cart' },
        { label: '提交订单', submit: true },
      ],
    });

  return ShopPage({ title: ctx.pageName, note: `共 ${rows.length} 件商品`, body });
}

export const PAGE_CSS = ``;
