import { ListPage, StatusTag, dash, uniq, moneyOrDash as money } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.rateStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'rateStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'rateStatus', value: 'inactive' },
    ],
    filters: [
      { label: '费用项目', key: 'feeItem', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.feeItem))] },
      { label: '计费方式', key: 'chargeMode', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.chargeMode))], extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'rateCode', label: '规则编号', width: '160px', cls: 'wx-col-strong' },
      { key: 'feeItem', label: '费用项目', width: '120px', render: (r) => dash(r.feeItem) },
      { key: 'chargeMode', label: '计费方式', width: '120px', render: (r) => dash(r.chargeMode) },
      { key: 'price', label: '单价', width: '120px', align: 'right', render: (r) => money(r.price) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'effectDate', label: '生效日期', width: '120px', render: (r) => dash(r.effectDate) },
      { key: 'rateStatus', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.rateStatus), toneOf(r.rateStatus)) },
    ],
    rows,
    emptyTitle: '暂无费用规则',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
