import { ListPage, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.floorStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'floorStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'floorStatus', value: 'inactive' },
    ],
    filters: [
      { label: '楼层名称', key: 'floorName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.floorName))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'floorName', label: '楼层名称', width: '120px', cls: 'wx-col-strong', render: (r) => dash(r.floorName) },
      { key: 'skuCode', label: '商品编码', width: '160px', render: (r) => dash(r.skuCode) },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'sortNo', label: '排序', width: '120px', align: 'right', render: (r) => n(r.sortNo) },
      { key: 'floorStatus', label: '状态', width: '108px', render: (r) => StatusTag(labelOf(r.floorStatus), toneOf(r.floorStatus)) },
      { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.floorStatus }),
    emptyTitle: '暂无货源楼层',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
