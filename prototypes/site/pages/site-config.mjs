import {
  ListPage, DrawerButton, FormDrawer, dash, uniq,
} from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;

  const form = FormDrawer({
    pageId,
    title: '编辑配置',
    note: '交易开关关闭后站点仅展示商品，下单与支付入口同时关闭；改动对四端同时生效。',
    fields: [
      { label: '站点', key: 'siteName', readonly: true },
      { label: '配置项', key: 'item', readonly: true },
      { label: '配置值', key: 'value', required: true, placeholder: '请输入配置值' },
      { label: '生效范围', key: 'scope', type: 'select', options: ['全端', 'Web、APP', 'Web', '微信小程序', '支付宝小程序'] },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '保存', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'save' } },
    ],
  });

  return {
    html: ListPage({
      unit: '项',
      pageSize: 20,
      statusTabs: [{ label: '全部', count: rows.length, active: true }],
      filters: [
        { label: '站点', key: 'siteName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteName))] },
        { label: '配置项', key: 'item', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.item))] },
      ],
      toolbar: [{ label: '导出', ghost: true, toast: '导出（原型示意）' }],
      showCount: true,
      columns: [
        { key: 'siteName', label: '站点', width: '150px', cls: 'wx-col-strong' },
        { key: 'item', label: '配置项', width: '150px' },
        { key: 'value', label: '当前值', render: (r) => dash(r.value) },
        { key: 'scope', label: '生效范围', width: '140px' },
        { key: 'updatedAt', label: '更新时间', width: '157px' },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '编辑', pageId, rowKey: '__new__', formRow: r.itemKey }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.item }),
      emptyTitle: '暂无配置',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: form,
  };
}

export const PAGE_CSS = ``;
