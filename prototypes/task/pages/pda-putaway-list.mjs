import { ListPage, StatusTag, PdaTaskCard } from '../../shared/ui.mjs';

export const STATUS_META = {
  wait: { label: '待作业', type: 'pending' },
  busy: { label: '作业中', type: 'enabled' },
  blocked: { label: '异常', type: 'rejected' },
  done: { label: '已完成', type: 'disabled' },
  closed: { label: '已取消', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};

  return ListPage({
    unit: '条',
    bare: true,
    rows,
    card: (r) => PdaTaskCard({
      row: r,
      tab: 'task/pda-putaway-detail',
      tabName: '上架任务详情',
      status: StatusTag(labelOf(r.taskStatus), toneOf(r.taskStatus)),
      codeKey: 'skuCode',
      binLabel: '目标库位',
      binKey: 'targetBin',
    }),
    emptyTitle: '暂无待办',
    emptyDesc: '该模块当前没有待作业任务',
  });
}

export const PAGE_CSS = ``;
