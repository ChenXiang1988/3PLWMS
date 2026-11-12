import { ListPage, DrawerButton, DrawerDetail, StatusTag, n, dash, uniq, BaseTable, BarRows, EmptyState, Block } from '../../shared/ui.mjs';

export const STATUS_META = { wait: { label: '待作业', type: 'pending' }, busy: { label: '作业中', type: 'enabled' }, blocked: { label: '阻塞', type: 'rejected' }, done: { label: '已完成', type: 'disabled' }, closed: { label: '已取消', type: 'disabled' } };
const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.waveStatus === s).length;
  const overlay = rows.map((r) => DrawerDetail({
    pageId, rowKey: r.waveNo, title: '波次释放与容量校验', docNo: r.waveNo, status: labelOf(r.waveStatus), statusTone: toneOf(r.waveStatus),
    fields: [
      { label: '作业时段', value: r.workWindow }, { label: '区域', value: r.zone }, { label: '容量上限', value: r.capacity },
      { label: '已排订单数', value: r.orderCount }, { label: '订单行数', value: r.lineCount }, { label: '已排件数', value: r.plannedQty }, { label: '容器数', value: r.containerCount }, { label: '任务数', value: r.taskCount }, { label: '标准工作量', value: r.standardWorkload },
      { label: '剩余容量', value: r.remainCapacity ?? Math.max(Number(r.capacity || 0) - Number(r.orderCount || 0), 0) },
      { label: '当前瓶颈', value: r.bottleneck }, { label: '缓冲水位', value: r.bufferLevel }, { label: '容量风险', value: r.capacityRisk },
      { label: '设备影响', value: r.deviceImpact }, { label: '释放判断', value: r.releaseDecision },
    ],
    columns: [
      { key: 'metric', label: '校验项', width: '140px', render: (x) => dash(x.metric) },
      { key: 'value', label: '当前值', width: '120px', render: (x) => dash(x.value) },
      { key: 'rule', label: '判断依据', render: (x) => dash(x.rule) },
    ], rows: r.checks || [],
    actions: [
      { label: '释放波次', toast: `已打开 ${r.waveNo} 释放确认（原型示意）` },
      { label: '拆分波次', ghost: true, toast: '已打开波次拆分（原型示意）' },
      { label: '重排', ghost: true, toast: '已打开波次重排（原型示意）' },
      { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
    ],
  })).join('');
  const listHtml = ListPage({
    unit: '个', pageSize: 20,
    statusTabs: [{ label: '全部', count: rows.length, active: true }, ...Object.entries(STATUS_META).map(([value, meta]) => ({ label: meta.label, count: count(value), field: 'waveStatus', value }))],
    filters: [
      { label: '波次号', key: 'waveNo', type: 'text', placeholder: '请输入波次号' },
      { label: '区域', key: 'zone', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.zone).filter(Boolean))] },
      { label: '瓶颈状态', key: 'bottleneck', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.bottleneck).filter(Boolean))], extra: true },
      { label: '作业时段', key: 'workWindow', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.workWindow))], extra: true },
    ],
    toolbar: [{ label: '新建波次', toast: '新建波次（原型示意）' }, { label: '释放波次', ghost: true, toast: '已打开波次释放确认（原型示意）' }, { label: '拆分/重排', ghost: true, toast: '已打开波次重排（原型示意）' }, { label: '导出', ghost: true, toast: '导出（原型示意）' }],
    columns: [
      { key: 'waveNo', label: '波次号', width: '160px', cls: 'wx-col-strong', render: (r) => DrawerButton({ pageId, rowKey: r.waveNo, label: r.waveNo }) },
      { key: 'waveStatus', label: '波次状态', width: '100px', render: (r) => StatusTag(labelOf(r.waveStatus), toneOf(r.waveStatus)) },
      { key: 'workWindow', label: '作业时段', width: '125px', render: (r) => dash(r.workWindow) },
      { key: 'capacity', label: '容量上限', width: '90px', align: 'right', render: (r) => n(r.capacity) },
      { key: 'orderCount', label: '订单数', width: '80px', align: 'right', render: (r) => n(r.orderCount) },
      { key: 'lineCount', label: '订单行数', width: '90px', align: 'right', render: (r) => n(r.lineCount) },
      { key: 'plannedQty', label: '已排件数', width: '95px', align: 'right', render: (r) => n(r.plannedQty) },
      { key: 'containerCount', label: '容器数', width: '85px', align: 'right', render: (r) => n(r.containerCount) },
      { key: 'taskCount', label: '任务数', width: '80px', align: 'right', render: (r) => n(r.taskCount) },
      { key: 'remainCapacity', label: '剩余容量', width: '95px', align: 'right', render: (r) => n(r.remainCapacity ?? Math.max(Number(r.capacity || 0) - Number(r.orderCount || 0), 0)) },
      { key: 'bottleneck', label: '当前瓶颈', width: '125px', render: (r) => dash(r.bottleneck) },
      { key: 'capacityRisk', label: '容量风险', width: '95px', render: (r) => dash(r.capacityRisk) },
      { key: 'taskCount', label: '拣货任务数', width: '100px', align: 'right', render: (r) => n(r.taskCount) },
    ], rows, rowAttrs: (r) => ({ 'data-status': r.waveStatus }), emptyTitle: '暂无波次计划', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  const simulationRows = rows.map((r) => ({ ...r, estimatedFinish: r.estimatedFinish || (r.waveStatus === 'blocked' ? '待设备恢复' : '18:40'), resourceLoad: r.resourceLoad || `${Math.round(Number(r.orderCount || 0) / Math.max(Number(r.capacity || 1), 1) * 100)}%`, gap: r.gap || (Number(r.remainCapacity || 0) < 2 ? '需替代资源' : '无') }));
  const simulation = BaseTable({
    columns: [
      { key: 'waveNo', label: '波次号', width: '160px', render: (r) => dash(r.waveNo) },
      { key: 'orderCount', label: '当前任务量', width: '100px', align: 'right', render: (r) => n(r.orderCount) },
      { key: 'estimatedFinish', label: '预计完成', width: '110px', render: (r) => dash(r.estimatedFinish) },
      { key: 'resourceLoad', label: '资源负荷', width: '100px', align: 'right', render: (r) => dash(r.resourceLoad) },
      { key: 'gap', label: '缺口', width: '110px', render: (r) => dash(r.gap) },
      { key: 'alternativeResource', label: '替代资源方案', width: '150px', render: (r) => dash(r.alternativeResource || (r.gap === '无' ? '—' : '人工叉车 F-07')) },
    ], rows: simulationRows, emptyTitle: '暂无波次容量模拟', emptyDesc: '当前筛选条件下没有任何记录。',
  });
  return { html: `${listHtml.html}${Block({ title: '波次容量模拟', note: '当前任务、预计完成时间与资源负荷', body: `${simulation}<div class="wx-block-head"><b>资源负荷</b><span>按当前波次容量占用</span></div>${simulationRows.length ? BarRows(simulationRows.map((r) => ({ label: r.waveNo, value: parseInt(r.resourceLoad, 10) || 0 }))) : EmptyState({ title: '暂无资源负荷', desc: '当前筛选条件下没有任何记录。' })}` })}${overlay}`, overlay };
}
export const PAGE_CSS = ``;
