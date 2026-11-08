import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

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
  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.warehouse, value: r.batchCount })));
  const block2 = Block({
    title: '构成',
    note: `共 ${rows.length} 条`,
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [block1, block2] });
}

export const PAGE_CSS = ``;
