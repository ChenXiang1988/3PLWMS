/**
 * scan 页骨架（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/<模块ID>/pages/<页key>.mjs，
 *       并替换 warehouse / count-scan / 盘点作业 / wh-count-scan 占位符。
 *       本文件放在 skill 目录里时，import 的相对路径是相对
 *       prototypes/<模块ID>/pages/ 算的，原地 import 会报 ERR_MODULE_NOT_FOUND。
 *
 * 只做一件事：把「一屏只露当前那一个输入」的六段结构摆对：
 *   1 导航 → 2 任务上下文 → 3 当前输入 → 4 对象摘要 → 5 数量与进度 → 6 操作
 * 六段的职责边界与作业状态枚举见 references/design-spec.md 第 4.2 节与 glossary.md 第 3 节。
 *
 * 最常犯的错：把系统校验序列铺成步骤表。那规定系统拦什么、留什么证，
 * 不是让人按十几下。写之前先答三句：人现在只该扫哪一个？扫到的东西显示在哪？
 * 这条做完该干嘛？答不上就说明又想铺步骤表了。
 *
 * 硬约束：设计基准 375px；适配用 flex / grid / 百分比 / media query；
 * 最小触控目标 44px；样式只取 var(--wx-*)，不引外部字体与图表库。
 */
import { ScanPage } from '../../01 shared/ui.mjs';

/* 作业状态中文名与色型取 glossary.md 第 3 节，色型只用五种之一。 */
export const TASK_STATE = {
  wait: { label: '待作业', tone: 'pending' },
  busy: { label: '作业中', tone: 'enabled' },
  blocked: { label: '异常', tone: 'rejected' },
  done: { label: '已完成', tone: 'disabled' },
  closed: { label: '已取消', tone: 'disabled' },
};

/**
 * @param {Object} data 键为 data/*.json 的文件名，值已规范化成 { rows, task, line, logs, ... }
 * @param {Object} ctx  { moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped }
 */
export function renderPage(data, ctx) {
  const { task = {}, line = null, logs = [], rows = [] } = data[ctx.pageKey] || {};
  const st = TASK_STATE[task.status] || TASK_STATE.wait;

  return ScanPage({
    /* 段 1、2 的输入：这是哪张单的哪道工序，一屏说清。 */
    process: ctx.pageName,
    docNo: task.docNo || '—',
    owner: task.owner || '',
    state: st.label,
    stateTone: st.tone,
    operator: task.operator || '',
    device: task.device || '',
    location: task.location || '',

    /* 段 3：只露当前那一个输入框，不做成多行表单。 */
    scanLabel: task.scanLabel || '扫描商品条码',
    scanHint: task.scanHint || '对准条码扫描',
    scanThen: task.scanThen || '',

    /* 段 4：扫到什么，人不用记。没有明细行时不重复摆一张空卡。 */
    line,

    /* 段 5：大数字，扫一下动一下。派生值在渲染时算，不写进数据文件。 */
    planQty: task.planQty ?? rows.reduce((a, r) => a + Number(r.planQty || 0), 0),
    doneQty: task.doneQty ?? 0,
    thisTime: task.thisTime ?? 0,
    qtyUnit: task.qtyUnit || '件',

    /* 采集流水只展示最近 3 条，由组件截取。 */
    logs,

    /* 段 6：一个次操作 + 一个主操作，底部常驻。 */
    primary: '确认',
    next: '下一件',
  });
}

/* 本页自定义样式（可选）。类名一律以 wh-count-scan 开头。 */
export const PAGE_CSS = ``;
