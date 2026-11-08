import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    active: { label: '可用', type: 'enabled' },
    locked: { label: '锁定', type: 'pending' },
    frozen: { label: '冻结', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.locationStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '可用', count: count('active'), field: 'locationStatus', value: 'active' },
      { label: '锁定', count: count('locked'), field: 'locationStatus', value: 'locked' },
      { label: '冻结', count: count('frozen'), field: 'locationStatus', value: 'frozen' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'locationCode', label: '库位编码', width: '130px', render: (r) => dash(r.locationCode) },
      { key: 'maxVolume', label: '最大容积', width: '110px', align: 'right', render: (r) => n(r.maxVolume) },
      { key: 'maxWeight', label: '最大承重', width: '110px', align: 'right', render: (r) => n(r.maxWeight) },
      { key: 'abcClass', label: 'ABC 分类', width: '90px', render: (r) => dash(r.abcClass) },
      { key: 'currentVolume', label: '当前占用', width: '110px', align: 'right', render: (r) => n(r.currentVolume) },
      { key: 'usageRate', label: '使用率', width: '100px', align: 'right', render: (r) => dash(r.usageRate) },
      { key: 'locationStatus', label: '状态', width: '90px', render: (r) => StatusTag(labelOf(r.locationStatus), toneOf(r.locationStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.locationStatus }),
    emptyTitle: '暂无库位容量与 ABC',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
