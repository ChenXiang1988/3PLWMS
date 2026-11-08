import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    enabled: { label: '启用', type: 'enabled' },
    disabled: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.itemStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('enabled'), field: 'itemStatus', value: 'enabled' },
      { label: '停用', count: count('disabled'), field: 'itemStatus', value: 'disabled' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '项目名称', key: 'itemName', type: 'text', placeholder: '请输入项目名称' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'itemCode', label: '项目编码', width: '140px', render: (r) => dash(r.itemCode) },
      { key: 'itemName', label: '项目名称', render: (r) => dash(r.itemName) },
      { key: 'contractNo', label: '合同号', width: '140px', render: (r) => dash(r.contractNo) },
      { key: 'category', label: '服务类别', render: (r) => dash(r.category) },
      { key: 'unit', label: '单位', width: '80px', render: (r) => dash(r.unit) },
      { key: 'price', label: '标准价', width: '100px', align: 'right', render: (r) => n(r.price) },
      { key: 'minCharge', label: '最低收费', width: '110px', align: 'right', render: (r) => n(r.minCharge) },
      { key: 'maxCharge', label: '最高收费', width: '110px', align: 'right', render: (r) => n(r.maxCharge) },
      { key: 'cycle', label: '计费周期', render: (r) => dash(r.cycle) },
      { key: 'owner', label: '适用货主', render: (r) => dash(r.owner) },
      { key: 'warehouse', label: '适用仓库', render: (r) => dash(r.warehouse) },
      { key: 'version', label: '版本', width: '80px', render: (r) => dash(r.version) },
      { key: 'validTo', label: '有效期至', width: '120px', render: (r) => dash(r.validTo) },
      { key: 'itemStatus', label: '状态', width: '100px', render: (r) => StatusTag(labelOf(r.itemStatus), toneOf(r.itemStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.itemStatus }),
    emptyTitle: '暂无服务目录与报价',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
