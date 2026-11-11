import { ReportPage, ReportHero, StatRow, Block, BaseTable, BarRows, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k) => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}%` : '—';
  };
  const throughput = rows.slice().sort((a, b) => Number(b.autoThroughput || 0) - Number(a.autoThroughput || 0));

  const stats = StatRow([
    { label: '设备数', value: rows.length },
    { label: '运行小时', value: sum('runHours') },
    { label: '自动化吞吐', value: sum('autoThroughput') },
    { label: '任务数', value: sum('taskCount') },
    { label: '故障小时', value: sum('faultHours') },
    { label: '利用率', value: avg('rate') },
  ], { cols: 6 });

  const table = BaseTable({
    columns: [
      { key: 'type', label: '设备类型', width: '110px', render: (r) => dash(r.type) },
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'runHours', label: '运行小时', width: '95px', align: 'right', render: (r) => dash(r.runHours) },
      { key: 'autoThroughput', label: '自动化吞吐', width: '105px', align: 'right', render: (r) => dash(r.autoThroughput) },
      { key: 'taskCount', label: '任务数', width: '85px', align: 'right', render: (r) => dash(r.taskCount) },
      { key: 'faultHours', label: '故障小时', width: '95px', align: 'right', render: (r) => dash(r.faultHours) },
      { key: 'idleHours', label: '空闲小时', width: '95px', align: 'right', render: (r) => dash(r.idleHours) },
      { key: 'rate', label: '利用率', width: '85px', align: 'right', render: (r) => dash(r.rate) },
      { key: 'bottleneck', label: '瓶颈设备', width: '110px', render: (r) => dash(r.bottleneck) },
    ],
    rows,
    emptyTitle: '暂无设备利用率',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }),
    stats,
    blocks: [
      Block({ title: '明细', note: `共 ${rows.length} 条`, body: table }),
      Block({ title: '自动化吞吐', note: '按设备任务完成数汇总', body: throughput.length ? BarRows(throughput.map((r) => ({ label: `${r.type} · ${r.warehouse}`, value: r.autoThroughput }))) : EmptyState({ title: '暂无自动化吞吐', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
