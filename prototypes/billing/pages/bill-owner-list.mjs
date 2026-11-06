import { ListPage, StatusTag, dash } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待确认', type: 'pending' },
  confirmed: { label: '已确认', type: 'enabled' },
  invoiced: { label: '已开票', type: 'info' },
  paid: { label: '已付款', type: 'enabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const money = (v) => (v == null || v === '' ? '—' : `￥${Number(v).toFixed(2)}`);

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.billStatus === s).length;

  return ListPage({
    unit: '单',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待确认', count: count('pending'), field: 'billStatus', value: 'pending' },
      { label: '已确认', count: count('confirmed'), field: 'billStatus', value: 'confirmed' },
      { label: '已开票', count: count('invoiced'), field: 'billStatus', value: 'invoiced' },
      { label: '已付款', count: count('paid'), field: 'billStatus', value: 'paid' },
      { label: '已取消', count: count('cancelled'), field: 'billStatus', value: 'cancelled' },
    ],
    filters: [
      { label: '账单编号', key: 'billNo', type: 'text', placeholder: '请输入账单编号' },
      { label: '账期', key: 'period', type: 'select', options: ['全部', ...Array.from(new Set(rows.map((r) => r.period)))], extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'billNo', label: '账单编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'billStatus', label: '账单状态', width: '108px', render: (r) => StatusTag(labelOf(r.billStatus), toneOf(r.billStatus)) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'period', label: '账期', width: '120px', render: (r) => dash(r.period) },
      { key: 'totalFee', label: '费用合计', width: '120px', align: 'right', render: (r) => money(r.totalFee) },
      { key: 'createTime', label: '生成时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    emptyTitle: '暂无费用账单',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
