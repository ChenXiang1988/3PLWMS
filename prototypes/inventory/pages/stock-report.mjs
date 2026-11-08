import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const stats = StatRow([
    { label: '在库数量', value: sum('onHandQty'), tone: 'default' },
    { label: '冻结数量', value: sum('frozenQty'), tone: sum('frozenQty') ? 'warn' : 'ok' },
    { label: '可用数量', value: sum('availableQty'), tone: 'ok' },
    { label: '库位数', value: sum('binCount'), tone: 'default' },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'owner', label: '货主', width: '120px' },
      { key: 'onHandQty', label: '在库数量', width: '120px', align: 'right' },
      { key: 'frozenQty', label: '冻结数量', width: '120px', align: 'right' },
      { key: 'availableQty', label: '可用数量', width: '120px', align: 'right' },
      { key: 'binCount', label: '库位数', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });
  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.owner, value: r.onHandQty })));
  const block2 = Block({
    title: '构成',
    note: '按货主在库数量',
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [block1, block2] });
}

export const PAGE_CSS = ``;
