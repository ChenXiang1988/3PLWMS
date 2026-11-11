import { ReportPage, ReportHero, StatRow, Block, BaseTable, BarRows, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k) => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}%` : '—';
  };
  const stats = StatRow([
    { label: '入库量', value: sum('inbound') },
    { label: '出库量', value: sum('outbound') },
    { label: '在库量', value: sum('stock') },
    { label: '异常数', value: sum('exception') },
    { label: '人效', value: sum('efficiency') },
    { label: '产能利用率', value: avg('usage') },
  ], { cols: 6 });
  const table = BaseTable({
    columns: [
      { key: 'date', label: '日期', width: '120px', render: (r) => dash(r.date) },
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'inbound', label: '入库量', width: '100px', align: 'right', render: (r) => dash(r.inbound) },
      { key: 'outbound', label: '出库量', width: '100px', align: 'right', render: (r) => dash(r.outbound) },
      { key: 'stock', label: '在库量', width: '110px', align: 'right', render: (r) => dash(r.stock) },
      { key: 'exception', label: '异常数', width: '80px', align: 'right', render: (r) => dash(r.exception) },
      { key: 'efficiency', label: '人效', width: '80px', align: 'right', render: (r) => dash(r.efficiency) },
      { key: 'usage', label: '产能利用率', width: '110px', align: 'right', render: (r) => dash(r.usage) },
      { key: 'forecast', label: '吞吐预测', width: '100px', align: 'right', render: (r) => dash(r.forecast) },
    ], rows, emptyTitle: '暂无运营日报', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  const throughput = rows.slice().sort((a, b) => Number(b.forecast || 0) - Number(a.forecast || 0));
  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }), stats,
    blocks: [
      Block({ title: '仓库日报', note: `共 ${rows.length} 条`, body: table }),
      Block({ title: '吞吐预测', note: '按仓库预测当日可完成量', body: throughput.length ? BarRows(throughput.map((r) => ({ label: r.warehouse, value: r.forecast }))) : EmptyState({ title: '暂无吞吐预测', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
