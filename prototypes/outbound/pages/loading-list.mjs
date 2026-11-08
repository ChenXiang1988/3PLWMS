import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待装车', type: 'pending' },
    doing: { label: '装车中', type: 'info' },
    shipped: { label: '已发运', type: 'enabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.loadingStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待装车', count: count('pending'), field: 'loadingStatus', value: 'pending' },
      { label: '装车中', count: count('doing'), field: 'loadingStatus', value: 'doing' },
      { label: '已发运', count: count('shipped'), field: 'loadingStatus', value: 'shipped' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '承运商', key: 'carrier', type: 'text', placeholder: '请输入承运商' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'loadingNo', label: '装车号', width: '150px', render: (r) => dash(r.loadingNo) },
      { key: 'carrier', label: '承运商', render: (r) => dash(r.carrier) },
      { key: 'plateNo', label: '车牌', width: '110px', render: (r) => dash(r.plateNo) },
      { key: 'dock', label: '月台', width: '80px', render: (r) => dash(r.dock) },
      { key: 'handoverNo', label: '交接单', width: '150px', render: (r) => dash(r.handoverNo) },
      { key: 'packageCount', label: '件数', width: '90px', align: 'right', render: (r) => n(r.packageCount) },
      { key: 'weight', label: '重量', width: '100px', align: 'right', render: (r) => n(r.weight) },
      { key: 'loadedAt', label: '装车时间', width: '157px', render: (r) => dash(r.loadedAt) },
      { key: 'loadingStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.loadingStatus), toneOf(r.loadingStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.loadingStatus }),
    emptyTitle: '暂无装车发运',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
