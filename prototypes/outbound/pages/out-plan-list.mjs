import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' }, doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' }, completed: { label: '已完成', type: 'disabled' }, cancelled: { label: '已取消', type: 'disabled' },
};
const LOCK_META = { unlocked: { label: '未锁', type: 'disabled' }, locked: { label: '已锁', type: 'enabled' }, released: { label: '已释放', type: 'disabled' } };
const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const lockLabel = (s) => (LOCK_META[s] || {}).label || '—';
const lockTone = (s) => (LOCK_META[s] || {}).type || 'info';
const allocationLabel = (s) => ({ unallocated: '未分配', partial: '部分分配', allocated: '已分配', shortage: '缺货' }[s] || '—');

export function renderPage(data, ctx) {
  const { rows = [], details = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.docStatus === s).length;
  const overlay = rows.map((r) => {
    const d = details.find((x) => x.planNo === r.planNo) || {};
    return DrawerDetail({
      pageId, rowKey: r.planNo, title: '出库订单与库存分配', docNo: r.planNo,
      status: labelOf(r.docStatus), statusTone: toneOf(r.docStatus),
      fields: [
        { label: '货主', value: r.owner }, { label: '来源单据', value: r.sourceDocType },
        { label: '承诺时间', value: r.commitAt || r.expectedDate }, { label: '分配状态', value: allocationLabel(r.allocationStatus) },
        { label: '已分配件数', value: n(r.allocatedQty) }, { label: '已锁定件数', value: n(r.lockedQty) },
        { label: '缺货数量', value: n(r.shortageQty) }, { label: '波次号', value: r.waveNo },
        { label: '当前工序', value: r.currentStep }, { label: '锁库状态', value: lockLabel(r.lockStatus) },
        { label: '库存可信度', value: r.stockConfidence }, { label: '释放影响', value: r.releaseImpact },
      ],
      columns: [
        { key: 'skuCode', label: '商品编码', width: '150px', cls: 'wx-col-strong' },
        { key: 'skuName', label: '商品名称', render: (x) => dash(x.skuName) },
        { key: 'batchNo', label: '批次/库位', width: '170px', render: (x) => dash([x.batchNo, x.binCode].filter(Boolean).join(' / ')) },
        { key: 'planQty', label: '计划', width: '80px', align: 'right', render: (x) => n(x.planQty) },
        { key: 'allocatedQty', label: '已分配', width: '80px', align: 'right', render: (x) => n(x.allocatedQty) },
      ], rows: d.rows || [],
      timeline: (d.timeline || []).map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
      actions: [
        { label: '重新分配', toast: `已打开 ${r.planNo} 重新分配（原型示意）` },
        { label: '释放锁定', ghost: true, toast: `已打开 ${r.planNo} 锁定释放确认（原型示意）` },
        { label: '生成拣货单', ghost: true, toast: '生成拣货单（原型示意）' },
        { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
      ],
    });
  }).join('');

  return { html: ListPage({
    unit: '单', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'docStatus', value }))],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '分配状态', key: 'allocationStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => allocationLabel(r.allocationStatus)).filter((v) => v !== '—'))] },
      { label: '锁库状态', key: 'lockStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => lockLabel(r.lockStatus)).filter((v) => v !== '—'))] },
      { label: '波次号', key: 'waveNo', type: 'text', placeholder: '请输入波次号', extra: true },
      { label: '承诺时间', key: 'commitAt', type: 'daterange', extra: true },
      { label: '计划单号', key: 'planNo', type: 'text', placeholder: '请输入计划单号', extra: true },
    ],
    toolbar: [
      { label: '分配库存', toast: '已打开库存分配确认（原型示意）' },
      { label: '加入波次', ghost: true, toast: '已打开加入波次确认（原型示意）' },
      { label: '释放锁定', ghost: true, toast: '已打开锁定释放确认（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    columns: [
      { key: 'planNo', label: '计划单号', width: '160px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.planNo, label: r.planNo }) },
      { key: 'docStatus', label: '单据状态', width: '105px', render: (r) => StatusTag(labelOf(r.docStatus), toneOf(r.docStatus)) },
      { key: 'owner', label: '货主', width: '110px', render: (r) => dash(r.owner) },
      { key: 'commitAt', label: '承诺时间', width: '120px', render: (r) => dash(r.commitAt || r.expectedDate) },
      { key: 'allocationStatus', label: '分配状态', width: '100px', render: (r) => dash(allocationLabel(r.allocationStatus)) },
      { key: 'planQty', label: '计划件数', width: '95px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'allocatedQty', label: '已分配', width: '90px', align: 'right', render: (r) => n(r.allocatedQty) },
      { key: 'shortageQty', label: '缺货数', width: '80px', align: 'right', render: (r) => n(r.shortageQty) },
      { key: 'waveNo', label: '波次号', width: '145px', render: (r) => dash(r.waveNo) },
      { key: 'lockStatus', label: '锁库状态', width: '100px', render: (r) => StatusTag(lockLabel(r.lockStatus), lockTone(r.lockStatus)) },
    ],
    rows, rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.docStatus }), emptyTitle: '暂无出库订单', emptyDesc: '目标仓尚无已分发的出库单据。',
  }), overlay };
}
export const PAGE_CSS = ``;
