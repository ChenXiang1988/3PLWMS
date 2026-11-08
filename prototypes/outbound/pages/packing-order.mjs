import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待打包', type: 'pending' },
    doing: { label: '打包中', type: 'info' },
    done: { label: '已打包', type: 'enabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.packingStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待打包', count: count('pending'), field: 'packingStatus', value: 'pending' },
      { label: '打包中', count: count('doing'), field: 'packingStatus', value: 'doing' },
      { label: '已打包', count: count('done'), field: 'packingStatus', value: 'done' },
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
      { key: 'packingNo', label: '打包号', width: '150px', render: (r) => dash(r.packingNo) },
      { key: 'obNo', label: '出库订单', width: '160px', render: (r) => dash(r.obNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'cartonNo', label: '箱号', width: '110px', render: (r) => dash(r.cartonNo) },
      { key: 'boxType', label: '箱型', width: '80px', render: (r) => dash(r.boxType) },
      { key: 'boxCount', label: '箱数', width: '80px', align: 'right', render: (r) => n(r.boxCount) },
      { key: 'weight', label: '重量', width: '90px', align: 'right', render: (r) => n(r.weight) },
      { key: 'volume', label: '体积', width: '90px', align: 'right', render: (r) => n(r.volume) },
      { key: 'packer', label: '打包人', render: (r) => dash(r.packer) },
      { key: 'packingStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.packingStatus), toneOf(r.packingStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.packingStatus }),
    emptyTitle: '暂无打包单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
