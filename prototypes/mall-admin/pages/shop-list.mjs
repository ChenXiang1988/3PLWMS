import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '营业中', type: 'enabled' },
  inactive: { label: '已停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.shopStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '营业中', count: count('active'), field: 'shopStatus', value: 'active' },
      { label: '已停用', count: count('inactive'), field: 'shopStatus', value: 'inactive' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '主营类目', key: 'mainCategory', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.mainCategory))] },
      { label: '店铺名称', key: 'shopName', type: 'text', placeholder: '请输入店铺名称', extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'shopCode', label: '店铺编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'shopName', label: '店铺名称', render: (r) => dash(r.shopName) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'onSaleCount', label: '在售商品数', width: '120px', align: 'right', render: (r) => n(r.onSaleCount) },
      { key: 'shopScore', label: '店铺评分', width: '120px', align: 'right', render: (r) => dash(r.shopScore) },
      { key: 'shopStatus', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.shopStatus), toneOf(r.shopStatus)) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.shopStatus }),
    emptyTitle: '暂无店铺',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
