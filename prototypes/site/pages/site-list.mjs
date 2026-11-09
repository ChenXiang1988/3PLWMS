import {
  ListPage, StatusTag, Tag, DrawerButton, DrawerDetail, FormDrawer,
  n, dash, uniq,
} from '../../shared/ui.mjs';

const STATUS_TONE = {
  草稿: 'disabled',
  营业中: 'enabled',
  已停用: 'disabled',
  已关闭: 'disabled',
};

const TYPE_TONE = {
  品牌站: 'info',
  采销站: 'default',
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (v) => rows.filter((r) => r.status === v).length;
  const published = (r) => (r.channels || []).filter((c) => c.status === '已发布').length;

  const form = FormDrawer({
    pageId,
    title: '新建站点',
    note: '站点创建后处于草稿，配置完成并首次发布后才对访客可见。',
    fields: [
      { label: '站点名称', key: 'siteName', required: true, placeholder: '请输入站点名称' },
      { label: '站点类型', key: 'siteType', type: 'select', required: true, options: ['品牌站', '采销站'] },
      { label: '主域名', key: 'domain', required: true, placeholder: '请输入主域名' },
      { label: '站点模板', key: 'template', type: 'select', options: ['编辑式', '交易版'] },
      { label: '备注', key: 'note', type: 'textarea', placeholder: '请输入备注' },
    ],
    actions: [
      { label: '取消', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '创建站点', primary: true, attrs: { 'data-form-submit': '', 'data-form-action': 'create' } },
    ],
  });

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.siteCode,
    title: '站点详情',
    docNo: r.siteCode,
    status: r.status,
    statusTone: STATUS_TONE[r.status] || 'info',
    fields: [
      { label: '站点名称', value: r.siteName },
      { label: '站点类型', value: r.siteType },
      { label: '主域名', value: r.domain },
      { label: '站点模板', value: r.template },
      { label: '已发布端', value: `${published(r)} / ${(r.channels || []).length}` },
      { label: '在售商品', value: (r.skuCodes || []).length },
      { label: '本月订单', value: r.orderCount },
      { label: '更新时间', value: r.updatedAt },
    ],
    columns: [
      { key: 'end', label: '端', width: '120px' },
      { key: 'status', label: '发布状态', width: '108px' },
      { key: 'version', label: '版本', width: '100px' },
      { key: 'sync', label: '同步状态', width: '108px' },
    ],
    rows: r.channels || [],
    actions: [{ label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
  })).join('');

  return {
    html: ListPage({
      unit: '个',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '营业中', count: count('营业中'), field: 'status', value: '营业中' },
        { label: '草稿', count: count('草稿'), field: 'status', value: '草稿' },
        { label: '已停用', count: count('已停用'), field: 'status', value: '已停用' },
      ],
      filters: [
        { label: '站点类型', key: 'siteType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteType))] },
        { label: '站点名称', key: 'siteName', type: 'text', placeholder: '请输入站点名称' },
      ],
      toolbar: [
        { label: '新建站点', primary: true, attrs: { 'data-drawer-open': pageId, 'data-drawer-key': '__new__' } },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'siteName', label: '站点名称', width: '150px', cls: 'wx-col-strong' },
        { key: 'siteType', label: '站点类型', width: '108px', render: (r) => Tag(r.siteType, TYPE_TONE[r.siteType] || 'default') },
        { key: 'domain', label: '主域名', width: '200px', render: (r) => dash(r.domain) },
        { key: 'channels', label: '承载端', width: '108px', render: (r) => `${published(r)} / ${(r.channels || []).length}` },
        { key: 'status', label: '站点状态', width: '108px', render: (r) => StatusTag(r.status, STATUS_TONE[r.status] || 'info') },
        { key: 'skuCodes', label: '商品数', width: '96px', align: 'right', render: (r) => n((r.skuCodes || []).length) },
        { key: 'orderCount', label: '本月订单', width: '108px', align: 'right', render: (r) => n(r.orderCount) },
        { key: 'updatedAt', label: '更新时间', width: '157px', render: (r) => dash(r.updatedAt) },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.siteCode }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.status }),
      emptyTitle: '暂无独立站',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay: form,
    ownerOverlay: detailOverlays,
  };
}

export const PAGE_CSS = ``;
