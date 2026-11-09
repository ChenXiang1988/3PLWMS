import {
  ShopPage, ShopFilter, ShopFloor, ProductCard,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const products = page.products || [];
  const categories = (page.categories || []).filter((c) => c !== '全部商品');

  const cards = products.map((p) => ProductCard({
    ...p,
    badge: '',
    showOwner: false,
    publicPrice: true,
    detailTarget: 'site-front/sf-m-product',
    meta: p.category,
    actions: [
      { label: '查看商品', target: 'site-front/sf-m-product' },
      { label: '到店咨询', ghost: true, toast: '到店咨询（原型示意）' },
    ],
  }));

  const body = ShopFilter({ categories, owners: [] })
    + ShopFloor({ title: '全部商品', note: `共 ${products.length} 件`, more: '', cards });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
