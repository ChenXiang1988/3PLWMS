import {
  ListPage, StatusTag, Tag, DrawerButton, DrawerDetail, dash, uniq,
} from '../../shared/ui.mjs';

const PUBLISH_TONE = {
  未发布: 'disabled',
  待审核: 'pending',
  已发布: 'enabled',
  发布失败: 'rejected',
};

const SYNC_TONE = {
  已同步: 'enabled',
  同步中: 'info',
  同步失败: 'rejected',
};

const MATRIX = [
  { feature: '内容', web: '全量', app: '全量', wx: '精简', ali: '仅展示' },
  { feature: '商品', web: '全量', app: '全量', wx: '全量', ali: '仅展示' },
  { feature: '下单与支付', web: '全量', app: '全量', wx: '全量', ali: '不支持' },
  { feature: '售后', web: '全量', app: '全量', wx: '精简', ali: '不支持' },
  { feature: '会员', web: '全量', app: '全量', wx: '全量', ali: '精简' },
  { feature: '账号与角色', web: '同一套', app: '同一套', wx: '同一套', ali: '同一套' },
];

export function renderPage(data, ctx) {
  const sites = (data[ctx.pageKey] || {}).rows || [];
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const rows = sites.flatMap((s) => (s.channels || []).map((c) => ({
    ...c,
    rowKey: `${s.siteCode}-${c.end}`,
    siteCode: s.siteCode,
    siteName: s.siteName,
    siteType: s.siteType,
  })));

  const count = (v) => rows.filter((r) => r.status === v).length;

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r.rowKey,
    title: '多端发布详情',
    docNo: `${r.siteName} · ${r.end}`,
    status: r.status,
    statusTone: PUBLISH_TONE[r.status] || 'info',
    fields: [
      { label: '站点', value: `${r.siteName} · ${r.siteType}` },
      { label: '端', value: r.end },
      { label: '发布版本', value: r.version },
      { label: '功能覆盖', value: r.coverage },
      { label: '同步状态', value: r.sync },
      { label: '最近同步', value: r.updatedAt },
      { label: '权限一致性', value: '与其余端共用同一套账号与角色' },
      ...MATRIX.map((m) => ({
        label: `${m.feature}覆盖`,
        value: `Web ${m.web} · APP ${m.app} · 微信小程序 ${m.wx} · 支付宝小程序 ${m.ali}`,
      })),
      { label: '回滚影响', value: '四端回到上一发布版本；已产生的订单、内容与会员数据不受影响，回滚需重新审核' },
    ],
    actions: [
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
      { label: '回滚版本', ghost: true, toast: '回滚版本（原型示意）' },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '已发布', count: count('已发布'), field: 'status', value: '已发布' },
        { label: '待审核', count: count('待审核'), field: 'status', value: '待审核' },
        { label: '发布失败', count: count('发布失败'), field: 'status', value: '发布失败' },
        { label: '未发布', count: count('未发布'), field: 'status', value: '未发布' },
      ],
      filters: [
        { label: '站点', key: 'siteName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.siteName))] },
        { label: '端', key: 'end', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.end))] },
        { label: '同步状态', key: 'sync', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.sync))] },
      ],
      toolbar: [
        { label: '发布版本', primary: true, toast: '发布版本（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'siteName', label: '站点', width: '140px', cls: 'wx-col-strong' },
        { key: 'siteType', label: '站点类型', width: '108px', render: (r) => Tag(r.siteType, r.siteType === '品牌站' ? 'info' : 'default') },
        { key: 'end', label: '端', width: '120px' },
        { key: 'version', label: '发布版本', width: '100px', render: (r) => dash(r.version) },
        { key: 'status', label: '发布状态', width: '108px', render: (r) => StatusTag(r.status, PUBLISH_TONE[r.status] || 'info') },
        { key: 'coverage', label: '功能覆盖', width: '108px', render: (r) => Tag(r.coverage, r.coverage === '全量' ? 'info' : 'default') },
        { key: 'sync', label: '同步状态', width: '108px', render: (r) => StatusTag(r.sync, SYNC_TONE[r.sync] || 'info') },
        { key: 'updatedAt', label: '最近同步', width: '157px' },
        {
          key: 'action', label: '操作', width: '96px',
          render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.rowKey }),
        },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.status }),
      emptyTitle: '暂无发布记录',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    ownerOverlay: detailOverlays,
  };
}

export const PAGE_CSS = ``;
