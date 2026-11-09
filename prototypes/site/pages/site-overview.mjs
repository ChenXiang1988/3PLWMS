import {
  ReportPage, ReportHero, StatRow, Block, BaseTable, BarRows, StatusTag, Tag, n,
} from '../../shared/ui.mjs';

const STATUS_TONE = {
  草稿: 'disabled',
  营业中: 'enabled',
  已停用: 'disabled',
  已关闭: 'disabled',
};

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

export function renderPage(data, ctx) {
  const sites = (data[ctx.pageKey] || {}).rows || [];
  const active = sites.filter((s) => s.status === '营业中');
  const visitors = sites.reduce((sum, s) => sum + Number(s.visitorToday || 0), 0);
  const channels = sites.flatMap((s) => (s.channels || []).map((c) => ({ ...c, siteName: s.siteName, siteCode: s.siteCode, siteType: s.siteType })));
  const pending = channels.filter((c) => c.status !== '已发布' || c.sync !== '已同步');

  const stats = StatRow([
    { label: '站点总数', value: sites.length, tone: 'default' },
    { label: '营业中', value: active.length, tone: 'ok' },
    { label: '今日访客', value: visitors, tone: 'default' },
    { label: '待发布端', value: pending.length, tone: pending.length ? 'warn' : 'default' },
  ], { cols: 4 });

  const siteTable = BaseTable({
    columns: [
      { key: 'siteName', label: '站点名称', width: '150px', cls: 'wx-col-strong' },
      { key: 'siteType', label: '站点类型', width: '108px', render: (r) => Tag(r.siteType, r.siteType === '品牌站' ? 'info' : 'default') },
      { key: 'status', label: '站点状态', width: '108px', render: (r) => StatusTag(r.status, STATUS_TONE[r.status] || 'info') },
      { key: 'domain', label: '主域名', width: '200px' },
      { key: 'skuCodes', label: '商品数', width: '96px', align: 'right', render: (r) => n((r.skuCodes || []).length) },
      { key: 'orderCount', label: '本月订单', width: '108px', align: 'right', render: (r) => n(r.orderCount) },
    ],
    rows: sites,
    emptyTitle: '暂无独立站',
    emptyDesc: '当前登录货主名下还没有站点。',
  });

  const channelTable = BaseTable({
    columns: [
      { key: 'siteName', label: '站点', width: '140px' },
      { key: 'end', label: '端', width: '120px' },
      { key: 'status', label: '发布状态', width: '108px', render: (r) => StatusTag(r.status, PUBLISH_TONE[r.status] || 'info') },
      { key: 'sync', label: '同步状态', width: '108px', render: (r) => StatusTag(r.sync, SYNC_TONE[r.sync] || 'info') },
      { key: 'version', label: '版本', width: '100px' },
      { key: 'updatedAt', label: '最近同步', width: '157px' },
    ],
    rows: pending,
    emptyTitle: '四端均已发布',
    emptyDesc: '当前没有待发布或同步异常。',
  });

  const visitorBars = BarRows(sites.map((s) => ({ label: s.siteName, value: s.visitorToday })));

  return ReportPage({
    hero: ReportHero({ title: ctx.pageName, sub: `全部站点 ${sites.length} 个 · 营业中 ${active.length} 个` }),
    stats,
    blocks: [
      Block({ title: '站点概览', note: `共 ${sites.length} 个站点`, body: siteTable }),
      Block({ title: '多端发布', note: `待处理 ${pending.length} 项`, body: channelTable }),
      Block({ title: '今日访客', note: '按站点', body: visitorBars }),
    ],
  });
}

export const PAGE_CSS = ``;
