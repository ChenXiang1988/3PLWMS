import {
  ShopPage, ShopCategory, ShopFloor, ProductCard, ShopHomeGrid, ShopFilter,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const products = page.products || [];
  const categories = page.categories || ['全部商品'];

  const cards = products.map((p) => ProductCard({
    ...p,
    badge: '',
    showOwner: false,
    publicPrice: true,
    detailTarget: 'site-front/sf-product',
    meta: `${p.category} · 保质期 ${p.shelfLifeDays} 天`,
    actions: [
      { label: '查看商品', target: 'site-front/sf-product' },
      { label: '到店咨询', ghost: true, toast: '到店咨询（原型示意）' },
    ],
  }));

  const body = ShopFilter({ categories: categories.filter((c) => c !== '全部商品'), owners: [] })
    + ShopHomeGrid({
      side: ShopCategory({ items: categories, count: products.length }),
      main: ShopFloor({ title: '全部商品', note: `共 ${products.length} 件`, more: '', cards }),
    });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
