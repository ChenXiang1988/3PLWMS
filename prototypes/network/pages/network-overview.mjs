import { ReportHero, StatRow, Block, BaseTable, StatusTag, esc, n } from '../../shared/ui.mjs';

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

  const max = Math.max(1, ...rows.map((r) => Number(r.qty) || 0));
  const bars = rows.slice(0, 5).map((r) => {
    const pct = Math.round((Number(r.qty) || 0) / max * 100);
    return `<div class="nw-network-overview-bar">`
      + `<span class="nw-network-overview-label">${esc(r.warehouse)}</span>`
      + `<span class="nw-network-overview-track"><span class="nw-network-overview-fill" style="width:${pct}%"></span></span>`
      + `<span class="nw-network-overview-value">${n(r.qty)}</span>`
      + `</div>`;
  }).join('');
  const block2 = Block({
    title: '构成',
    note: '按仓库在库数量',
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

export const PAGE_CSS = `
.nw-network-overview-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.nw-network-overview-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nw-network-overview-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.nw-network-overview-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.nw-network-overview-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
