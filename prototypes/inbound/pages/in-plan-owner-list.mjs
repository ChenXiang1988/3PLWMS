import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  draft: { label: '草稿', type: 'disabled' },
  pending: { label: '待确认', type: 'pending' },
  confirmed: { label: '已生效', type: 'enabled' },
  dispatched: { label: '已分发', type: 'info' },
  closed: { label: '已关闭', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.planStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '草稿', count: count('draft'), field: 'planStatus', value: 'draft' },
      { label: '待确认', count: count('pending'), field: 'planStatus', value: 'pending' },
      { label: '已生效', count: count('confirmed'), field: 'planStatus', value: 'confirmed' },
      { label: '已分发', count: count('dispatched'), field: 'planStatus', value: 'dispatched' },
      { label: '已关闭', count: count('closed'), field: 'planStatus', value: 'closed' },
    ],
    filters: [
      { label: '入库类型', key: 'bizType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bizType))] },
      { label: '目标仓库', key: 'targetWarehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.targetWarehouse))] },
      { label: '计划单号', key: 'planNo', type: 'text', placeholder: '请输入计划单号', extra: true },
      { label: '计划到货日期', key: 'expectedDate', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '新建', toast: '新建（原型示意）' },
      { label: '提交', ghost: true, toast: '提交（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'planNo', label: '计划单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'planStatus', label: '计划单状态', width: '108px', render: (r) => StatusTag(labelOf(r.planStatus), toneOf(r.planStatus)) },
      { key: 'bizType', label: '入库类型', width: '120px', render: (r) => dash(r.bizType) },
      { key: 'targetWarehouse', label: '目标仓库', width: '120px', render: (r) => dash(r.targetWarehouse) },
      { key: 'expectedDate', label: '计划到货日期', width: '120px', render: (r) => dash(r.expectedDate) },
      { key: 'skuCount', label: '品类数', width: '120px', align: 'right', render: (r) => n(r.skuCount) },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.planStatus }),
    emptyTitle: '暂无入库计划单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
