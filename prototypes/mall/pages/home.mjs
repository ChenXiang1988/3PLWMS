import {
  ShopPage, ShopHero, ShopCategory, ShopFloor, ProductCard, ShopPanel,
  ShopHomeGrid, ShopRow, ShopActions, SHOP_CATEGORIES,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const home = data.home || {};
  const products = home.products || [];
  const owners = [...new Set(products.map((p) => p.owner))];
  const find = (code) => products.find((p) => p.skuCode === code);

  const floors = (home.floors || []).map((f) => ShopFloor({
    title: f.title,
    note: f.note,
    cards: (f.skuCodes || []).map(find).filter(Boolean).map((p) => ProductCard(p)),
  })).join('');

  const shops = owners.map((o) => {
    const list = products.filter((p) => p.owner === o);
    const cats = [...new Set(list.map((p) => p.category))].join('、');
    return ShopRow({
      name: o,
      note: `在售 ${list.length} 件商品 · 在仓现货 · ${cats}`,
      value: `店铺评分 ${list[0].score}`,
      action: '进入店铺',
    });
  }).join('');

  const body = ShopHero({
    guest: true,
    title: '热销货源',
    note: '本部署货主在仓现货，下单后由出库订单履约',
    marks: [
      { label: '在售商品', value: String(products.length) },
      { label: '货主店铺', value: String(owners.length) },
      { label: '商品类目', value: String((home.categories || []).length - 1) },
    ],
  })
    + ShopHomeGrid({
      side: ShopCategory({ items: home.categories || SHOP_CATEGORIES, count: products.length }),
      main: floors,
    })
    + ShopPanel({
      title: '店铺推荐',
      body: shops + ShopActions({ items: [{ label: '申请入驻', ghost: true, toast: '申请入驻（原型示意）' }] }),
    });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
