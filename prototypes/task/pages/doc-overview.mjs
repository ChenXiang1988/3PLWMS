import { ReportHero, StatRow, Block, BaseTable, esc, n } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const stats = StatRow([
    { label: '待处理', value: sum('pending'), tone: 'default' },
    { label: '进行中', value: sum('doing'), tone: 'default' },
    { label: '异常待处理', value: sum('exception'), tone: sum('exception') ? 'alert' : 'ok' },
    { label: '已完成', value: sum('completed'), tone: 'ok' },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'docType', label: '单据类型', width: '160px' },
      { key: 'pending', label: '待处理', width: '120px', align: 'right' },
      { key: 'doing', label: '进行中', width: '120px', align: 'right' },
      { key: 'exception', label: '异常待处理', width: '120px', align: 'right' },
      { key: 'completed', label: '已完成', width: '120px', align: 'right' },
      { key: 'overdue', label: '超期数', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });

  const max = Math.max(1, ...rows.map((r) => Number(r.completed) || 0));
  const bars = rows.slice(0, 5).map((r) => {
    const pct = Math.round((Number(r.completed) || 0) / max * 100);
    return `<div class="tk-doc-overview-bar">`
      + `<span class="tk-doc-overview-label">${esc(r.docType)}</span>`
      + `<span class="tk-doc-overview-track"><span class="tk-doc-overview-fill" style="width:${pct}%"></span></span>`
      + `<span class="tk-doc-overview-value">${n(r.completed)}</span>`
      + `</div>`;
  }).join('');

  const block2 = Block({
    title: '构成',
    note: '按单据类型已完成量',
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

export const PAGE_CSS = `
.tk-doc-overview-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.tk-doc-overview-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tk-doc-overview-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.tk-doc-overview-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.tk-doc-overview-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
