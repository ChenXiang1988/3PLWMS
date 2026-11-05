/**
 * report 页骨架（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/<模块ID>/pages/<页key>.mjs，
 *       并替换 __MODULE_ID__ / __PAGE_KEY__ / __PAGE_NAME__ / __PREFIX__ 占位符。
 *       本文件放在 skill 目录里时，import 的相对路径是相对
 *       prototypes/<模块ID>/pages/ 算的，原地 import 会报 ERR_MODULE_NOT_FOUND。
 *
 * 与列表页的分工（references/design-spec.md 第 4 节）——这一条最容易搞错：
 *   报表页是唯一允许摆 KPI 的类型，用 ReportHero + StatRow + Block；
 *   列表页一页一张表，不加指标卡。判据是「注册表里 type 是什么」，不是组件能不能用。
 *
 * 三个组件的规格：
 *   ReportHero({ title, sub })            页头：只放名称与口径边界
 *   StatRow(items, { cols })              指标卡：tone 只有 default / ok / alert / warn
 *   Block({ title, note, body })          分节卡片：带标题与右侧说明
 *
 * 零外链、零依赖：图表用内联 SVG 或纯 CSS 横条，用令牌上色，不引图表库。
 * 指标值必须由行数据算出，不写死数字。口径写「本部署主体」，不写跨主体汇总。
 */
import { ReportHero, StatRow, Block, BaseTable, StatusTag, esc, n } from '../../01 shared/ui.mjs';

/**
 * @param {Object} data 键为 data/*.json 的文件名，值已规范化成 { rows, alerts, ... }
 * @param {Object} ctx  { moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped }
 */
export function renderPage(data, ctx) {
  const { rows = [], alerts = [] } = data[ctx.pageKey] || {};
  const sum = (k) => rows.reduce((a, r) => a + Number(r[k] || 0), 0);

  const hero = ReportHero({
    title: ctx.pageName,
    sub: '本部署主体口径，不随货主下拉切换',
  });

  const stats = StatRow([
    { label: '记录条数', value: rows.length, hint: '当前数据范围' },
    { label: '在库数量', value: sum('qty'), hint: '各行在库数量相加' },
    { label: '异常条数', value: alerts.length, hint: '需人工处理', tone: alerts.length ? 'alert' : 'ok' },
  ], { cols: 3 });

  /* 报表页里的块内表用 BaseTable，不需要状态页签与分页那一整套。 */
  const detail = BaseTable({
    columns: [
      { key: 'owner', label: '货主', width: '120px' },
      { key: 'skuCode', label: '商品编码', width: '160px' },
      { key: 'location', label: '库位编码', width: '160px' },
      { key: 'qty', label: '在库数量', width: '120px', align: 'right' },
      {
        key: 'status', label: '状态', width: '108px',
        render: (r) => StatusTag(r.statusLabel || '—', r.level === '高' ? 'rejected' : 'enabled'),
      },
    ],
    rows,
    emptyTitle: '暂无数据',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });

  const block1 = Block({ title: '明细', note: `共 ${rows.length} 条`, body: detail });

  /* 零依赖图表：纯 CSS 横向条。类名以 __PREFIX__ 开头，避免跨页撞名。 */
  const max = Math.max(1, ...rows.map((r) => Number(r.qty) || 0));
  const bars = rows.slice(0, 5).map((r) => {
    const pct = Math.round((Number(r.qty) || 0) / max * 100);
    return `<div class="__PREFIX__-bar">`
      + `<span class="__PREFIX__-label">${esc(r.owner || r.skuCode)}</span>`
      + `<span class="__PREFIX__-track"><span class="__PREFIX__-fill" style="width:${pct}%"></span></span>`
      + `<span class="__PREFIX__-value">${n(r.qty)}</span>`
      + `</div>`;
  }).join('');

  const block2 = Block({
    title: '构成',
    note: '前 5 项',
    body: bars || '<div class="wx-empty"><b>暂无数据</b><span>当前筛选条件下没有任何记录。</span></div>',
  });

  return `<div class="wx-report">${hero}${stats}${block1}${block2}</div>`;
}

/* 本页样式由构建收进全局 <style>。类名以 __PREFIX__ 开头，取值只取 var(--wx-*)。 */
export const PAGE_CSS = `
.__PREFIX__-bar{display:grid;grid-template-columns:140px 1fr 90px;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-1) 0}
.__PREFIX__-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.__PREFIX__-track{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.__PREFIX__-fill{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.__PREFIX__-value{font-size:var(--wx-fs-sm);text-align:right;font-variant-numeric:tabular-nums;color:var(--wx-gray-900)}
`;
