import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    enabled: { label: '启用', type: 'enabled' },
    disabled: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.ruleStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('enabled'), field: 'ruleStatus', value: 'enabled' },
      { label: '停用', count: count('disabled'), field: 'ruleStatus', value: 'disabled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '费用类型', key: 'feeType', type: 'text', placeholder: '请输入费用类型' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'ruleNo', label: '规则编号', width: '150px', render: (r) => dash(r.ruleNo) },
      { key: 'feeType', label: '费用类型', render: (r) => dash(r.feeType) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'warehouse', label: '仓库', render: (r) => dash(r.warehouse) },
      { key: 'mode', label: '计费方式', render: (r) => dash(r.mode) },
      { key: 'price', label: '单价', width: '100px', align: 'right', render: (r) => n(r.price) },
      { key: 'minCharge', label: '最低收费', width: '110px', align: 'right', render: (r) => n(r.minCharge) },
      { key: 'maxCharge', label: '最高收费', width: '110px', align: 'right', render: (r) => n(r.maxCharge) },
      { key: 'cycle', label: '计费周期', render: (r) => dash(r.cycle) },
      { key: 'validTo', label: '有效期至', width: '120px', render: (r) => dash(r.validTo) },
      { key: 'ruleStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.ruleStatus), toneOf(r.ruleStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.ruleStatus }),
    emptyTitle: '暂无费用规则',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
