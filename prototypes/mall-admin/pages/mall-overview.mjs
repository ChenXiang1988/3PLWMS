import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState, money } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const stats = StatRow([
    { label: '在售商品', value: sum('onSaleCount'), tone: 'default' },
    { label: '店铺数', value: rows.length, tone: 'default' },
    { label: '订单量', value: sum('orderCount'), tone: 'default' },
    { label: '成交额', value: sum('amount'), tone: 'ok' },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'shopName', label: '店铺名称', width: '160px' },
      { key: 'onSaleCount', label: '在售商品', width: '120px', align: 'right' },
      { key: 'orderCount', label: '订单量', width: '120px', align: 'right' },
      { key: 'amount', label: '成交额', width: '120px', align: 'right', render: (r) => money(r.amount) },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });
  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.shopName, value: r.orderCount })));
  const block2 = Block({
    title: '构成',
    note: '按店铺订单量',
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [block1, block2] });
}

export const PAGE_CSS = ``;
