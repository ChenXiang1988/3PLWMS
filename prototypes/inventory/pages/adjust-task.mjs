import { ListPage, StatusTag, Tag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.adjustStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待处理', count: count('pending'), field: 'adjustStatus', value: 'pending' },
      { label: '进行中', count: count('doing'), field: 'adjustStatus', value: 'doing' },
      { label: '异常待处理', count: count('exception'), field: 'adjustStatus', value: 'exception' },
      { label: '已完成', count: count('completed'), field: 'adjustStatus', value: 'completed' },
      { label: '已取消', count: count('cancelled'), field: 'adjustStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '调整单号', key: 'adjustNo', type: 'text', placeholder: '请输入调整单号' },
      { label: '调整类型', key: 'adjustType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.adjustType))], extra: true },
    ],
    toolbar: [
      { label: '批量确认', toast: '批量确认（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'adjustNo', label: '调整单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'adjustStatus', label: '调整状态', width: '108px', render: (r) => StatusTag(labelOf(r.adjustStatus), toneOf(r.adjustStatus)) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'adjustType', label: '调整类型', width: '120px', render: (r) => Tag(r.adjustType || '—', r.adjustType === '冲销' ? 'danger' : 'info') },
      { key: 'adjustQty', label: '调整数量', width: '120px', align: 'right', render: (r) => n(r.adjustQty) },
      { key: 'sourceDocNo', label: '来源单据号', width: '160px', render: (r) => dash(r.sourceDocNo) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.adjustStatus }),
    emptyTitle: '暂无库存调整任务',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
