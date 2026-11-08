import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  pending: { label: '待受理', type: 'pending' },
  accepted: { label: '已受理', type: 'enabled' },
  effective: { label: '已生效', type: 'info' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [], details = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.planStatus === s).length;

  const overlay = rows.map((r) => {
    const d = details.find((x) => x.planNo === r.planNo) || {};
    return DrawerDetail({
      pageId,
      rowKey: r.planNo,
      title: '盘点计划详情',
      docNo: r.planNo,
      status: labelOf(r.planStatus),
      statusTone: toneOf(r.planStatus),
      fields: [
        { label: '盘点计划号', value: r.planNo },
        { label: '盘点类型', value: r.countType },
        { label: '来源类型', value: r.sourceType },
        { label: '计划状态', value: labelOf(r.planStatus) },
        { label: '货主', value: r.owner },
        { label: '计划盘点日期', value: r.planDate },
        { label: '盘点方式', value: r.countMode },
        { label: '已生成盘点单', value: n(r.processCount) },
      ],
      columns: [
        { key: 'processNo', label: '盘点单号', width: '160px', cls: 'wx-col-strong' },
        { key: 'countScope', label: '盘点范围', render: (x) => dash(x.countScope) },
        { key: 'binCount', label: '库位数', width: '108px', align: 'right', render: (x) => n(x.binCount) },
        { key: 'diffCount', label: '差异数', width: '108px', align: 'right', render: (x) => n(x.diffCount) },
      ],
      rows: d.processes || [],
      timeline: (d.timeline || []).map((t) => ({ time: t.time, text: t.text, operator: t.operator })),
      actions: r.planStatus === 'pending'
        ? [
          { label: '受理', toast: '受理盘点计划（原型示意）' },
          { label: '驳回', ghost: true, toast: '驳回盘点计划（原型示意）' },
          { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
        ]
        : [{ label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } }],
    });
  }).join('');

  return {
    html: ListPage({
      unit: '单',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '待受理', count: count('pending'), field: 'planStatus', value: 'pending' },
        { label: '已受理', count: count('accepted'), field: 'planStatus', value: 'accepted' },
        { label: '已生效', count: count('effective'), field: 'planStatus', value: 'effective' },
        { label: '已完成', count: count('completed'), field: 'planStatus', value: 'completed' },
        { label: '已取消', count: count('cancelled'), field: 'planStatus', value: 'cancelled' },
      ],
      filters: [
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '来源类型', key: 'sourceType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.sourceType))] },
        { label: '盘点类型', key: 'countType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.countType))], extra: true },
        { label: '计划盘点日期', key: 'planDate', type: 'daterange', extra: true },
      ],
      toolbar: [
        { label: '新建', toast: '新建盘点计划（原型示意）' },
        { label: '受理', ghost: true, toast: '受理盘点计划（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'planNo', label: '盘点计划号', width: '160px', cls: 'wx-col-strong' },
        { key: 'countType', label: '盘点类型', width: '120px', render: (r) => dash(r.countType) },
        { key: 'sourceType', label: '来源类型', width: '108px', render: (r) => dash(r.sourceType) },
        { key: 'planStatus', label: '计划状态', width: '108px', render: (r) => StatusTag(labelOf(r.planStatus), toneOf(r.planStatus)) },
        { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
        { key: 'planDate', label: '计划盘点日期', width: '120px', render: (r) => dash(r.planDate) },
        { key: 'countMode', label: '盘点方式', width: '108px', render: (r) => dash(r.countMode) },
        { key: 'processCount', label: '已生成盘点单', width: '120px', align: 'right', render: (r) => n(r.processCount) },
        { key: 'diffLineCount', label: '差异行数', width: '108px', align: 'right', render: (r) => n(r.diffLineCount) },
        { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
        { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ pageId, rowKey: r.planNo }) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.planStatus }),
      emptyTitle: '暂无盘点计划',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
