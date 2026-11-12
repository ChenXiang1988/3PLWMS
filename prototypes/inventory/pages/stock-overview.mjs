import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { summary = {}, ownerRows = [], riskRows = [], statusRows = [] } = data[ctx.pageKey] || {};
  const hero = ReportHero({ title: ctx.pageName, sub: `${summary.snapshotTime || '—'} · ${summary.warehouseName || '—'}` });
  const stats = StatRow([
    { label: '实物量', value: summary.onHandQty, tone: 'default', hint: `SKU ${summary.skuCount}` },
    { label: '可用量', value: summary.availableQty, tone: 'ok', hint: `可承诺 ${summary.commitableQty}` },
    { label: '作业占用', value: summary.occupiedQty, tone: 'default', hint: `承诺 ${summary.committedQty} · 分配 ${summary.allocatedQty}` },
    { label: '风险量', value: summary.riskQty, tone: 'warn', hint: `冻结 ${summary.frozenQty} · 差异 ${summary.diffQty}` },
  ], { cols: 4 });
  const ownerTable = BaseTable({
    columns: [
      { key: 'owner', label: '货主', width: '110px' },
      { key: 'skuCount', label: 'SKU数', width: '80px', align: 'right' },
      { key: 'onHandQty', label: '实物量', width: '110px', align: 'right' },
      { key: 'availableQty', label: '可用量', width: '110px', align: 'right' },
      { key: 'occupiedQty', label: '作业占用', width: '110px', align: 'right' },
      { key: 'diffQty', label: '差异量', width: '90px', align: 'right' },
      { key: 'risk', label: '风险', width: '90px' },
    ],
    rows: ownerRows,
    emptyTitle: '暂无货主库存',
    emptyDesc: '当前没有可展示的库存聚合记录。',
  });
  const riskTable = BaseTable({
    columns: [
      { key: 'owner', label: '货主', width: '110px' },
      { key: 'skuCode', label: '商品编码', width: '130px' },
      { key: 'binCode', label: '库位', width: '110px' },
      { key: 'riskType', label: '风险类型', width: '105px' },
      { key: 'qty', label: '数量', width: '90px', align: 'right' },
      { key: 'action', label: '处置', width: '120px' },
    ],
    rows: riskRows,
    emptyTitle: '暂无库存风险',
    emptyDesc: '当前没有需要处置的库存风险。',
  });
  const statusBars = BarRows(statusRows.map((r) => ({ label: r.label, value: r.value })));
  return ReportPage({
    hero,
    stats,
    blocks: [
      Block({ title: '货主库存构成', note: `货主 ${ownerRows.length}`, body: ownerTable }),
      Block({ title: '库存状态分解', note: `实物量 ${summary.onHandQty || 0}`, body: statusBars || EmptyState({ title: '暂无库存状态', desc: '当前没有可展示的库存状态。' }) }),
      Block({ title: '库存风险', note: `风险项 ${riskRows.length}`, body: riskTable }),
    ],
  });
}

export const PAGE_CSS = ``;
