import {
  ShopPage, ShopFloor, ProductCard, ShopFilter, ShopResult, ShopEmpty,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const products = (data.home || {}).products || [];
  const conf = data.search || {};
  const cards = products.map((p) => ProductCard(p));

  const body = ShopFilter({ categories: conf.categories || [], owners: conf.owners || [] })
    + ShopResult({ count: products.length })
    + ShopFloor({ title: '全部商品', note: '', more: '', cards })
    + ShopEmpty();

  return ShopPage({ title: ctx.pageName, note: `共 ${products.length} 件商品`, body });
}

export const PAGE_CSS = ``;
