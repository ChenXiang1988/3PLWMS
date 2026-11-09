import {
  ShopPage, ShopDetailHero, ShopPanel, ShopTable,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const site = (page.site || [])[0] || {};
  const products = page.products || [];
  const sku = products.find((p) => p.skuCode === page.skuCode) || products[0] || {};

  const spec = ShopTable({
    columns: [
      { key: 'spec', label: '规格' },
      { key: 'origin', label: '产地', width: '120px' },
    ],
    rows: [{ spec: `${sku.spec} · ${sku.unit}`, origin: site.origin }],
  });

  const body = ShopDetailHero({
    ...sku,
    showOwner: false,
    publicPrice: true,
    meta: `${sku.category} · 保质期 ${sku.shelfLifeDays} 天`,
    actions: [
      { label: '到店咨询', toast: '到店咨询（原型示意）' },
      { label: '返回商品', ghost: true, target: 'site-front/sf-m-products' },
    ],
  })
    + ShopPanel({ title: '规格与产地', body: spec });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
