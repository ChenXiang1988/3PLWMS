import { ListPage, StatusTag, dash, n, uniq } from '../../01 shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.status === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待处理', count: count('pending'), field: 'status', value: 'pending' },
      { label: '进行中', count: count('doing'), field: 'status', value: 'doing' },
      { label: '异常待处理', count: count('exception'), field: 'status', value: 'exception' },
      { label: '已完成', count: count('completed'), field: 'status', value: 'completed' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '调出仓库', key: 'fromWarehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.fromWarehouse))] },
      { label: '调入仓库', key: 'toWarehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.toWarehouse))] },
      { label: '调拨单号', key: 'transferNo', type: 'text', placeholder: '请输入调拨单号' },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
      { label: '批量确认', ghost: true, toast: '批量确认（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'transferNo', label: '调拨单号', width: '160px', cls: 'wx-col-strong' },
      { key: 'status', label: '单据状态', width: '108px', render: (r) => StatusTag((STATUS_META[r.status] || {}).label || '—', (STATUS_META[r.status] || {}).type || 'info') },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'fromWarehouse', label: '调出仓库', width: '120px', render: (r) => dash(r.fromWarehouse) },
      { key: 'toWarehouse', label: '调入仓库', width: '120px', render: (r) => dash(r.toWarehouse) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.status }),
    emptyTitle: '暂无调拨单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
