import { ScanPage } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { task = {}, line = null, logs = [] } = data[ctx.pageKey] || {};
  const planQty = line ? line.planQty : 0;
  const doneQty = line ? line.doneQty : 0;

  return ScanPage({
    process: '装车交接作业',
    docNo: task.taskNo || '—',
    refNo: task.handoverNo || '',
    state: '作业中',
    stateTone: 'enabled',
    owner: task.owner,
    operator: task.operator,
    device: task.device,
    location: task.dock,
    scanLabel: '扫描交接单号',
    scanHint: '对准交接单条码扫描',
    line,
    planQty,
    doneQty,
    thisTime: 0,
    qtyUnit: line && line.unit ? line.unit : '件',
    logs,
    primary: '确认',
    next: '下一件',
  });
}

export const PAGE_CSS = ``;
