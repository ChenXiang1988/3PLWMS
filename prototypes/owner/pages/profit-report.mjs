import { ReportPage, ReportHero, StatRow, Block, BaseTable, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k) => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}%` : '—';
  };

  const stats = StatRow([
    { label: '订单数', value: rows.length },
    { label: '销售额', value: sum('sale') },
    { label: '毛利', value: sum('profit') },
    { label: '毛利率', value: avg('rate') },
  ], { cols: 4 });

  const table = BaseTable({
    columns: [
      { key: 'orderNo', label: '订单号', width: '150px', render: (r) => dash(r.orderNo) },
      { key: 'shop', label: '店铺', width: '120px', render: (r) => dash(r.shop) },
      { key: 'sale', label: '商品售价', width: '110px', align: 'right', render: (r) => dash(r.sale) },
      { key: 'freight', label: '买家实付运费', width: '120px', align: 'right', render: (r) => dash(r.freight) },
      { key: 'commission', label: '平台佣金', width: '110px', align: 'right', render: (r) => dash(r.commission) },
      { key: 'logistics', label: '物流费', width: '100px', align: 'right', render: (r) => dash(r.logistics) },
      { key: 'cost', label: '采购成本', width: '110px', align: 'right', render: (r) => dash(r.cost) },
      { key: 'refund', label: '退款', width: '100px', align: 'right', render: (r) => dash(r.refund) },
      { key: 'profit', label: '毛利', width: '110px', align: 'right', render: (r) => dash(r.profit) },
      { key: 'rate', label: '毛利率', width: '100px', align: 'right', render: (r) => dash(r.rate) },
    ],
    rows,
    emptyTitle: '暂无订单利润报表',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }),
    stats,
    blocks: [
      Block({ title: '明细', note: `共 ${rows.length} 条`, body: table }),
      Block({ title: '构成', note: '', body: rows.length ? EmptyState({ title: '暂无构成数据', desc: '当前筛选条件下没有任何记录。' }) : EmptyState({ title: '暂无订单利润报表', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
