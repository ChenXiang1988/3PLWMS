import { ListPage, DrawerButton, DrawerDetail, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  enabled: { label: '生效', type: 'enabled' },
  pending: { label: '待生效', type: 'pending' },
  disabled: { label: '已停用', type: 'disabled' },
};
const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.capabilityStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.capabilityCode, title: '设备能力矩阵详情', docNo: r.capabilityCode,
    status: labelOf(r.capabilityStatus), statusTone: toneOf(r.capabilityStatus),
    fields: [
      { label: '设备类型', value: r.deviceType }, { label: '作业能力', value: r.operationCapability },
      { label: '动作方向', value: r.direction }, { label: '负载上限', value: `${r.loadLimit} ${r.loadUnit}` },
      { label: '容器能力', value: r.containerCapability }, { label: '替代资源', value: r.alternativeResource },
      { label: '生效版本', value: r.effectiveVersion }, { label: '能力状态', value: labelOf(r.capabilityStatus) },
      { label: '适用库区', value: r.zones }, { label: '最近校验', value: r.checkedAt },
    ],
    columns: [
      { key: 'time', label: '时间', width: '150px', render: (x) => dash(x.time) },
      { key: 'event', label: '版本事件', render: (x) => dash(x.event) },
      { key: 'operator', label: '操作人', width: '100px', render: (x) => dash(x.operator) },
    ],
    rows: r.events || [],
    actions: [
      { label: '查看替代资源', toast: '替代资源（原型示意）' },
      { label: '新增能力版本', ghost: true, toast: '新增能力版本（原型示意）' },
      { label: '停用版本', ghost: true, confirm: '停用后新任务不再匹配该能力，已执行任务不受影响。是否继续？', toast: '已提交停用申请（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');

  return {
    html: ListPage({
      unit: '条', pageSize: 10,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '生效', count: count('enabled'), field: 'capabilityStatus', value: 'enabled' },
        { label: '待生效', count: count('pending'), field: 'capabilityStatus', value: 'pending' },
        { label: '已停用', count: count('disabled'), field: 'capabilityStatus', value: 'disabled' },
      ],
      filters: [
        { label: '设备类型', key: 'deviceType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.deviceType))] },
        { label: '作业能力', key: 'operationCapability', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.operationCapability))] },
        { label: '能力编码', key: 'capabilityCode', type: 'text', placeholder: '请输入能力编码', extra: true },
        { label: '生效版本', key: 'effectiveVersion', type: 'text', placeholder: '请输入版本号', extra: true },
      ],
      toolbar: [
        { label: '新增能力版本', toast: '新增能力版本（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'capabilityCode', label: '能力编码', width: '140px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.capabilityCode, label: r.capabilityCode }) },
        { key: 'deviceType', label: '设备类型', width: '95px', render: (r) => dash(r.deviceType) },
        { key: 'operationCapability', label: '作业能力', width: '110px', render: (r) => dash(r.operationCapability) },
        { key: 'direction', label: '动作方向', width: '95px', render: (r) => dash(r.direction) },
        { key: 'loadLimit', label: '负载上限', width: '100px', align: 'right', render: (r) => `${n(r.loadLimit)} ${r.loadUnit || ''}` },
        { key: 'containerCapability', label: '容器能力', width: '130px', render: (r) => dash(r.containerCapability) },
        { key: 'alternativeResource', label: '替代资源', width: '130px', render: (r) => dash(r.alternativeResource) },
        { key: 'effectiveVersion', label: '生效版本', width: '95px', render: (r) => dash(r.effectiveVersion) },
        { key: 'capabilityStatus', label: '能力状态', width: '95px', render: (r) => StatusTag(labelOf(r.capabilityStatus), toneOf(r.capabilityStatus)) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-status': r.capabilityStatus }),
      emptyTitle: '暂无设备能力矩阵',
      emptyDesc: '当前筛选条件下没有任何能力版本。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
