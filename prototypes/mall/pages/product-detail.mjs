import {
  ShopPage, ShopFields, ShopPanel, ShopTable, ShopDetailHero, ShopRow,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const products = (data.home || {}).products || [];
  const conf = data['product-detail'] || {};
  const p = products.find((x) => x.skuCode === conf.skuCode) || products[0];

  const tiers = (conf.tiers || []).map((t) => ({
    minQty: `起批 ${t.minQty} ${p.unit}`,
    price: t.price,
  }));
  const batches = conf.batches || [];

  const body = ShopDetailHero(p)
    + ShopFields({
      items: [
        { label: '商品编码', value: p.skuCode },
        { label: '货主', value: p.owner },
        { label: '规格', value: p.spec },
        { label: '商品类目', value: p.category },
        { label: '仓库', value: p.warehouse },
        { label: '店铺评分', value: p.score },
      ],
    })
    + ShopPanel({
      title: '阶梯价',
      body: ShopTable({
        columns: [{ key: 'minQty', label: '起批量' }, { key: 'price', label: '单价', price: true }],
        rows: tiers,
      }),
    })
    + ShopPanel({
      title: '批次效期',
      body: ShopTable({
        columns: [
          { key: 'batchNo', label: '批次号' },
          { key: 'productionDate', label: '生产日期' },
          { key: 'expiryDate', label: '失效日期' },
          { key: 'warehouse', label: '仓库' },
          { key: 'qty', label: '在库数量' },
        ],
        rows: batches,
      }),
    })
    + ShopPanel({
      title: '货主店铺',
      body: ShopRow({
        name: p.owner,
        note: `${p.category} · ${p.warehouse} · 在仓现货`,
        value: `店铺评分 ${p.score}`,
        action: '进入店铺',
      }),
    });

  return ShopPage({ title: ctx.pageName, note: p.skuName, body });
}

export const PAGE_CSS = ``;
