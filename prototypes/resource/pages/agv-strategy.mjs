import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    enabled: { label: '启用', type: 'enabled' },
    disabled: { label: '停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.strategyStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('enabled'), field: 'strategyStatus', value: 'enabled' },
      { label: '停用', count: count('disabled'), field: 'strategyStatus', value: 'disabled' },
    ],
    filters: [
      { label: '仓库', key: 'warehouse', type: 'text', placeholder: '请输入仓库' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'strategyCode', label: '策略编码', width: '140px', render: (r) => dash(r.strategyCode) },
      { key: 'warehouse', label: '仓库', render: (r) => dash(r.warehouse) },
      { key: 'priorityRule', label: '优先级规则', render: (r) => dash(r.priorityRule) },
      { key: 'chargeThreshold', label: '充电阈值', width: '100px', align: 'right', render: (r) => n(r.chargeThreshold) },
      { key: 'chargeIdleMinutes', label: '空闲充电分钟', width: '120px', align: 'right', render: (r) => n(r.chargeIdleMinutes) },
      { key: 'avoidZone', label: '避让区', render: (r) => dash(r.avoidZone) },
      { key: 'maxTaskPerRobot', label: '单机任务上限', width: '120px', align: 'right', render: (r) => n(r.maxTaskPerRobot) },
      { key: 'strategyStatus', label: '状态', width: '90px', render: (r) => StatusTag(labelOf(r.strategyStatus), toneOf(r.strategyStatus)) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.strategyStatus }),
    emptyTitle: '暂无AGV 调度策略',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
