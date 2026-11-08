import {
  ShopPage, CartTable, ShopSummary, ShopFields, ShopPanel, ShopActions, esc,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const products = (data.home || {}).products || [];
  const find = (code) => products.find((p) => p.skuCode === code) || {};
  const conf = data.checkout || {};
  const r = conf.receiver || {};
  const rows = (conf.rows || []).map((x) => ({ ...find(x.skuCode), qty: x.qty }));

  const groups = [];
  for (const row of rows) {
    const owner = row.owner || '其它';
    let group = groups.find((g) => g.owner === owner);
    if (!group) { group = { owner, rows: [] }; groups.push(group); }
    group.rows.push(row);
  }

  const body = groups.map((g) => `<div class="ml-checkout-group" data-shop-group="${esc(g.owner)}">`
    + `<div class="ml-group-head"><b>店铺订单</b><span>${esc(g.owner)}</span></div>`
    + ShopFields({
      items: [
        { label: '货主', value: g.owner },
        { label: '收货方', value: r.receiverName },
        { label: '收货地址', value: r.address },
        { label: '承运商', value: r.carrier },
        { label: '联系电话', value: r.phone },
      ],
    })
    + ShopPanel({ title: '商品清单', body: CartTable({ rows: g.rows, readonly: true }) })
    + ShopSummary({ freight: 0 })
    + ShopActions({
      items: [
        { label: '返回商城', ghost: true, target: 'mall/cart' },
        { label: '提交本店订单', submit: true, group: g.owner },
      ],
    })
    + `</div>`).join('');

  return ShopPage({ title: ctx.pageName, note: `共 ${rows.length} 件商品`, body });
}

export const PAGE_CSS = `
.ml-checkout-group{margin-bottom:var(--wx-sp-5);border:var(--wx-border);border-radius:var(--wx-r-md);background:var(--wx-white);padding:var(--wx-sp-4)}
.ml-group-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--wx-sp-3);font-size:var(--wx-fs-lg)}
.ml-group-head span{font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
`;
