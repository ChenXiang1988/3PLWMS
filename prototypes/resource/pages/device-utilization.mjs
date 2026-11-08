import { ReportPage, ReportHero, StatRow, Block, BaseTable, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k) => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}%` : '—';
  };

  const stats = StatRow([
    { label: '设备数', value: rows.length },
    { label: '运行小时', value: sum('runHours') },
    { label: '任务数', value: sum('taskCount') },
    { label: '故障小时', value: sum('faultHours') },
    { label: '利用率', value: avg('rate') },
  ], { cols: 5 });

  const table = BaseTable({
    columns: [
      { key: 'type', label: '设备类型', width: '120px', render: (r) => dash(r.type) },
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'runHours', label: '运行小时', width: '110px', align: 'right', render: (r) => dash(r.runHours) },
      { key: 'taskCount', label: '任务数', width: '100px', align: 'right', render: (r) => dash(r.taskCount) },
      { key: 'faultHours', label: '故障小时', width: '110px', align: 'right', render: (r) => dash(r.faultHours) },
      { key: 'rate', label: '利用率', width: '100px', align: 'right', render: (r) => dash(r.rate) },
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
      Block({ title: '构成', note: '', body: rows.length ? EmptyState({ title: '暂无构成数据', desc: '当前筛选条件下没有任何记录。' }) : EmptyState({ title: '暂无设备利用率', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
