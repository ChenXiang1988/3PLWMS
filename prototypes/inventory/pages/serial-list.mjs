import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    in: { label: '在库', type: 'enabled' },
    out: { label: '已出库', type: 'disabled' },
    frozen: { label: '已冻结', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.serialStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '在库', count: count('in'), field: 'serialStatus', value: 'in' },
      { label: '已出库', count: count('out'), field: 'serialStatus', value: 'out' },
      { label: '已冻结', count: count('frozen'), field: 'serialStatus', value: 'frozen' },
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
      { key: 'sn', label: '序列号', width: '180px', render: (r) => dash(r.sn) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'batchNo', label: '批次号', width: '130px', render: (r) => dash(r.batchNo) },
      { key: 'locationCode', label: '库位', width: '110px', render: (r) => dash(r.locationCode) },
      { key: 'serialStatus', label: '状态', width: '90px', render: (r) => StatusTag(labelOf(r.serialStatus), toneOf(r.serialStatus)) },
      { key: 'inDocNo', label: '入库单', width: '150px', render: (r) => dash(r.inDocNo) },
      { key: 'outDocNo', label: '出库单', width: '150px', render: (r) => dash(r.outDocNo) },
      { key: 'lastMoveAt', label: '最近移动', width: '157px', render: (r) => dash(r.lastMoveAt) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.serialStatus }),
    emptyTitle: '暂无序列号追踪',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
