import { ListPage, StatusTag, dash, uniq } from '../../01 shared/ui.mjs';

export const STATUS_META = {
  idle: { label: '空闲', type: 'info' },
  busy: { label: '在用', type: 'enabled' },
  repairing: { label: '维修', type: 'pending' },
  scrapped: { label: '报废', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.containerStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '空闲', count: count('idle'), field: 'containerStatus', value: 'idle' },
      { label: '在用', count: count('busy'), field: 'containerStatus', value: 'busy' },
      { label: '维修', count: count('repairing'), field: 'containerStatus', value: 'repairing' },
      { label: '报废', count: count('scrapped'), field: 'containerStatus', value: 'scrapped' },
    ],
    filters: [
      { label: '容器类型', key: 'containerType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.containerType))] },
      { label: '容器状态', key: 'containerStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.containerStatus))] },
      { label: '所属仓库', key: 'warehouse', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.warehouse))] },
      { label: '归属货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导入', ghost: true, toast: '导入（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
      { label: '停用', ghost: true, toast: '停用（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'containerCode', label: '容器编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'containerType', label: '容器类型', render: (r) => dash(r.containerType) },
      { key: 'spec', label: '规格', render: (r) => dash(r.spec) },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'containerStatus', label: '容器状态', width: '108px', render: (r) => StatusTag((STATUS_META[r.containerStatus] || {}).label || '—', (STATUS_META[r.containerStatus] || {}).type || 'info') },
      { key: 'owner', label: '归属货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'purchaseDate', label: '购置日期', width: '157px', render: (r) => dash(r.purchaseDate) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.containerStatus }),
    emptyTitle: '暂无容器',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
