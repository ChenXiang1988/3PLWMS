import { ListPage, StatusTag, Tag, DrawerButton, DrawerDetail, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.adjustStatus === s).length;
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));

  const columns = [
    { key: 'adjustNo', label: '调整单号', width: '160px', cls: 'wx-col-strong', type: 'text', render: (r) => DrawerButton({ label: r.adjustNo, pageId, rowKey: r.adjustNo }) },
    { key: 'adjustStatus', label: '调整状态', width: '108px', type: 'status', render: (r) => StatusTag(labelOf(r.adjustStatus), toneOf(r.adjustStatus)) },
    { key: 'owner', label: '货主', width: '120px', type: 'text', render: (r) => dash(r.owner) },
    { key: 'skuCode', label: '商品编码', width: '160px', type: 'text', render: (r) => dash(r.skuCode) },
    { key: 'adjustType', label: '调整类型', width: '120px', type: 'tag', render: (r) => Tag(r.adjustType || '—', r.adjustType === '冲销' ? 'danger' : 'info') },
    { key: 'adjustQty', label: '调整数量', width: '120px', align: 'right', type: 'num', sortable: true, render: (r) => n(r.adjustQty) },
    { key: 'postingStatus', label: '过账状态', width: '105px', type: 'text', render: (r) => dash(r.postingStatus) },
    { key: 'sourceDocNo', label: '来源单据号', width: '160px', type: 'text', render: (r) => dash(r.sourceDocNo) },
    { key: 'createTime', label: '创建时间', width: '157px', type: 'text', sortable: true, render: (r) => dash(r.createTime) },
    { key: 'action', label: '操作', width: '108px', type: 'action', action: 'detail', button: '查看详情', render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.adjustNo }) },
  ];

  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.adjustNo, title: '库存调整详情', docNo: r.adjustNo,
    status: labelOf(r.adjustStatus), statusTone: toneOf(r.adjustStatus),
    fields: [
      { label: '货主', value: r.owner },
      { label: '商品编码', value: r.skuCode },
      { label: '调整类型', value: r.adjustType },
      { label: '调整数量', value: r.adjustQty },
      { label: '库存状态', value: r.stockStatus },
      { label: '审批状态', value: r.approvalStatus },
      { label: '过账状态', value: r.postingStatus },
      { label: '冲销流水', value: r.reversalLedgerNo },
      { label: '来源单据号', value: r.sourceDocNo },
      { label: '幂等键', value: r.idempotencyKey },
      { label: '创建时间', value: r.createTime },
    ],
    actions: [
      { label: '确认完成', attrs: { 'data-toast': '调整已完成（原型示意）' } },
      { label: '取消', ghost: true, attrs: { 'data-toast': '调整已取消（原型示意）' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '单',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待处理', count: count('pending'), field: 'adjustStatus', value: 'pending' },
        { label: '进行中', count: count('doing'), field: 'adjustStatus', value: 'doing' },
        { label: '异常待处理', count: count('exception'), field: 'adjustStatus', value: 'exception' },
        { label: '已完成', count: count('completed'), field: 'adjustStatus', value: 'completed' },
        { label: '已取消', count: count('cancelled'), field: 'adjustStatus', value: 'cancelled' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '调整单号', key: 'adjustNo', type: 'text', placeholder: '请输入调整单号' },
        { label: '调整类型', key: 'adjustType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.adjustType))], extra: true },
      ],
      selectable: true,
      selectKey: 'adjustNo',
      bulk: [{ label: '批量确认', status: 'completed' }],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.adjustStatus }),
      emptyTitle: '暂无库存调整任务',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'adjustNo', statusField: 'adjustStatus', storageKey: 'iv-adjusts', statusMeta, columns },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
