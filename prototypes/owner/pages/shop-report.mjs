import { ReportPage, ReportHero, StatRow, Block, BaseTable, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const stats = StatRow([
    { label: '店铺数', value: rows.length },
    { label: '订单数', value: sum('orders') },
    { label: '销售额', value: sum('sales') },
    { label: '毛利', value: sum('profit') },
  ], { cols: 4 });

  const table = BaseTable({
    columns: [
      { key: 'shop', label: '店铺', width: '120px', render: (r) => dash(r.shop) },
      { key: 'orders', label: '订单数', width: '110px', align: 'right', render: (r) => dash(r.orders) },
      { key: 'sales', label: '销售额', width: '120px', align: 'right', render: (r) => dash(r.sales) },
      { key: 'refund', label: '退款额', width: '120px', align: 'right', render: (r) => dash(r.refund) },
      { key: 'profit', label: '毛利', width: '120px', align: 'right', render: (r) => dash(r.profit) },
      { key: 'rate', label: '毛利率', width: '100px', align: 'right', render: (r) => dash(r.rate) },
    ],
    rows,
    emptyTitle: '暂无店铺报表',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }),
    stats,
    blocks: [
      Block({ title: '明细', note: `共 ${rows.length} 条`, body: table }),
      Block({ title: '构成', note: '', body: rows.length ? EmptyState({ title: '暂无构成数据', desc: '当前筛选条件下没有任何记录。' }) : EmptyState({ title: '暂无店铺报表', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
