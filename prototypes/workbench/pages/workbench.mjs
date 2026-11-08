import { ReportHero, StatRow, Block, BaseTable, ReportPage, BarRows, EmptyState } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({ title: ctx.pageName, sub: '' });

  const first = rows[0] || {};
  const stats = StatRow([
    { label: '库存概览', value: first.stockTotal || 0, hint: '件', tone: 'default' },
    { label: '待确认账单', value: first.pendingBill || 0, hint: '张', tone: first.pendingBill ? 'warn' : 'ok' },
    { label: '待处理', value: sum('pending'), tone: 'default' },
    { label: '进行中', value: sum('doing'), tone: 'default' },
    { label: '异常待处理', value: sum('exception'), tone: sum('exception') ? 'alert' : 'ok' },
    { label: '已完成', value: sum('completed'), tone: 'ok' },
  ], { cols: 3 });

  const detail = BaseTable({
    columns: [
      { key: 'docType', label: '单据类型', width: '160px' },
      { key: 'pending', label: '待处理', width: '120px', align: 'right' },
      { key: 'doing', label: '进行中', width: '120px', align: 'right' },
      { key: 'exception', label: '异常待处理', width: '120px', align: 'right' },
      { key: 'completed', label: '已完成', width: '120px', align: 'right' },
      { key: 'overdue', label: '超期数', width: '120px', align: 'right' },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const todoRows = [
    { item: '授权即将过期', count: first.authExpiring || 0, entry: '平台店铺' },
    { item: '拉单失败', count: first.syncFailed || 0, entry: '同步任务' },
    { item: '待下发订单', count: first.notDispatched || 0, entry: '订单中心' },
    { item: '待发货履约', count: first.pendingShip || 0, entry: '履约单' },
    { item: '待预约备货', count: first.pendingBook || 0, entry: '平台备货单' },
    { item: '待处理售后', count: first.pendingAfterSale || 0, entry: '平台售后单' },
    { item: '承诺超时', count: first.promiseRisk || 0, entry: '订单中心' },
    { item: '库存风险', count: first.stockRisk || 0, entry: '订单中心' },
    { item: '对账差异', count: first.reconcileDiff || 0, entry: '对账差异' },
  ];
  const todoTable = BaseTable({
    columns: [
      { key: 'item', label: '待办事项', width: '200px' },
      { key: 'count', label: '数量', width: '120px', align: 'right' },
      { key: 'entry', label: '处理入口', width: '200px' },
    ],
    rows: todoRows,
    emptyTitle: '暂无待办',
    emptyDesc: '当前没有需要处理的待办。',
  });

  const queueTable = BaseTable({
    columns: [
      { key: 'riskType', label: '风险类型', width: '140px' },
      { key: 'objectNo', label: '对象', width: '220px' },
      { key: 'deadline', label: '截止时间', width: '157px' },
      { key: 'riskLevel', label: '风险等级', width: '96px' },
      { key: 'entry', label: '处理入口', width: '140px' },
    ],
    rows: first.queue || [],
    emptyTitle: '暂无风险',
    emptyDesc: '当前没有需要优先处理的风险。',
  });

  const blockQueue = Block({ title: '风险队列', note: '按截止时间与风险优先处理', body: queueTable });
  const blockTodo = Block({ title: '待办', note: '按登录货主汇总', body: todoTable });
  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });
  const bars = BarRows(rows.slice(0, 5).map((r) => ({ label: r.docType, value: r.completed })));
  const block2 = Block({
    title: '构成',
    note: '按单据类型已完成量',
    body: bars || EmptyState({ title: '暂无数据', desc: '当前筛选条件下没有任何记录。' }),
  });

  return ReportPage({ hero, stats, blocks: [blockQueue, blockTodo, block1, block2] });
}

export const PAGE_CSS = ``;
