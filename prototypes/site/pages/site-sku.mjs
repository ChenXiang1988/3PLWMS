import {
  ListPage, StatusTag, FormDrawer, DrawerButton, money, n, dash, uniq,
} from '../../shared/ui.mjs';

const STATUS_TONE = {
  在售: 'enabled',
  待上架: 'pending',
  已下架: 'disabled',
};

const STATUS_META = {
  在售: { label: '在售', tone: 'enabled' },
  待上架: { label: '待上架', tone: 'pending' },
  已下架: { label: '已下架', tone: 'disabled' },
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (v) => rows.filter((r) => r.status === v).length;

  const columns = [
    { key: 'skuCode', label: '商品编码', width: '150px', type: 'text' },
    { key: 'skuName', label: '商品名称', type: 'text' },
    { key: 'siteName', label: '所属站点', width: '140px', type: 'text' },
    { key: 'siteType', label: '站点类型', width: '108px', type: 'tag' },
    { key: 'price', label: '售价', width: '108px', type: 'money', align: 'right', render: (r) => money(r.price) },
    { key: 'stock', label: '可售库存', width: '108px', type: 'num', align: 'right', render: (r) => n(r.stock) },
    {
      key: 'status', label: '上架状态', width: '108px', type: 'status',
      render: (r) => StatusTag(r.status, STATUS_TONE[r.status] || 'info'),
    },
    { key: 'updatedAt', label: '更新时间', width: '157px', type: 'text', render: (r) => dash(r.updatedAt) },
    {
      key: 'action', label: '操作', width: '108px', type: 'action', button: '调整上架',
      render: (r) => DrawerButton({ label: '调整上架', pageId, rowKey: '__new__', formRow: r.rowKey }),
    },
  ];

  const form = FormDrawer({
    pageId,
    title: '调整上架',
    note: '下架后该商品在四端同时停止展示；已提交订单不受影响。',
    fields: [
      { label: '商品编码', key: 'skuCode', readonly: true },
      { label: '商品名称', key: 'skuName', readonly: true },
      { label: '所属站点', key: 'siteName', readonly: true },
      { label: '售价', key: 'price', type: 'number', required: true },
      { label: '可售库存', key: 'stock', type: 'number', required: true },
      { label: '上架状态', key: 'status', type: 'select', required: true, options: ['在售', '待上架', '已下架'] },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '上架', ghost: true, attrs: { 'data-form-action': 'on' } },
      { label: '下架', ghost: true, attrs: { 'data-form-action': 'off' } },
      { label: '保存', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'save' } },
    ],
  });

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '在售', count: count('在售'), field: 'status', value: '在售' },
        { label: '待上架', count: count('待上架'), field: 'status', value: '待上架' },
        { label: '已下架', count: count('已下架'), field: 'status', value: '已下架' },
      ],
      filters: [
        { label: '所属站点', key: 'siteName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteName))] },
        { label: '站点类型', key: 'siteType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteType))] },
        { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      ],
      toolbar: [
        { label: '添加商品', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__new__' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.status }),
      emptyTitle: '暂无站点商品',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: {
        keyField: 'rowKey',
        statusField: 'status',
        storageKey: ctx.pageKey,
        statusMeta: STATUS_META,
        columns,
        actionStatus: { on: '在售', off: '已下架' },
      },
    }),
    overlay: form,
  };
}

export const PAGE_CSS = ``;
