import { ReportHero, StatRow, Block, BaseTable, StatusTag, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

export const STATUS_META = {
  preparing: { label: '筹建中', type: 'pending' },
  active: { label: '启用', type: 'enabled' },
  disabled: { label: '停用', type: 'disabled' },
  closed: { label: '关闭', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);
  const tone = (r) => (STATUS_META[r.warehouseStatus] || {}).type || 'info';
  const label = (r) => (STATUS_META[r.warehouseStatus] || {}).label || '—';

  const hero = ReportHero({ title: ctx.pageName, sub: '' });
  const stats = StatRow([
    { label: '在库数量', value: sum('qty') },
    { label: '今日入库量', value: sum('inboundQty') },
    { label: '今日出库量', value: sum('outboundQty') },
    { label: '库位数', value: sum('binCount') },
  ], { cols: 4 });

  const detail = BaseTable({
    columns: [
      { key: 'warehouse', label: '仓库', width: '120px' },
      { key: 'warehouseStatus', label: '仓库状态', width: '108px', render: (r) => StatusTag(label(r), tone(r)) },
      { key: 'binCount', label: '库位数', width: '120px', align: 'right' },
      { key: 'usedBin', label: '已用库位', width: '120px', align: 'right' },
      { key: 'qty', label: '在库数量', width: '120px', align: 'right' },
      { key: 'inboundQty', label: '今日入库量', width: '120px', align: 'right' },
      { key: 'outboundQty', label: '今日出库量', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });

  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.warehouse, value: r.qty })));
  const block2 = Block({
    title: '构成',
    note: '按仓库在库数量',
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [block1, block2] });
}

export const PAGE_CSS = ``;
