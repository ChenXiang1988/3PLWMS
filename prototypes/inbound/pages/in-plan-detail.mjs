import { DetailPage, n, dash } from '../../shared/ui.mjs';

export const STATUS_META = {
  draft: { label: '草稿', type: 'disabled' },
  pending: { label: '待确认', type: 'pending' },
  confirmed: { label: '已生效', type: 'enabled' },
  dispatched: { label: '已分发', type: 'info' },
  closed: { label: '已关闭', type: 'disabled' },
};

export function renderPage(data, ctx) {
  const { doc = {}, rows = [], timeline = [] } = data[ctx.pageKey] || {};
  const st = STATUS_META[doc.planStatus] || STATUS_META.pending;

  return DetailPage({
    docNo: doc.planNo || '—',
    status: st.label,
    statusTone: st.type,
    fields: [
      { label: '计划单号', value: doc.planNo },
      { label: '货主', value: doc.owner },
      { label: '目标仓库', value: doc.targetWarehouse },
      { label: '计划到货日期', value: doc.expectedDate },
      { label: '计划单状态', value: st.label },
      { label: '已生成工序单', value: n(doc.processCount) },
    ],
    columns: [
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'batchNo', label: '批次号', width: '160px', render: (r) => dash(r.batchNo) },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
    ],
    rows,
    timeline: timeline.map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
    actions: [
      { label: '生成收货单', toast: '生成收货单（原型示意）' },
      { label: '返回', ghost: true, toast: '返回（原型示意）' },
    ],
  });
}

export const PAGE_CSS = ``;
