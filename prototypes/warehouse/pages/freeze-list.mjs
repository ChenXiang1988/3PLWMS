import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    frozen: { label: '已冻结', type: 'rejected' },
    unfreezing: { label: '解冻审批中', type: 'pending' },
    unfrozen: { label: '已解冻', type: 'enabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.freezeStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '已冻结', count: count('frozen'), field: 'freezeStatus', value: 'frozen' },
      { label: '解冻审批中', count: count('unfreezing'), field: 'freezeStatus', value: 'unfreezing' },
      { label: '已解冻', count: count('unfrozen'), field: 'freezeStatus', value: 'unfrozen' },
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
      { key: 'freezeNo', label: '冻结号', width: '150px', render: (r) => dash(r.freezeNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'batchNo', label: '批次号', width: '130px', render: (r) => dash(r.batchNo) },
      { key: 'locationCode', label: '库位', width: '110px', render: (r) => dash(r.locationCode) },
      { key: 'freezeQty', label: '冻结数量', width: '110px', align: 'right', render: (r) => n(r.freezeQty) },
      { key: 'reasonType', label: '原因类型', render: (r) => dash(r.reasonType) },
      { key: 'reason', label: '原因', render: (r) => dash(r.reason) },
      { key: 'freezeStatus', label: '状态', width: '110px', render: (r) => StatusTag(labelOf(r.freezeStatus), toneOf(r.freezeStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.freezeStatus }),
    emptyTitle: '暂无冻结与解冻',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
