import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    pending: { label: '待理货', type: 'pending' },
    doing: { label: '理货中', type: 'info' },
    done: { label: '已完成', type: 'enabled' },
    diff: { label: '有差异', type: 'rejected' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.tallyStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待理货', count: count('pending'), field: 'tallyStatus', value: 'pending' },
      { label: '理货中', count: count('doing'), field: 'tallyStatus', value: 'doing' },
      { label: '已完成', count: count('done'), field: 'tallyStatus', value: 'done' },
      { label: '有差异', count: count('diff'), field: 'tallyStatus', value: 'diff' },
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
      { key: 'tallyNo', label: '理货号', width: '150px', render: (r) => dash(r.tallyNo) },
      { key: 'receivingNo', label: '收货单', width: '160px', render: (r) => dash(r.receivingNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'stageLocation', label: '暂存库位', width: '120px', render: (r) => dash(r.stageLocation) },
      { key: 'palletNo', label: '托盘', width: '110px', render: (r) => dash(r.palletNo) },
      { key: 'tallyQty', label: '理货数量', width: '110px', align: 'right', render: (r) => n(r.tallyQty) },
      { key: 'tallyStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.tallyStatus), toneOf(r.tallyStatus)) },
      { key: 'operator', label: '操作人', render: (r) => dash(r.operator) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.tallyStatus }),
    emptyTitle: '暂无理货任务',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
