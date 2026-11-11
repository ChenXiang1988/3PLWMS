import { ListPage, StatusTag, DrawerButton, DrawerDetail, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '处理中', type: 'info' },
  done: { label: '已处理', type: 'enabled' },
  waived: { label: '已豁免', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.handleStatus === s).length;
  const statusMeta = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, { label: v.label, tone: v.type }]));

  const columns = [
    { key: 'exceptionNo', label: '异常号', width: '150px', type: 'text', render: (r) => DrawerButton({ label: r.exceptionNo, pageId, rowKey: r.exceptionNo }) },
    { key: 'exceptionType', label: '异常类型', type: 'text', render: (r) => dash(r.exceptionType) },
    { key: 'sourceNo', label: '来源单号', width: '160px', type: 'text', render: (r) => dash(r.sourceNo) },
    { key: 'owner', label: '货主', type: 'text', render: (r) => dash(r.owner) },
    { key: 'skuCode', label: '商品编码', width: '150px', type: 'text', render: (r) => dash(r.skuCode) },
    { key: 'qty', label: '数量', width: '90px', align: 'right', type: 'num', sortable: true, render: (r) => n(r.qty) },
    { key: 'responsibility', label: '责任方', type: 'text', render: (r) => dash(r.responsibility) },
    { key: 'handleStatus', label: '处理状态', width: '108px', type: 'status', render: (r) => StatusTag(labelOf(r.handleStatus), toneOf(r.handleStatus)) },
    { key: 'slaHours', label: 'SLA', width: '80px', align: 'right', type: 'num', render: (r) => n(r.slaHours) },
    { key: 'handleResult', label: '处理结果', type: 'text', render: (r) => dash(r.handleResult) },
    { key: 'action', label: '操作', width: '108px', type: 'action', action: 'detail', button: '查看详情', render: (r) => DrawerButton({ label: '查看详情', pageId, rowKey: r.exceptionNo }) },
  ];

  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.exceptionNo, title: '异常详情', docNo: r.exceptionNo,
    status: labelOf(r.handleStatus), statusTone: toneOf(r.handleStatus),
    fields: [
      { label: '异常类型', value: r.exceptionType },
      { label: '来源单号', value: r.sourceNo },
      { label: '货主', value: r.owner },
      { label: '商品编码', value: r.skuCode },
      { label: '数量', value: r.qty },
      { label: '责任方', value: r.responsibility },
      { label: 'SLA', value: r.slaHours ? `${r.slaHours} 小时` : '' },
      { label: '处理结果', value: r.handleResult },
    ],
    actions: [
      { label: '确认处置', attrs: { 'data-toast': '异常已处置（原型示意）' } },
      { label: '豁免', ghost: true, attrs: { 'data-toast': '异常已豁免（原型示意）' } },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条',
      pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待处理', count: count('pending'), field: 'handleStatus', value: 'pending' },
        { label: '处理中', count: count('doing'), field: 'handleStatus', value: 'doing' },
        { label: '已处理', count: count('done'), field: 'handleStatus', value: 'done' },
        { label: '已豁免', count: count('waived'), field: 'handleStatus', value: 'waived' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '异常类型', key: 'exceptionType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.exceptionType))] },
        { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
      ],
      selectable: true,
      selectKey: 'exceptionNo',
      bulk: [{ label: '批量处置', status: 'done' }, { label: '批量豁免', status: 'waived' }],
      toolbar: [
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns,
      rows,
      rowAttrs: (r) => ({ 'data-status': r.handleStatus }),
      emptyTitle: '暂无异常登记与处置',
      emptyDesc: '当前筛选条件下没有任何记录。',
      live: { keyField: 'exceptionNo', statusField: 'handleStatus', storageKey: 'wh-exceptions', statusMeta, columns },
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
