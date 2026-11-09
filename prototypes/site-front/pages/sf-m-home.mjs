import {
  ShopPage, ShopHero, ShopFloor, ProductCard, ShopPanel, ShopActions,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const site = (page.site || [])[0] || {};
  const products = page.products || [];

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

  const body = ShopHero({
    title: site.siteName || '',
    note: site.siteIntro || '',
    marks: (site.facts || []).slice(0, 2),
    action: '浏览商品',
    actionTarget: 'site-front/sf-m-products',
  })
    + ShopFloor({
      title: '主推商品',
      note: `共 ${products.length} 件`,
      more: '',
      cards,
    })
    + ShopPanel({
      title: '门店网点',
      body: ShopActions({ items: [{ label: '查看门店', ghost: true, target: 'site-front/sf-m-stores' }] }),
    });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
