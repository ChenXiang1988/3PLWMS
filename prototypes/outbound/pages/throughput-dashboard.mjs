import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { summary = {}, hourly = [], stages = [], risks = [] } = data[ctx.pageKey] || {};
  const hero = ReportHero({ title: ctx.pageName, sub: `${summary.warehouseName || '—'} · ${summary.businessDate || '—'} · ${summary.updatedAt || '—'}` });
  const stats = StatRow([
    { label: '出库订单', value: summary.orderCount, tone: 'default', hint: `目标 ${summary.orderTarget}` },
    { label: '出库件数', value: summary.itemCount, tone: 'ok', hint: `目标 ${summary.itemTarget}` },
    { label: '当前节拍', value: summary.currentRate, tone: 'default', hint: `目标 ${summary.rateTarget} 件/时` },
    { label: '待处理积压', value: summary.backlogCount, tone: 'warn', hint: `预计完成 ${summary.estimatedFinish}` },
  ], { cols: 4 });
  const stageTable = BaseTable({
    columns: [
      { key: 'stage', label: '作业环节', width: '110px' },
      { key: 'orderCount', label: '订单数', width: '90px', align: 'right' },
      { key: 'itemCount', label: '商品件数', width: '105px', align: 'right' },
      { key: 'containerCount', label: '容器数', width: '90px', align: 'right' },
      { key: 'taskCount', label: '任务数', width: '90px', align: 'right' },
      { key: 'backlog', label: '积压', width: '90px', align: 'right' },
      { key: 'rate', label: '节拍', width: '100px' },
      { key: 'status', label: '状态', width: '100px' },
    ],
    rows: stages,
    emptyTitle: '暂无作业节拍',
    emptyDesc: '当前没有可展示的出库环节数据。',
  });
  const hourlyBars = BarRows(hourly.map((r) => ({ label: r.hour, value: r.itemCount })));
  const riskTable = BaseTable({
    columns: [
      { key: 'risk', label: '风险', width: '150px' },
      { key: 'scope', label: '影响范围', width: '150px' },
      { key: 'impact', label: '影响件数', width: '100px', align: 'right' },
      { key: 'action', label: '处置', width: '120px' },
    ],
    rows: risks,
    emptyTitle: '暂无吞吐风险',
    emptyDesc: '当前没有需要处置的吞吐风险。',
  });
  return ReportPage({
    hero,
    stats,
    blocks: [
      Block({ title: '出库链路节拍', note: `订单 ${summary.orderCount || 0} · 件数 ${summary.itemCount || 0}`, body: stageTable }),
      Block({ title: '小时件数', note: `当前节拍 ${summary.currentRate || '—'}`, body: hourlyBars || EmptyState({ title: '暂无小时数据', desc: '当前没有可展示的小时件数。' }) }),
      Block({ title: '吞吐风险', note: `风险项 ${risks.length}`, body: riskTable }),
    ],
  });
}

export const PAGE_CSS = ``;
