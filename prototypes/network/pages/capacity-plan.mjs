import { ReportPage, ReportHero, StatRow, Block, BaseTable, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k) => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}%` : '—';
  };

  const stats = StatRow([
    { label: '总容量', value: sum('total') },
    { label: '已用容量', value: sum('used') },
    { label: '使用率', value: avg('rate') },
    { label: '峰值', value: sum('peak') },
  ], { cols: 4 });

  const table = BaseTable({
    columns: [
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'total', label: '总容量', width: '110px', align: 'right', render: (r) => dash(r.total) },
      { key: 'used', label: '已用', width: '110px', align: 'right', render: (r) => dash(r.used) },
      { key: 'rate', label: '使用率', width: '100px', align: 'right', render: (r) => dash(r.rate) },
      { key: 'inAvg', label: '日均入库', width: '110px', align: 'right', render: (r) => dash(r.inAvg) },
      { key: 'outAvg', label: '日均出库', width: '110px', align: 'right', render: (r) => dash(r.outAvg) },
      { key: 'peak', label: '峰值', width: '110px', align: 'right', render: (r) => dash(r.peak) },
      { key: 'available', label: '可用容量', width: '110px', align: 'right', render: (r) => dash(r.available) },
    ],
    rows,
    emptyTitle: '暂无仓容与产能规划',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }),
    stats,
    blocks: [
      Block({ title: '明细', note: `共 ${rows.length} 条`, body: table }),
      Block({ title: '构成', note: '', body: rows.length ? EmptyState({ title: '暂无构成数据', desc: '当前筛选条件下没有任何记录。' }) : EmptyState({ title: '暂无仓容与产能规划', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
