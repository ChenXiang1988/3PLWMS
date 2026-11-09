import {
  ShopPage, ShopHero, ShopFloor, ProductCard, ShopPanel, ShopRow, ShopActions,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const site = (page.site || [])[0] || {};
  const products = page.products || [];
  const marks = (site.facts || []).map((f) => ({ label: f.label, value: f.value }));
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

  const stores = (site.stores || []).slice(0, 2).map((s) => ShopRow({
    name: s.name,
    note: `${s.city} · ${s.address}`,
    value: s.hours,
    action: '到店咨询',
  })).join('');

  const body = ShopHero({
    title: site.siteName || '',
    note: site.siteIntro || '',
    marks,
    action: '浏览商品',
    actionTarget: 'site-front/sf-products',
  })
    + ShopFloor({
      title: '主推商品',
      note: `共 ${products.length} 件`,
      more: '查看全部',
      moreTarget: 'site-front/sf-products',
      cards,
    })
    + ShopPanel({
      title: '门店网点',
      body: stores + ShopActions({ items: [{ label: '查看全部门店', ghost: true, target: 'site-front/sf-stores' }] }),
    });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
