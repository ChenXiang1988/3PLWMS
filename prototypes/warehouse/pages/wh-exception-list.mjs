import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

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
  const count = (s) => rows.filter((r) => r.handleStatus === s).length;

  return ListPage({
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
      { label: '异常类型', key: 'exceptionType', type: 'text', placeholder: '请输入异常类型' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'exceptionNo', label: '异常号', width: '150px', render: (r) => dash(r.exceptionNo) },
      { key: 'exceptionType', label: '异常类型', render: (r) => dash(r.exceptionType) },
      { key: 'sourceNo', label: '来源单号', width: '160px', render: (r) => dash(r.sourceNo) },
      { key: 'owner', label: '货主', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '150px', render: (r) => dash(r.skuCode) },
      { key: 'qty', label: '数量', width: '90px', align: 'right', render: (r) => n(r.qty) },
      { key: 'responsibility', label: '责任方', render: (r) => dash(r.responsibility) },
      { key: 'handleStatus', label: '处理状态', width: '108px', render: (r) => StatusTag(labelOf(r.handleStatus), toneOf(r.handleStatus)) },
      { key: 'slaHours', label: 'SLA', width: '80px', align: 'right', render: (r) => n(r.slaHours) },
      { key: 'handleResult', label: '处理结果', render: (r) => dash(r.handleResult) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.handleStatus }),
    emptyTitle: '暂无异常登记与处置',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
