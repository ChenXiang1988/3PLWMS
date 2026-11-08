import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

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
  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.taskType, value: r.waitQty })));
  const block2 = Block({
    title: '构成',
    note: '按任务类型待作业量',
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [block1, block2] });
}

export const PAGE_CSS = ``;
