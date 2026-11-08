import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

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
  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.docType, value: r.completed })));
  const block2 = Block({
    title: '构成',
    note: '按单据类型已完成量',
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [block1, block2] });
}

export const PAGE_CSS = ``;
