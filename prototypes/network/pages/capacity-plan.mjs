import { ReportPage, ReportHero, StatRow, Block, BaseTable, BarRows, EmptyState, dash } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const avg = (k) => {
    const vals = rows.map((r) => parseFloat(r[k])).filter((v) => !Number.isNaN(v));
    return vals.length ? `${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)}%` : '—';
  };
  const forecast = rows.filter((r) => r.shift);
  const plans = rows.filter((r) => !r.shift);
  const stats = StatRow([
    { label: '仓库数', value: plans.length },
    { label: '总容量', value: sum('total') },
    { label: '已用容量', value: sum('used') },
    { label: '使用率', value: avg('rate') },
    { label: '理论产能', value: sum('theoreticalCapacity') },
    { label: '预计余量', value: sum('remainingCapacity') },
  ], { cols: 6 });

  const table = BaseTable({
    columns: [
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'total', label: '总容量', width: '100px', align: 'right', render: (r) => dash(r.total) },
      { key: 'used', label: '已用容量', width: '105px', align: 'right', render: (r) => dash(r.used) },
      { key: 'rate', label: '使用率', width: '90px', align: 'right', render: (r) => dash(r.rate) },
      { key: 'theoreticalCapacity', label: '理论产能', width: '105px', align: 'right', render: (r) => dash(r.theoreticalCapacity) },
      { key: 'occupiedCapacity', label: '已占用产能', width: '115px', align: 'right', render: (r) => dash(r.occupiedCapacity) },
      { key: 'remainingCapacity', label: '预计余量', width: '105px', align: 'right', render: (r) => dash(r.remainingCapacity) },
      { key: 'risk', label: '容量风险', width: '100px', render: (r) => dash(r.risk) },
    ], rows: plans, emptyTitle: '暂无仓容与产能规划', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  const shiftTable = BaseTable({
    columns: [
      { key: 'shift', label: '班次', width: '100px', render: (r) => dash(r.shift) },
      { key: 'warehouse', label: '仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'availableStaff', label: '可用人员', width: '90px', align: 'right', render: (r) => dash(r.availableStaff) },
      { key: 'availableDevices', label: '可用设备', width: '90px', align: 'right', render: (r) => dash(r.availableDevices) },
      { key: 'theoreticalCapacity', label: '理论产能', width: '100px', align: 'right', render: (r) => dash(r.theoreticalCapacity) },
      { key: 'occupiedCapacity', label: '已占用产能', width: '110px', align: 'right', render: (r) => dash(r.occupiedCapacity) },
      { key: 'remainingCapacity', label: '预计余量', width: '100px', align: 'right', render: (r) => dash(r.remainingCapacity) },
      { key: 'forecastFinish', label: '预计完成', width: '110px', render: (r) => dash(r.forecastFinish) },
    ], rows: forecast, emptyTitle: '暂无班次产能预测', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: '' }), stats,
    blocks: [
      Block({ title: '仓容与产能', note: `共 ${plans.length} 个仓库`, body: table }),
      Block({ title: '班次产能预测', note: '按当前人员与设备可用量估算', body: shiftTable }),
      Block({ title: '仓库容量风险', note: '按预计余量排序', body: plans.length ? BarRows(plans.slice().sort((a, b) => Number(a.remainingCapacity || 0) - Number(b.remainingCapacity || 0)).map((r) => ({ label: `${r.warehouse} · ${r.risk}`, value: r.remainingCapacity }))) : EmptyState({ title: '暂无容量风险', desc: '当前筛选条件下没有任何记录。' }) }),
    ],
  });
}

export const PAGE_CSS = ``;
