import { ReportHero, StatRow, Block, BaseTable, dash, n } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { metrics = [], rows = [], details = [] } = data[ctx.pageKey] || {};
  const trendColumns = [
    { key: 'warehouse', label: '仓库' },
    { key: 'metricName', label: '指标名称', cls: 'wx-col-strong' },
    { key: 'metricValue', label: '指标值', align: 'right', render: (r) => n(r.metricValue) },
    { key: 'compareValue', label: '上期值', align: 'right', render: (r) => n(r.compareValue) },
    { key: 'changeRate', label: '变化率', align: 'right', render: (r) => dash(r.changeRate) },
    { key: 'statPeriod', label: '统计周期' },
  ];
  const feeColumns = [
    { key: 'feeItem', label: '费用项目', cls: 'wx-col-strong' },
    { key: 'amount', label: '金额', align: 'right', render: (r) => n(r.amount) },
    { key: 'shareRate', label: '占比', align: 'right', render: (r) => dash(r.shareRate) },
    { key: 'statPeriod', label: '统计周期' },
  ];
  return ReportHero({ title: '货主数据报表', sub: '库存概览、单据趋势与费用构成' })
    + StatRow(metrics, { cols: 4 })
    + Block({ title: '明细', note: '按仓库与指标汇总', body: BaseTable({ columns: trendColumns, rows }) })
    + Block({ title: '构成', note: '费用项目构成', body: BaseTable({ columns: feeColumns, rows: details }) });
}

export const PAGE_CSS = ``;
