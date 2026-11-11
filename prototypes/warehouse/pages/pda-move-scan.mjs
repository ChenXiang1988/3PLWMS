import { ScanPage } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { task = {}, line = null, logs = [] } = data[ctx.pageKey] || {};
  const planQty = line ? line.planQty : 0;
  const doneQty = line ? line.doneQty : 0;
  const route = [task.fromLocation, task.targetLocation].filter(Boolean).join(' → ');

  return ScanPage({
    process: '库内移位作业',
    docNo: task.taskNo || '—',
    refNo: task.moveNo || '',
    state: '作业中',
    stateTone: 'enabled',
    owner: task.owner,
    operator: task.operator,
    device: task.device,
    location: route,
    scanLabel: '扫描目标库位',
    scanHint: '对准库位标签扫描',
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
