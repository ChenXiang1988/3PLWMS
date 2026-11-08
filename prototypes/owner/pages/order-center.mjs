import { ListPage, FormDrawer, DrawerDetail, DrawerButton, StatusTag, dash, money, uniq } from '../../shared/ui.mjs';

const RISK_META = {
  normal: { label: '正常', tone: 'enabled' },
  dueSoon: { label: '临期', tone: 'pending' },
  overdue: { label: '超时', tone: 'rejected' },
};

export function renderPage(data, ctx) {
  const { rows = [], config = {} } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const statusField = config.statusField;
  const keyField = config.keyField;
  const meta = config.statusMeta || {};
  const labelOf = (v) => (meta[v] || {}).label || v || '—';
  const toneOf = (v) => (meta[v] || {}).tone || 'info';
  const riskLabel = (v) => (RISK_META[v] || {}).label || v || '—';
  const riskTone = (v) => (RISK_META[v] || {}).tone || 'info';

  const columns = (config.columns || []).map((c) => {
    const base = {
      key: c.key, label: c.label, width: c.width, type: c.type,
      button: c.button, detailButton: c.detailButton, cls: c.cls,
    };
    if (c.key === 'riskLevel') {
      return { ...base, type: 'risk', riskMeta: RISK_META, render: (r) => StatusTag(riskLabel(r.riskLevel), riskTone(r.riskLevel)) };
    }
    if (c.type === 'status') {
      return { ...base, render: (r) => StatusTag(labelOf(r[c.key]), toneOf(r[c.key])) };
    }
    if (c.type === 'money') {
      return { ...base, align: 'right', render: (r) => money(r[c.key]) };
    }
    if (c.type === 'action') {
      return {
        ...base,
        render: (r) => {
          const primary = DrawerButton({
            label: c.button || '处理',
            pageId,
            rowKey: '__new__',
            formRow: r[keyField],
          });
          const detail = c.detailButton
            ? DrawerButton({ label: c.detailButton, pageId, rowKey: r[keyField] })
            : '';
          return primary + (detail ? ` ${detail}` : '');
        },
      };
    }
    if (c.align === 'right') {
      return { ...base, align: 'right', render: (r) => dash(r[c.key]) };
    }
    return { ...base, render: (r) => dash(r[c.key]) };
  });

  const tabs = [{ label: '全部', count: rows.length, active: true }].concat(
    (config.tabs || []).map((t) => ({
      label: t.label,
      count: rows.filter((r) => r[statusField] === t.value).length,
      field: statusField,
      value: t.value,
    }))
  );

  const filters = (config.filters || []).map((f) => (
    f.type === 'select' ? { ...f, options: ['全部', ...uniq(rows.map((r) => r[f.key]))] } : f
  ));

  const form = config.form;
  const formOverlay = form
    ? FormDrawer({
        pageId,
        title: form.title,
        note: form.note,
        groups: form.groups,
        actions: form.actions,
      })
    : '';

  const detailOverlays = rows.map((r) => DrawerDetail({
    pageId,
    rowKey: r[keyField],
    title: '订单 360',
    docNo: r[keyField],
    status: labelOf(r[statusField]),
    statusTone: toneOf(r[statusField]),
    fields: [
      { label: '平台 / 店铺', value: `${dash(r.platformCode)} / ${dash(r.shopName)}` },
      { label: '平台原始状态', value: dash(r.platformStatus) },
      { label: '订单类型', value: dash(r.orderType) },
      { label: '订单金额', value: r.orderAmount == null ? '—' : money(r.orderAmount) },
      { label: '商品售价', value: r.orderAmount == null ? '—' : money(r.orderAmount) },
      { label: '买家实付运费', value: money(r.buyerFreight ?? 0) },
      { label: '平台佣金与通道费', value: money(r.commissionFee ?? Math.round(Number(r.orderAmount || 0) * 0.05)) },
      { label: '物流费', value: money(r.logisticsFee ?? 12) },
      { label: '采购成本', value: money(r.purchaseCost ?? Math.round(Number(r.orderAmount || 0) * 0.62)) },
      { label: '退款', value: money(r.refundAmount ?? 0) },
      { label: '毛利', value: money(r.grossProfit ?? Math.round(Number(r.orderAmount || 0) * 0.24)) },
      { label: '广告花费', value: money(r.adSpend ?? 0) },
      { label: '收货方', value: dash(r.receiverName) },
      { label: '商品明细', value: dash(r.skuSummary), tip: r.skuSummary || '' },
      { label: '幂等键', value: dash(r.idempotencyKey) },
      { label: '命中规则', value: dash(r.hitRule) },
      { label: '异常标签', value: dash(r.exceptionTags) },
      { label: '承诺发货', value: dash(r.promiseShipTime) },
      { label: '履约风险', value: riskLabel(r.riskLevel) },
      { label: '履约方式', value: dash(r.fulfillMode) },
      { label: '目标仓库', value: dash(r.targetWarehouse) },
      { label: '承运商', value: dash(r.carrierName) },
      { label: '决策人', value: dash(r.decisionBy) },
      { label: '决策时间', value: dash(r.decisionTime) },
      { label: '拆分原因', value: dash(r.decisionReason) },
      { label: '规则版本', value: dash(r.ruleVersion) },
    ],
    columns: [
      { key: 'docType', label: '类型', width: '120px' },
      { key: 'docNo', label: '单号', width: '160px' },
      { key: 'status', label: '状态', width: '108px' },
      { key: 'time', label: '时间', width: '157px' },
    ],
    rows: r.relatedDocs || [],
    timeline: r.timeline || [],
    actions: [
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: config.unit || '单',
      pageSize: 20,
      statusTabs: tabs,
      filters,
      toolbar: [{ label: '导出', ghost: true, toast: '导出（原型示意）' }],
      showCount: true,
      scopeNote: config.scopeNote,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r[statusField], 'data-owner': r.owner }),
      emptyTitle: config.emptyTitle,
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: form
        ? { keyField, statusField, storageKey: ctx.pageKey, statusMeta: meta, riskMeta: RISK_META, columns, actionStatus: config.actionStatus }
        : null,
    }),
    overlay: formOverlay,
    ownerOverlay: detailOverlays,
  };
}

export const PAGE_CSS = ``;
