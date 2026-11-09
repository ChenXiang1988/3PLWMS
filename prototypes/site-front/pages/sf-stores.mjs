import { ShopPage, ShopPanel, ShopTable } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const site = (page.site || [])[0] || {};

  const table = ShopTable({
    columns: [
      { key: 'name', label: '门店', width: '140px' },
      { key: 'city', label: '城市', width: '100px' },
      { key: 'address', label: '地址' },
      { key: 'hours', label: '营业时间', width: '140px' },
      { key: 'phone', label: '电话', width: '140px' },
    ],
    rows: site.stores || [],
  });

  return ShopPage({
    title: ctx.pageName,
    body: ShopPanel({ title: `${site.siteName || ''}门店`, body: table }),
  });
}

export const PAGE_CSS = ``;
