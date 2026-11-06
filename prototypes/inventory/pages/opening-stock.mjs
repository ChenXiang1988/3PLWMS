import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

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
  const count = (s) => rows.filter((r) => r.importStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待处理', count: count('pending'), field: 'importStatus', value: 'pending' },
      { label: '进行中', count: count('doing'), field: 'importStatus', value: 'doing' },
      { label: '异常待处理', count: count('exception'), field: 'importStatus', value: 'exception' },
      { label: '已完成', count: count('completed'), field: 'importStatus', value: 'completed' },
      { label: '已取消', count: count('cancelled'), field: 'importStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '导入批次号', key: 'importNo', type: 'text', placeholder: '请输入导入批次号' },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码', extra: true },
    ],
    toolbar: [
      { label: '导入', ghost: true, toast: '导入（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'importNo', label: '导入批次号', width: '160px', cls: 'wx-col-strong' },
      { key: 'importStatus', label: '导入状态', width: '108px', render: (r) => StatusTag(labelOf(r.importStatus), toneOf(r.importStatus)) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'batchNo', label: '批次号', width: '160px', render: (r) => dash(r.batchNo) },
      { key: 'binCode', label: '库位编码', width: '120px', render: (r) => dash(r.binCode) },
      { key: 'initQty', label: '初始数量', width: '120px', align: 'right', render: (r) => n(r.initQty) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.importStatus }),
    emptyTitle: '暂无初始库存',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
