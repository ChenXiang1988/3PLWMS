import {
  ListPage, StatusTag, DrawerButton, FormDrawer, dash, uniq,
} from '../../shared/ui.mjs';

const STATUS_TONE = {
  草稿: 'disabled',
  待发布: 'pending',
  已发布: 'enabled',
  已下线: 'disabled',
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (v) => rows.filter((r) => r.status === v).length;
  const sites = uniq(rows.map((r) => r.siteName));

  const form = FormDrawer({
    pageId,
    title: '新建内容',
    note: '内容发布后四端同步更新；已下线内容保留历史版本，可重新发布。',
    fields: [
      { label: '内容标题', key: 'title', required: true, placeholder: '请输入内容标题' },
      { label: '所属站点', key: 'siteName', type: 'select', required: true, options: sites },
      { label: '栏目', key: 'columnName', type: 'select', required: true, options: ['首页', '品牌故事', '门店网点', '站点商品'] },
      { label: '内容类型', key: 'contentType', type: 'select', required: true, options: ['页面', '图文', '轮播'] },
      { label: '摘要', key: 'summary', type: 'textarea', placeholder: '请输入摘要' },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '保存草稿', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'save' } },
    ],
  });

  const editForm = FormDrawer({
    pageId,
    rowKey: '__edit__',
    title: '编辑内容',
    note: '已发布内容修改后需重新发布才会出现在四端。',
    fields: [
      { label: '内容标题', key: 'title', required: true },
      { label: '所属站点', key: 'siteName', readonly: true },
      { label: '栏目', key: 'columnName', readonly: true },
      { label: '内容状态', key: 'status', readonly: true },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '保存并发布', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'publish' } },
    ],
  });

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '草稿', count: count('草稿'), field: 'status', value: '草稿' },
        { label: '待发布', count: count('待发布'), field: 'status', value: '待发布' },
        { label: '已发布', count: count('已发布'), field: 'status', value: '已发布' },
        { label: '已下线', count: count('已下线'), field: 'status', value: '已下线' },
      ],
      filters: [
        { label: '站点', key: 'siteName', type: 'select', options: ['全部', ...sites] },
        { label: '栏目', key: 'columnName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.columnName))] },
        { label: '内容类型', key: 'contentType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.contentType))] },
      ],
      toolbar: [
        { label: '新建内容', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__new__' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'title', label: '内容标题', cls: 'wx-col-strong' },
        { key: 'siteName', label: '所属站点', width: '140px' },
        { key: 'columnName', label: '栏目', width: '120px' },
        { key: 'contentType', label: '内容类型', width: '108px' },
        { key: 'status', label: '内容状态', width: '108px', render: (r) => StatusTag(r.status, STATUS_TONE[r.status] || 'info') },
        { key: 'publisher', label: '发布人', width: '100px', render: (r) => dash(r.publisher) },
        { key: 'publishAt', label: '发布时间', width: '157px', render: (r) => dash(r.publishAt) },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '编辑', pageId, rowKey: '__edit__', formRow: r.title }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.status }),
      emptyTitle: '暂无内容',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: form + editForm,
  };
}

export const PAGE_CSS = ``;
