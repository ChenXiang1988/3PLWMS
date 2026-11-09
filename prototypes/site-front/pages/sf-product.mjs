import {
  ShopPage, ShopDetailHero, ShopPanel, ShopTable, ShopRow,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const site = (page.site || [])[0] || {};
  const products = page.products || [];
  const sku = products.find((p) => p.skuCode === page.skuCode) || products[0] || {};

  const spec = ShopTable({
    columns: [
      { key: 'spec', label: '规格' },
      { key: 'unit', label: '单位', width: '100px' },
      { key: 'shelfLife', label: '保质期', width: '120px' },
      { key: 'origin', label: '产地', width: '120px' },
    ],
    rows: [{
      spec: sku.spec,
      unit: sku.unit,
      shelfLife: sku.shelfLifeDays ? `${sku.shelfLifeDays} 天` : '—',
      origin: site.origin,
    }],
  });

  const stores = (site.stores || []).map((s) => ShopRow({
    name: s.name,
    note: `${s.city} · ${s.address}`,
    value: s.hours,
    action: '到店咨询',
  })).join('');

  const body = ShopDetailHero({
    ...sku,
    showOwner: false,
    publicPrice: true,
    meta: `${sku.category} · 保质期 ${sku.shelfLifeDays} 天`,
    actions: [
      { label: '到店咨询', toast: '到店咨询（原型示意）' },
      { label: '返回商品', ghost: true, target: 'site-front/sf-products' },
    ],
  })
    + ShopPanel({ title: '规格与产地', body: spec })
    + ShopPanel({ title: '门店自提', body: stores });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
