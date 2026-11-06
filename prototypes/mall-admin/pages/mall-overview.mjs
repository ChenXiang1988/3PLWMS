import { ReportHero, StatRow, Block, BaseTable, esc, n } from '../../shared/ui.mjs';

const money = (v) => `￥${Number(v || 0).toFixed(2)}`;

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

  const max = Math.max(1, ...rows.map((r) => Number(r.orderCount) || 0));
  const bars = rows.slice(0, 5).map((r) => {
    const pct = Math.round((Number(r.orderCount) || 0) / max * 100);
    return `<div class="ma-mall-overview-bar">`
      + `<span class="ma-mall-overview-label">${esc(r.shopName)}</span>`
      + `<span class="ma-mall-overview-track"><span class="ma-mall-overview-fill" style="width:${pct}%"></span></span>`
      + `<span class="ma-mall-overview-value">${n(r.orderCount)}</span>`
      + `</div>`;
  }).join('');

  const block2 = Block({
    title: '构成',
    note: '按店铺订单量',
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

export const PAGE_CSS = `
.ma-mall-overview-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.ma-mall-overview-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ma-mall-overview-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.ma-mall-overview-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.ma-mall-overview-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
