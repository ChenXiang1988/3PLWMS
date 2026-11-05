import { ReportHero, StatRow, Block, BaseTable, esc, n } from '../../01 shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const stats = StatRow([
    { label: '批次数', value: sum('batchCount') },
    { label: '临期批次', value: sum('nearCount'), tone: 'warn' },
    { label: '禁售批次', value: sum('holdCount'), tone: 'alert' },
    { label: '过期批次', value: sum('expiredCount'), tone: 'alert' },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'warehouse', label: '仓库', width: '120px' },
      { key: 'owner', label: '货主', width: '120px' },
      { key: 'batchCount', label: '批次数', width: '120px', align: 'right' },
      { key: 'nearCount', label: '临期批次', width: '120px', align: 'right' },
      { key: 'holdCount', label: '禁售批次', width: '120px', align: 'right' },
      { key: 'expiredCount', label: '过期批次', width: '120px', align: 'right' },
      { key: 'qty', label: '在库数量', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });

  const max = Math.max(1, ...rows.map((r) => Number(r.batchCount) || 0));
  const bars = rows.slice(0, 5).map((r) => {
    const pct = Math.round((Number(r.batchCount) || 0) / max * 100);
    return `<div class="iv-batch-network-report-bar">`
      + `<span class="iv-batch-network-report-label">${esc(r.warehouse)}</span>`
      + `<span class="iv-batch-network-report-track"><span class="iv-batch-network-report-fill" style="width:${pct}%"></span></span>`
      + `<span class="iv-batch-network-report-value">${n(r.batchCount)}</span>`
      + `</div>`;
  }).join('');

  const block2 = Block({
    title: '构成',
    note: `共 ${rows.length} 条`,
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

export const PAGE_CSS = `
.iv-batch-network-report-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.iv-batch-network-report-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.iv-batch-network-report-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.iv-batch-network-report-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.iv-batch-network-report-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
