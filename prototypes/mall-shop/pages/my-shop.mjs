import { ReportHero, StatRow, Block, BaseTable, StatusTag, ReportPage, esc, n } from '../../shared/ui.mjs';

const CERT_META = {
  unverified: { label: '未认证', tone: 'disabled' },
  pendingReview: { label: '待审核', tone: 'pending' },
  approved: { label: '已通过', tone: 'enabled' },
  rejectedReview: { label: '已驳回', tone: 'rejected' },
  withdrawn: { label: '已撤回', tone: 'disabled' },
};

export function renderPage(data, ctx) {
  const rows = (data[ctx.pageKey] || {}).rows || [];
  const shop = rows[0] || {};
  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  if (!shop.shopCode) {
    const cert = CERT_META[shop.certStatus] || CERT_META.unverified;
    const invite = Block({
      title: '开通店铺',
      note: `企业资质认证${cert.label}`,
      body: `<div class="ms-invite"><p>开通店铺后可在商城上架本货主在仓现货，面向本部署内其它货主销售。</p>`
        + `<p>认证通过的货主可直接开店，未认证请先完成企业资质认证。</p>`
        + `<div class="ms-invite-actions">`
        + `<button type="button" class="wx-btn wx-btn--primary" data-target="mall-shop/shop-cert">申请开店</button>`
        + `<button type="button" class="wx-btn wx-btn--ghost" data-target="mall-shop/shop-cert">去认证</button>`
        + `</div></div>`,
    });
    return ReportPage({ hero, blocks: [invite] });
  }

  const stats = StatRow([
    { label: '在售商品', value: shop.onSaleCount || 0, tone: 'default' },
    { label: '店铺评分', value: shop.shopScore || 0, tone: 'default' },
    { label: '企业资质认证', value: (CERT_META[shop.certStatus] || {}).label || '未认证', tone: 'default' },
  ], { cols: 3 });

  const detail = BaseTable({
    columns: [
      { key: 'shopCode', label: '店铺编码', width: '160px' },
      { key: 'shopName', label: '店铺名称' },
      { key: 'mainCategory', label: '主营类目', width: '160px' },
      { key: 'shopStatus', label: '店铺状态', width: '108px', render: (r) => StatusTag(r.shopStatus, 'enabled') },
      { key: 'createTime', label: '创建时间', width: '157px' },
    ],
    rows,
    emptyTitle: '暂无店铺',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
  return ReportPage({
    hero,
    stats,
    blocks: [Block({ title: '明细', note: `共 ${n(rows.length)} 条`, body: detail })],
  });
}

export const PAGE_CSS = `
.ms-invite{padding:var(--wx-sp-2) 0;color:var(--wx-gray-700);font-size:var(--wx-fs-md)}
.ms-invite p{margin:0 0 var(--wx-sp-3)}
.ms-invite-actions{display:flex;gap:var(--wx-sp-2);margin-top:var(--wx-sp-4)}
`;
