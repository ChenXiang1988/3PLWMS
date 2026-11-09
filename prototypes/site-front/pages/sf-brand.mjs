import {
  ShopPage, ShopPanel, ShopFields, ShopRow, ShopTable,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const page = data[ctx.pageKey] || {};
  const site = (page.site || [])[0] || {};

  const facts = ShopFields({ items: (site.facts || []).map((f) => ({ label: f.label, value: f.value })) });
  const story = (site.story || []).map((s) => ShopRow({
    name: s.year,
    note: s.text,
    value: '',
  })).join('');
  const certs = ShopTable({
    columns: [
      { key: 'name', label: '资质名称' },
      { key: 'no', label: '证书编号', width: '220px' },
      { key: 'validTo', label: '有效期至', width: '120px' },
    ],
    rows: site.certs || [],
  });

  const body = ShopPanel({ title: '品牌事实', body: facts })
    + ShopPanel({ title: '年份沿革', body: story })
    + ShopPanel({ title: '资质', body: certs });

  return ShopPage({ title: ctx.pageName, body });
}

export const PAGE_CSS = ``;
