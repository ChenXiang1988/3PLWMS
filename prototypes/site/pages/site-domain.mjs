import {
  ListPage, StatusTag, DrawerButton, FormDrawer, dash, uniq,
} from '../../shared/ui.mjs';

const RESOLVE_TONE = {
  已生效: 'enabled',
  待解析: 'pending',
  解析异常: 'rejected',
};

const CERT_TONE = {
  有效: 'enabled',
  即将到期: 'pending',
  已过期: 'rejected',
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (v) => rows.filter((r) => r.cert === v).length;

  const form = FormDrawer({
    pageId,
    title: '域名与证书',
    note: '解绑域名后该域名立即停止解析，已发布页面不可访问，且 24 小时内不能重新绑定。',
    fields: [
      { label: '域名', key: 'domain', readonly: true },
      { label: '绑定站点', key: 'siteName', readonly: true },
      { label: '绑定端', key: 'end', type: 'select', options: ['Web', 'APP', '微信小程序', '支付宝小程序'] },
      { label: '证书到期日', key: 'expireAt', type: 'date' },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '解绑域名', ghost: true, attrs: { 'data-form-action': 'unbind' } },
      { label: '保存', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'save' } },
    ],
  });

  const addForm = FormDrawer({
    pageId,
    rowKey: '__add__',
    title: '添加域名',
    note: '域名解析生效后才能发布到对应端。',
    fields: [
      { label: '域名', key: 'domain', required: true, placeholder: '请输入域名' },
      { label: '绑定站点', key: 'siteName', type: 'select', required: true, options: uniq(rows.map((r) => r.siteName)) },
      { label: '绑定端', key: 'end', type: 'select', required: true, options: ['Web', 'APP', '微信小程序', '支付宝小程序'] },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '添加', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'create' } },
    ],
  });

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '有效', count: count('有效'), field: 'cert', value: '有效' },
        { label: '即将到期', count: count('即将到期'), field: 'cert', value: '即将到期' },
        { label: '已过期', count: count('已过期'), field: 'cert', value: '已过期' },
      ],
      filters: [
        { label: '站点', key: 'siteName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteName))] },
        { label: '端', key: 'end', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.end))] },
        { label: '域名', key: 'domain', type: 'text', placeholder: '请输入域名' },
      ],
      toolbar: [
        { label: '添加域名', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__add__' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'domain', label: '域名', width: '200px', cls: 'wx-col-strong' },
        { key: 'siteName', label: '绑定站点', width: '140px' },
        { key: 'end', label: '绑定端', width: '120px' },
        { key: 'resolve', label: '解析状态', width: '108px', render: (r) => StatusTag(r.resolve, RESOLVE_TONE[r.resolve] || 'info') },
        { key: 'cert', label: '证书状态', width: '108px', render: (r) => StatusTag(r.cert, CERT_TONE[r.cert] || 'info') },
        { key: 'expireAt', label: '到期时间', width: '120px', render: (r) => dash(r.expireAt) },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '管理', pageId, rowKey: '__new__', formRow: r.domain }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.cert }),
      emptyTitle: '暂无域名',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: form + addForm,
  };
}

export const PAGE_CSS = ``;
