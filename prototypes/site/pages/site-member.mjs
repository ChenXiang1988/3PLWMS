import {
  ListPage, StatusTag, Tag, DrawerButton, FormDrawer, dash, uniq,
} from '../../shared/ui.mjs';

const ROLE_TONE = {
  站长: 'info',
  运营: 'info',
  内容: 'default',
  客服: 'default',
  财务: 'info',
  只读: 'default',
};

const STATUS_TONE = {
  启用: 'enabled',
  停用: 'disabled',
};

const PERMISSIONS = ['查看', '编辑', '发布', '退款', '导出'];

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (v) => rows.filter((r) => r.status === v).length;
  const sites = uniq(rows.map((r) => r.siteName));

  const inviteForm = FormDrawer({
    pageId,
    title: '邀请成员',
    note: '成员只能访问被授予的站点；权限变更在四端同时生效。',
    fields: [
      { label: '成员姓名', key: 'member', required: true, placeholder: '请输入成员姓名' },
      { label: '登录账号', key: 'account', required: true, placeholder: '请输入登录账号' },
      { label: '所属站点', key: 'siteName', type: 'select', required: true, options: sites },
      { label: '成员角色', key: 'role', type: 'select', required: true, options: ['站长', '运营', '内容', '客服', '财务', '只读'] },
      { label: '数据范围', key: 'scope', readonly: true, value: '本站点' },
      { label: '权限点', key: 'permissions', type: 'checks', options: PERMISSIONS },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '发送邀请', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'invite' } },
    ],
  });

  const editForm = FormDrawer({
    pageId,
    rowKey: '__edit__',
    title: '成员与权限',
    note: '停用后该账号立即失去本站点全部权限，历史操作记录保留。',
    fields: [
      { label: '成员姓名', key: 'member', readonly: true },
      { label: '登录账号', key: 'account', readonly: true },
      { label: '所属站点', key: 'siteName', readonly: true },
      { label: '成员角色', key: 'role', type: 'select', options: ['站长', '运营', '内容', '客服', '财务', '只读'] },
      { label: '成员状态', key: 'status', type: 'select', options: ['启用', '停用'] },
      { label: '权限点', key: 'permissions', type: 'checks', options: PERMISSIONS },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '停用成员', ghost: true, attrs: { 'data-form-action': 'disable' } },
      { label: '保存', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'save' } },
    ],
  });

  return {
    html: ListPage({
      unit: '人',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '启用', count: count('启用'), field: 'status', value: '启用' },
        { label: '停用', count: count('停用'), field: 'status', value: '停用' },
      ],
      filters: [
        { label: '站点', key: 'siteName', type: 'select', options: ['全部', ...sites] },
        { label: '成员角色', key: 'role', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.role))] },
        { label: '登录账号', key: 'account', type: 'text', placeholder: '请输入登录账号' },
      ],
      toolbar: [
        { label: '邀请成员', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__new__' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'member', label: '成员', width: '110px', cls: 'wx-col-strong' },
        { key: 'account', label: '登录账号', width: '180px' },
        { key: 'siteName', label: '所属站点', width: '140px' },
        { key: 'role', label: '成员角色', width: '108px', render: (r) => Tag(r.role, ROLE_TONE[r.role] || 'default') },
        { key: 'scope', label: '数据范围', width: '108px' },
        { key: 'status', label: '成员状态', width: '108px', render: (r) => StatusTag(r.status, STATUS_TONE[r.status] || 'info') },
        { key: 'lastLogin', label: '最近登录', width: '157px', render: (r) => dash(r.lastLogin) },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '编辑', pageId, rowKey: '__edit__', formRow: r.account }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.status }),
      emptyTitle: '暂无成员',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: inviteForm + editForm,
  };
}

export const PAGE_CSS = ``;
