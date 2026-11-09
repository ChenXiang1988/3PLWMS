import { ScanPage } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { task = {}, line = null, logs = [] } = data[ctx.pageKey] || {};
  const planQty = line ? line.planQty : 0;
  const doneQty = line ? line.doneQty : 0;

  return ScanPage({
    process: '盘点作业',
    docNo: task.taskNo || '—',
    refNo: task.countNo || '',
    state: '作业中',
    stateTone: 'enabled',
    owner: task.owner,
    operator: task.operator,
    device: task.device,
    location: task.location,
    scanLabel: '扫描商品条码',
    scanHint: '对准条码扫描',
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
