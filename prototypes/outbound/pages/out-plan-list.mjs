import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  draft: { label: '草稿', type: 'disabled' },
  pending: { label: '待确认', type: 'pending' },
  confirmed: { label: '已生效', type: 'enabled' },
  dispatched: { label: '已分发', type: 'info' },
  closed: { label: '已关闭', type: 'disabled' },
};

const LOCK_META = {
  unlocked: { label: '未锁', type: 'disabled' },
  locked: { label: '已锁', type: 'enabled' },
  released: { label: '已释放', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const lockLabel = (s) => (LOCK_META[s] || {}).label || '—';
const lockTone = (s) => (LOCK_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.planStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待确认', count: count('pending'), field: 'planStatus', value: 'pending' },
      { label: '已生效', count: count('confirmed'), field: 'planStatus', value: 'confirmed' },
      { label: '已分发', count: count('dispatched'), field: 'planStatus', value: 'dispatched' },
      { label: '已关闭', count: count('closed'), field: 'planStatus', value: 'closed' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '目标仓库', key: 'targetWarehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.targetWarehouse))] },
      { label: '计划单号', key: 'planNo', type: 'text', placeholder: '请输入计划单号', extra: true },
      { label: '计划出库日期', key: 'expectedDate', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '生成拣货单', toast: '生成拣货单（原型示意）' },
      { label: '查看工序单', ghost: true, toast: '查看工序单（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'planNo', label: '计划单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'planStatus', label: '计划单状态', width: '108px', render: (r) => StatusTag(labelOf(r.planStatus), toneOf(r.planStatus)) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'targetWarehouse', label: '目标仓库', width: '120px', render: (r) => dash(r.targetWarehouse) },
      { key: 'expectedDate', label: '计划出库日期', width: '120px', render: (r) => dash(r.expectedDate) },
      { key: 'skuCount', label: '品类数', width: '120px', align: 'right', render: (r) => n(r.skuCount) },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'lockStatus', label: '锁库状态', width: '108px', render: (r) => StatusTag(lockLabel(r.lockStatus), lockTone(r.lockStatus)) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.planStatus }),
    emptyTitle: '暂无出库计划单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
