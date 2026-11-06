import { ReportHero, StatRow, Block, BaseTable, esc, n } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const stats = StatRow([
    { label: '待作业', value: sum('waitQty'), tone: 'default' },
    { label: '作业中', value: sum('busyQty'), tone: 'default' },
    { label: '异常', value: sum('exceptionQty'), tone: sum('exceptionQty') ? 'alert' : 'ok' },
    { label: '已完成', value: sum('doneQty'), tone: 'ok' },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'taskType', label: '任务类型', width: '160px' },
      { key: 'waitQty', label: '待作业', width: '120px', align: 'right' },
      { key: 'busyQty', label: '作业中', width: '120px', align: 'right' },
      { key: 'exceptionQty', label: '异常', width: '120px', align: 'right' },
      { key: 'doneQty', label: '已完成', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });

  const max = Math.max(1, ...rows.map((r) => Number(r.waitQty) || 0));
  const bars = rows.slice(0, 5).map((r) => {
    const pct = Math.round((Number(r.waitQty) || 0) / max * 100);
    return `<div class="tk-task-report-bar">`
      + `<span class="tk-task-report-label">${esc(r.taskType)}</span>`
      + `<span class="tk-task-report-track"><span class="tk-task-report-fill" style="width:${pct}%"></span></span>`
      + `<span class="tk-task-report-value">${n(r.waitQty)}</span>`
      + `</div>`;
  }).join('');

  const block2 = Block({
    title: '构成',
    note: '按任务类型待作业量',
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

export const PAGE_CSS = `
.tk-task-report-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.tk-task-report-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tk-task-report-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.tk-task-report-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.tk-task-report-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
