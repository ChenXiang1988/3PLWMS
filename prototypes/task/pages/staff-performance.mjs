import { ReportPage, ReportHero, StatRow, Block, BaseTable, BarRows, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k, suffix = '') => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}${suffix}` : '—';
  };
  const ranked = rows.slice().sort((a, b) => Number(b.efficiency || 0) - Number(a.efficiency || 0));

  const stats = StatRow([
    { label: '人员数', value: rows.length },
    { label: '任务数', value: sum('taskCount') },
    { label: '出勤工时', value: sum('workHours') },
    { label: '平均人效', value: avg('efficiency') },
    { label: '平均分钟', value: avg('avgMinutes') },
    { label: '准确率', value: avg('accuracy', '%') },
  ], { cols: 6 });

  const table = BaseTable({
    columns: [
      { key: 'staff', label: '人员', width: '100px', render: (r) => dash(r.staff) },
      { key: 'team', label: '班组', width: '110px', render: (r) => dash(r.team) },
      { key: 'shift', label: '班次', width: '90px', render: (r) => dash(r.shift) },
      { key: 'taskCount', label: '任务数', width: '80px', align: 'right', render: (r) => dash(r.taskCount) },
      { key: 'workHours', label: '出勤工时', width: '90px', align: 'right', render: (r) => dash(r.workHours) },
      { key: 'efficiency', label: '人效', width: '80px', align: 'right', render: (r) => dash(r.efficiency) },
      { key: 'avgMinutes', label: '平均分钟', width: '90px', align: 'right', render: (r) => dash(r.avgMinutes) },
      { key: 'errorCount', label: '错误数', width: '75px', align: 'right', render: (r) => dash(r.errorCount) },
      { key: 'accuracy', label: '准确率', width: '80px', align: 'right', render: (r) => dash(r.accuracy) },
      { key: 'bottleneck', label: '当前瓶颈', width: '110px', render: (r) => dash(r.bottleneck) },
    ],
    rows,
    emptyTitle: '暂无人效与准确率',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }),
    stats,
    blocks: [
      Block({ title: '明细', note: `共 ${rows.length} 条`, body: table }),
      Block({ title: '人效排名', note: '已完成任务数除以出勤工时', body: ranked.length ? BarRows(ranked.map((r) => ({ label: `${r.staff} · ${r.team}`, value: r.efficiency }))) : EmptyState({ title: '暂无人效排名', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
