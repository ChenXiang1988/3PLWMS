import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [], summary = {} } = data[ctx.pageKey] || {};
  const hero = ReportHero({ title: ctx.pageName, sub: '' });
  const stats = StatRow([
    { label: '实物量', value: summary.onHandQty, tone: 'default', hint: '当前部署仓' },
    { label: '可用量', value: summary.availableQty, tone: 'ok', hint: `可承诺 ${summary.commitableQty}` },
    { label: '已分配', value: summary.allocatedQty, tone: 'default', hint: `拣选中 ${summary.pickingQty}` },
    { label: '冻结/质检', value: Number(summary.frozenQty || 0) + Number(summary.qualityQty || 0), tone: 'warn', hint: `差异 ${summary.diffQty}` },
  ], { cols: 4 });
  const detail = BaseTable({ columns: [{ key: 'owner', label: '货主', width: '110px' }, { key: 'skuCount', label: 'SKU数', width: '90px', align: 'right' }, { key: 'onHandQty', label: '实物量', width: '120px', align: 'right' }, { key: 'availableQty', label: '可用量', width: '120px', align: 'right' }, { key: 'committedQty', label: '已承诺', width: '120px', align: 'right' }, { key: 'allocatedQty', label: '已分配', width: '120px', align: 'right' }, { key: 'diffQty', label: '差异量', width: '100px', align: 'right' }], rows, emptyTitle: '暂无数据', emptyDesc: '当前筛选条件下没有任何记录。' });
  const block1 = Block({ title: '货主库存构成', note: `共 ${rows.length} 个货主`, body: detail });
  const bars = BarRows((data[ctx.pageKey]?.statusRows || []).map((r) => ({ label: r.label, value: r.value })));
  const block2 = Block({ title: '库存状态分解', note: '实物量按状态拆分', body: bars || EmptyState({ title: '暂无数据', desc: '当前没有可展示的库存状态。' }) });
  return ReportPage({ hero, stats, blocks: [block1, block2] });
}
export const PAGE_CSS = ``;
