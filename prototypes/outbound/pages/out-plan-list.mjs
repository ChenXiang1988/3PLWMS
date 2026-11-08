import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const LOCK_META = {
  unlocked: { label: '未锁', type: 'disabled' },
  locked: { label: '已锁', type: 'enabled' },
  released: { label: '已释放', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
const lockLabel = (s) => (LOCK_META[s] || {}).label || '—';
const lockTone = (s) => (LOCK_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [], details = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.docStatus === s).length;

  const overlay = rows.map((r) => {
    const d = details.find((x) => x.planNo === r.planNo) || {};
    return DrawerDetail({
      pageId,
      rowKey: r.planNo,
      title: '出库订单详情',
      docNo: r.planNo,
      status: labelOf(r.docStatus),
      statusTone: toneOf(r.docStatus),
      fields: [
        { label: '计划单号', value: r.planNo },
        { label: '货主', value: r.owner },
        { label: '来源单据类型', value: dash(r.sourceDocType) },
        { label: '收货方', value: dash(r.receiverName) },
        { label: '收货地址', value: dash(r.receiverAddress) },
        { label: '目标仓库', value: r.targetWarehouse },
        { label: '计划出库日期', value: r.expectedDate },
        { label: '单据状态', value: labelOf(r.docStatus) },
        { label: '锁库状态', value: lockLabel(r.lockStatus) },
        { label: '品类数', value: n(r.skuCount) },
        { label: '计划数量', value: n(r.planQty) },
        { label: '入仓预约号', value: dash(r.appointmentNo) },
        { label: '箱唛号', value: dash(r.cartonMarkNo) },
        { label: '装箱单号', value: dash(r.packingListNo) },
      ],
      columns: [
        { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
        { key: 'skuName', label: '商品名称', render: (x) => dash(x.skuName) },
        { key: 'batchNo', label: '批次号', width: '160px', render: (x) => dash(x.batchNo) },
        { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (x) => n(x.planQty) },
      ],
      rows: d.rows || [],
      timeline: (d.timeline || []).map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
      actions: [
        { label: '生成拣货单', toast: '生成拣货单（原型示意）' },
        { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
      ],
    });
  }).join('');

  return {
    html: ListPage({
      unit: '单',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待处理', count: count('pending'), field: 'docStatus', value: 'pending' },
        { label: '进行中', count: count('doing'), field: 'docStatus', value: 'doing' },
        { label: '异常待处理', count: count('exception'), field: 'docStatus', value: 'exception' },
        { label: '已完成', count: count('completed'), field: 'docStatus', value: 'completed' },
        { label: '已取消', count: count('cancelled'), field: 'docStatus', value: 'cancelled' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '计划单号', key: 'planNo', type: 'text', placeholder: '请输入计划单号', extra: true },
        { label: '计划出库日期', key: 'expectedDate', type: 'daterange', extra: true },
      ],
      toolbar: [
        { label: '生成拣货单', toast: '生成拣货单（原型示意）' },
        { label: '查看工序单', ghost: true, toast: '查看工序单（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'planNo', label: '计划单号', width: '160px', cls: 'wx-col-strong' },
        { key: 'docStatus', label: '单据状态', width: '108px', render: (r) => StatusTag(labelOf(r.docStatus), toneOf(r.docStatus)) },
        { key: 'bizType', label: '出库类型', width: '108px', render: (r) => dash(r.bizType) },
        { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
        { key: 'expectedDate', label: '计划出库日期', width: '120px', render: (r) => dash(r.expectedDate) },
        { key: 'skuCount', label: '品类数', width: '96px', align: 'right', render: (r) => n(r.skuCount) },
        { key: 'planQty', label: '计划数量', width: '108px', align: 'right', render: (r) => n(r.planQty) },
        { key: 'lockStatus', label: '锁库状态', width: '108px', render: (r) => StatusTag(lockLabel(r.lockStatus), lockTone(r.lockStatus)) },
        { key: 'processCount', label: '已生成工序单', width: '120px', align: 'right', render: (r) => n(r.processCount) },
        { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
        { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ pageId, rowKey: r.planNo }) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.docStatus }),
      emptyTitle: '暂无出库订单',
      emptyDesc: '目标仓尚无已分发的出库单据。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
