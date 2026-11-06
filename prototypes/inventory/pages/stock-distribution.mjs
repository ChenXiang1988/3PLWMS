import { ReportHero, StatRow, Block, BaseTable, esc, n } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const stats = StatRow([
    { label: '在库数量', value: sum('onHandQty'), tone: 'default' },
    { label: '可用数量', value: sum('availableQty'), tone: 'ok' },
    { label: '冻结数量', value: sum('frozenQty'), tone: sum('frozenQty') ? 'warn' : 'ok' },
    { label: '库位数', value: sum('binCount'), tone: 'default' },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'warehouse', label: '仓库', width: '120px' },
      { key: 'owner', label: '货主', width: '120px' },
      { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right' },
      { key: 'availableQty', label: '可用数量', width: '120px', align: 'right' },
      { key: 'frozenQty', label: '冻结数量', width: '120px', align: 'right' },
      { key: 'binCount', label: '库位数', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });

  const byWarehouse = new Map();
  for (const r of rows) {
    const key = r.warehouse || '—';
    byWarehouse.set(key, (byWarehouse.get(key) || 0) + Number(r.onHandQty || 0));
  }
  const barsData = [...byWarehouse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(1, ...barsData.map((x) => x[1]));
  const bars = barsData.map(([name, qty]) => {
    const pct = Math.round((qty / max) * 100);
    return `<div class="iv-stock-distribution-bar">`
      + `<span class="iv-stock-distribution-label">${esc(name)}</span>`
      + `<span class="iv-stock-distribution-track"><span class="iv-stock-distribution-fill" style="width:${pct}%"></span></span>`
      + `<span class="iv-stock-distribution-value">${n(qty)}</span>`
      + `</div>`;
  }).join('');

  const block2 = Block({
    title: '构成',
    note: '按仓库在库数量',
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

export const PAGE_CSS = `
.iv-stock-distribution-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.iv-stock-distribution-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.iv-stock-distribution-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.iv-stock-distribution-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.iv-stock-distribution-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
