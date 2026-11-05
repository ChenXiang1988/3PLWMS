/**
 * 共享组件与基础样式（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/01 shared/ui.mjs。
 *       页面模块从 ../../01 shared/ui.mjs 引入，只写 columns / rows / filters / toolbar，
 *       结构一律交给这里；交互一律由 data-* 属性驱动，由 SHELL_SCRIPT 统一处理。
 *
 * 本文件与 tokens.css.mjs 组成「实现层」：这里只放结构，不放色值。
 * 样式里出现任何 hex 都是错误——取值只在 tokens.css.mjs。
 *
 * 组件白名单与骨架约束见 references/design-spec.md 第 4、5 节。
 * 新增组件的顺序：先改规范层 → 再改本文件 → 最后重建所有 deployed: true 模块。
 */
import { TOKENS_CSS } from './tokens.css.mjs';

export { TOKENS_CSS };

export const TONES = ['disabled', 'enabled', 'info', 'pending', 'rejected'];
export const TAG_TONES = ['default', 'info', 'danger'];
export const STAT_TONES = ['default', 'ok', 'alert', 'warn'];

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
export function dash(v) {
  return (v === '' || v == null) ? '—' : esc(v);
}
export function n(v) {
  return (v === '' || v == null) ? '—' : Number(v).toLocaleString('zh-CN');
}
export function uniq(list) {
  return [...new Set(list.filter((v) => v != null && v !== ''))].sort();
}

function assertTone(name, tone, allowed) {
  if (!allowed.includes(tone)) {
    throw new Error(`[色型] ${name} 传入未定义色型 ${tone}，只允许 ${allowed.join(' / ')}`);
  }
}

/* ---------------- 原子组件 ---------------- */

export function StatusTag(text, tone = 'info') {
  assertTone('StatusTag', tone, TONES);
  return `<span class="wx-tag wx-tag--${tone}">${esc(text)}</span>`;
}

export function Tag(text, tone = 'default') {
  assertTone('Tag', tone, TAG_TONES);
  return `<span class="wx-chip wx-chip--${tone}">${esc(text)}</span>`;
}

export function ProgressCell(done, plan) {
  const d = Number(done || 0);
  const p = Number(plan || 0);
  const pct = p ? Math.min(100, Math.round((d / p) * 100)) : 0;
  return `<div class="wx-progress"><span class="wx-progress-track"><i style="width:${pct}%"></i></span>`
    + `<span class="wx-progress-num">${n(d)} / ${n(p)}</span></div>`;
}

export function EmptyState({ title = '暂无记录', desc = '当前筛选条件下没有任何记录。' } = {}) {
  return `<div class="wx-empty"><b>${esc(title)}</b><span>${esc(desc)}</span></div>`;
}

function renderButton(b) {
  const parts = [];
  if (b.toast) parts.push(`data-toast="${esc(b.toast)}"`);
  if (b.confirm) parts.push(`data-confirm="${esc(b.confirm)}"`);
  if (b.attrs) {
    for (const [k, v] of Object.entries(b.attrs)) parts.push(`${k}="${esc(v)}"`);
  }
  const cls = `wx-btn${b.ghost ? ' wx-btn--ghost' : ''}${b.primary ? ' wx-btn--primary' : ''}`;
  return `<button type="button" class="${cls}" ${parts.join(' ')}>${esc(b.label)}</button>`;
}

/**
 * 通用表格。列表页、详情页、报表页共用。
 * render 的返回值视为「已转义 HTML」——先 esc 再套标签是正确顺序。
 * 每行都写 data-row-idx 与 data-row（转义后的行 JSON），供筛选与分页使用；
 * 派生列写成纯函数，不往数据文件里加字段。
 */
export function BaseTable({ columns = [], rows = [], rowAttrs = null, emptyTitle = '暂无记录', emptyDesc = '当前筛选条件下没有任何记录。' } = {}) {
  const head = columns.map((c) => {
    const label = c.label ?? c.title ?? c.key;
    const style = c.width ? ` style="width:${esc(c.width)}"` : '';
    const cls = c.align === 'right' ? ' class="num"' : '';
    const tip = c.tipKey ? ` title="${esc(c.tipKey)}"` : '';
    return `<th${cls}${style}${tip}>${esc(label)}</th>`;
  }).join('');
  const body = rows.map((r, i) => {
    const extra = rowAttrs
      ? Object.entries(rowAttrs(r) || {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join('')
      : '';
    const cells = columns.map((c) => {
      const content = typeof c.render === 'function'
        ? c.render(r)
        : (c.align === 'right' ? n(r[c.key]) : dash(r[c.key]));
      const cls = [c.align === 'right' ? 'num' : '', c.cls || ''].filter(Boolean).join(' ');
      return `<td${cls ? ` class="${esc(cls)}"` : ''}>${content}</td>`;
    }).join('');
    return `<tr data-row-idx="${i}" data-row="${esc(JSON.stringify(r))}"${extra}>${cells}</tr>`;
  }).join('');
  return `<div class="wx-table-wrap"><table class="wx-table"><thead><tr>${head}</tr></thead>`
    + `<tbody>${body}</tbody></table></div>`
    + `<div class="wx-empty" hidden><b>${esc(emptyTitle)}</b><span>${esc(emptyDesc)}</span></div>`;
}

function renderFilter(f) {
  const label = `<span class="wx-filter-label">${esc(f.label)}</span>`;
  const key = esc(f.key);
  if (f.type === 'select') {
    const opts = (f.options || ['全部']).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
    return `<label class="wx-filter">${label}<select class="wx-select" data-filter-key="${key}">${opts}</select></label>`;
  }
  if (f.type === 'daterange') {
    return `<label class="wx-filter">${label}<input type="date" class="wx-input" data-range-key="${key}" data-range-side="from">`
      + `<span class="wx-range-sep">至</span><input type="date" class="wx-input" data-range-key="${key}" data-range-side="to"></label>`;
  }
  if (f.type === 'date') {
    return `<label class="wx-filter">${label}<input type="date" class="wx-input" data-filter-key="${key}" data-match="prefix"></label>`;
  }
  return `<label class="wx-filter">${label}<input class="wx-input" data-filter-key="${key}" placeholder="${esc(f.placeholder || '')}"></label>`;
}

/**
 * list 页唯一骨架。禁 StatRow / ReportHero / 页内大标题 / 自绘筛选栏。
 * 计数放 statusTabs[].count 或 scopeNote；每个非「全部」页签必须带 field + value。
 */
export function ListPage({
  unit = '条', pageSize = 20, statusTabs = [], filters = [], toolbar = [],
  showCount = true, scopeNote = '', columns = [], rows = [], rowAttrs = null,
  emptyTitle = '暂无记录', emptyDesc = '当前筛选条件下没有任何记录。',
} = {}) {
  const tabs = statusTabs.map((t) => {
    const attrs = t.field
      ? ` data-tab-field="${esc(t.field)}" data-tab-value="${esc(t.value ?? '')}"`
      : ' data-tab-all="1"';
    const count = t.count == null ? '' : `<span class="wx-tab-count">${n(t.count)}</span>`;
    return `<button type="button" class="wx-tab${t.active ? ' is-active' : ''}"${attrs}>${esc(t.label)}${count}</button>`;
  }).join('');
  const mainFilters = filters.filter((f) => !f.extra).map(renderFilter).join('');
  const extraFilters = filters.filter((f) => f.extra).map(renderFilter).join('');
  const filterBar = `<div class="wx-filters">${mainFilters}`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-query>查询</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-reset>重置</button></div>`
    + (extraFilters ? `<div class="wx-filters wx-filters--extra" hidden>${extraFilters}</div>`
      + `<button type="button" class="wx-link" data-more>展开全部条件</button>` : '');
  const countNote = showCount
    ? `共 <b data-count>${n(rows.length)}</b> ${esc(unit)}${scopeNote ? `<span class="wx-note-extra">${esc(scopeNote)}</span>` : ''}`
    : esc(scopeNote);
  const table = BaseTable({ columns, rows, rowAttrs, emptyTitle, emptyDesc });
  return `<div class="wx-list" data-page-size="${Number(pageSize) || 20}">`
    + `<div class="wx-tabs">${tabs}</div>`
    + filterBar
    + `<div class="wx-actionbar"><span class="wx-actionbar-note">${countNote}</span>`
    + `<span class="wx-btns">${toolbar.map(renderButton).join('')}</span></div>`
    + table
    + `<div class="wx-pager"><span>每页 ${Number(pageSize) || 20} ${esc(unit)}</span>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-step="-1">上一页</button>`
    + `<span>第 <b data-page-no>1</b> / <span data-total-pages>1</span> 页</span>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-step="1">下一页</button></div>`
    + `</div>`;
}

/** detail 页骨架：抬头字段 → 明细表 → 操作轨迹 → 底部操作条。 */
export function DetailPage({
  docNo = '—', status = '', statusTone = 'info', fields = [],
  columns = [], rows = [], timeline = [], actions = [], note = '',
} = {}) {
  const head = `<div class="wx-detail-head"><b>${esc(docNo)}</b>`
    + (status ? StatusTag(status, statusTone) : '')
    + (note ? `<span class="wx-detail-note">${esc(note)}</span>` : '') + `</div>`;
  const grid = `<div class="wx-detail-grid">${fields.map((f) => `<div class="wx-detail-field">`
    + `<span>${esc(f.label)}</span><b${f.tip ? ` title="${esc(f.tip)}"` : ''}>${dash(f.value)}</b>`
    + `</div>`).join('')}</div>`;
  const table = BaseTable({ columns, rows, emptyTitle: '暂无明细', emptyDesc: '当前单据没有明细行。' });
  const tl = timeline.length
    ? `<div class="wx-block"><div class="wx-block-head">操作轨迹</div><ul class="wx-timeline">`
      + timeline.map((t) => `<li><span>${esc(t.time)}</span><b>${esc(t.text)}</b><span>${esc(t.operator || '')}</span></li>`).join('')
      + `</ul></div>`
    : '';
  const acts = actions.length ? `<div class="wx-detail-actions">${actions.map(renderButton).join('')}</div>` : '';
  return `<div class="wx-detail">${head}${grid}${table}${tl}${acts}</div>`;
}

/** report 页三件套。这类页是唯一允许摆 KPI 的类型。指标值由数据算出，不写死。 */
export function ReportHero({ title = '', sub = '' } = {}) {
  return `<div class="wx-hero"><h1>${esc(title)}</h1><p>${esc(sub)}</p></div>`;
}
export function StatRow(items = [], { cols = 3 } = {}) {
  items.forEach((i) => assertTone('StatRow', i.tone || 'default', STAT_TONES));
  const cards = items.map((i) => `<div class="wx-stat wx-stat--${i.tone || 'default'}">`
    + `<span>${esc(i.label)}</span><b>${n(i.value)}</b>`
    + (i.hint ? `<em${i.tip ? ` title="${esc(i.tip)}"` : ''}>${esc(i.hint)}</em>` : '')
    + `</div>`).join('');
  return `<div class="wx-stat-row" style="grid-template-columns:repeat(${Number(cols) || 3},1fr)">${cards}</div>`;
}
export function Block({ title = '', note = '', body = '' } = {}) {
  return `<div class="wx-block"><div class="wx-block-head"><b>${esc(title)}</b>`
    + `<span>${esc(note)}</span></div><div class="wx-block-body">${body}</div></div>`;
}

/**
 * scan 页骨架：六段固定顺序，一屏只露当前那一个输入。
 * 不要把系统校验序列铺成步骤表——那规定系统拦什么、留什么证，不是人的操作步骤。
 * 基准 375px，不用 rpx，触控目标 >= 44px（见 BASE_CSS 的 .wx-device 规则）。
 */
export function ScanPage({
  process = '作业', docNo = '—', state = '待作业', stateTone = 'pending',
  operator = '', device = '', location = '',
  scanLabel = '扫描商品条码', scanHint = '对准条码扫描', scanThen = '',
  line = null, planQty = 0, doneQty = 0, thisTime = 0, qtyUnit = '件',
  logs = [], primary = '确认', next = '下一件',
} = {}) {
  const p = Number(planQty || 0);
  const d = Number(doneQty || 0);
  const t = Number(thisTime || 0);
  const pct = p ? Math.min(100, Math.round(((d + t) / p) * 100)) : 0;
  const nav = `<div class="wx-scan-nav"><button type="button" class="wx-scan-back" data-toast="返回上一屏（原型示意）" aria-label="返回">‹</button>`
    + `<b>${esc(process)}</b>${StatusTag(state, stateTone)}</div>`;
  const ctx = `<div class="wx-scan-ctx"><b>${esc(docNo)}</b>`
    + `<span>${esc(operator)} · ${esc(device)}${location ? ' · ' + esc(location) : ''}</span></div>`;
  const input = `<div class="wx-scan-input"><label>${esc(scanLabel)}</label>`
    + `<div class="wx-scan-field"><span aria-hidden="true">▣</span>`
    + `<input inputmode="text" autocomplete="off" placeholder="${esc(scanHint)}">`
    + `<button type="button" data-toast="扫码录入（原型示意）">扫</button></div>`
    + (scanThen ? `<p>下一步：${esc(scanThen)}</p>` : '') + `</div>`;
  const lineCard = line ? `<div class="wx-scan-line"><span>第 ${esc(line.lineNo)} 行 · ${esc(line.fromLocation || '')}</span>`
    + `<b>${esc(line.skuName)}</b><span>${esc(line.skuCode)} · 批次 ${esc(line.batchNo)}</span>`
    + `<div>本行应做 <b>${esc(line.planQty)}</b> ${esc(line.unit || qtyUnit)} · 已做 ${esc(line.doneQty)}</div></div>` : '';
  const qty = `<div class="wx-scan-qty"><div><span>本次</span><b>${t || '—'}</b><em>${esc(qtyUnit)}</em></div>`
    + `<span class="wx-progress-track"><i style="width:${pct}%"></i></span>`
    + `<div class="wx-scan-qty-foot"><span>应做 ${n(p)}</span><span>已做 ${n(d)}</span>`
    + `<span>剩余 ${n(Math.max(p - d - t, 0))}</span></div></div>`;
  const shown = logs.slice(0, 3);
  const log = shown.length ? `<div class="wx-scan-log"><span>本次采集 ${shown.length} 条</span><ul>`
    + shown.map((l) => `<li><span>${esc(l.time)}</span><b>${esc(l.text)}</b><span>${esc(l.qty)}</span></li>`).join('')
    + `</ul></div>` : '';
  const actions = `<div class="wx-scan-actions">`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-toast="下一件（原型示意）">${esc(next)}</button>`
    + `<button type="button" class="wx-btn wx-btn--primary" data-toast="确认（原型示意）">${esc(primary)}</button></div>`;
  return `<div class="wx-device"><div class="wx-device-screen">${nav}${ctx}${input}${lineCard}${qty}${log}${actions}</div></div>`;
}

/* ---------------- 基础样式（只放结构，不放色值） ---------------- */

export const BASE_CSS = `
.wx-top{height:var(--wx-top-h);display:flex;align-items:center;gap:var(--wx-sp-4);padding:0 var(--wx-sp-6);background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-top b{font-size:var(--wx-fs-lg)}
.wx-top .wx-subject{color:var(--wx-gray-500);font-size:var(--wx-fs-sm)}
.wx-top .wx-edition{color:var(--wx-gray-500);font-size:var(--wx-fs-xs);border:var(--wx-border);border-radius:var(--wx-r-pill);padding:2px var(--wx-sp-2)}
.wx-top .wx-current{margin-left:auto;font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-scope{display:flex;align-items:center;gap:var(--wx-sp-2)}
.wx-scope[hidden]{display:none !important}
.wx-modules{display:flex;gap:var(--wx-sp-1);padding:var(--wx-sp-2) var(--wx-sp-6);background:var(--wx-white);border-bottom:var(--wx-border);font-size:var(--wx-fs-sm)}
.wx-modules span{padding:var(--wx-sp-1) var(--wx-sp-3);border-radius:var(--wx-r-sm);color:var(--wx-gray-500)}
.wx-modules span.is-current{background:var(--wx-primary-50);color:var(--wx-primary-600);font-weight:600}
.wx-layout{display:flex;min-height:calc(100vh - var(--wx-top-h) - 40px)}
.wx-side{width:var(--wx-side-w);flex:0 0 var(--wx-side-w);background:var(--wx-white);border-right:var(--wx-border);padding:var(--wx-sp-4) var(--wx-sp-2)}
.wx-side-title{padding:0 var(--wx-sp-3) var(--wx-sp-3);font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-side-item{display:block;width:100%;text-align:left;border:0;background:transparent;padding:var(--wx-sp-2) var(--wx-sp-3);border-radius:var(--wx-r-sm);font-size:var(--wx-fs-md);color:var(--wx-gray-700)}
.wx-side-item:hover{background:var(--wx-gray-50)}
.wx-side-item.is-active{background:var(--wx-primary-50);color:var(--wx-primary-600);font-weight:600}
.wx-main{flex:1;min-width:0;padding:var(--wx-sp-6)}
.page{display:none}
.page:not([hidden]){display:block}
.page[hidden]{display:none !important}
.wx-tabs{display:flex;gap:var(--wx-sp-1);border-bottom:var(--wx-border);margin-bottom:var(--wx-sp-4)}
.wx-tab{border:0;background:transparent;padding:var(--wx-sp-2) var(--wx-sp-4);font-size:var(--wx-fs-md);color:var(--wx-gray-500);border-bottom:2px solid transparent}
.wx-tab.is-active{color:var(--wx-primary-600);border-bottom-color:var(--wx-primary-500);font-weight:600}
.wx-tab-count{margin-left:var(--wx-sp-1);font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-filters{display:flex;flex-wrap:wrap;align-items:center;gap:var(--wx-sp-3);margin-bottom:var(--wx-sp-3)}
.wx-filter{display:flex;align-items:center;gap:var(--wx-sp-2);font-size:var(--wx-fs-sm)}
.wx-filter-label{color:var(--wx-gray-500)}
.wx-input,.wx-select{border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);padding:var(--wx-sp-2) var(--wx-sp-3);min-height:36px;min-width:160px;font-size:var(--wx-fs-sm)}
.wx-range-sep{color:var(--wx-gray-400)}
.wx-link{border:0;background:transparent;color:var(--wx-primary-600);font-size:var(--wx-fs-sm);padding:0 0 var(--wx-sp-3)}
.wx-actionbar{display:flex;align-items:center;justify-content:space-between;gap:var(--wx-sp-3);margin-bottom:var(--wx-sp-3)}
.wx-actionbar-note{font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-note-extra{margin-left:var(--wx-sp-3)}
.wx-btns{display:flex;gap:var(--wx-sp-2)}
.wx-btn{border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-primary-500);color:var(--wx-white);padding:var(--wx-sp-2) var(--wx-sp-4);min-height:36px;font-size:var(--wx-fs-sm)}
.wx-btn--ghost{background:var(--wx-white);color:var(--wx-gray-700)}
.wx-btn--primary{background:var(--wx-primary-600)}
.wx-table-wrap{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow);overflow-x:auto}
.wx-table{width:100%;border-collapse:collapse;font-size:var(--wx-fs-sm)}
.wx-table th,.wx-table td{padding:var(--wx-sp-3) var(--wx-sp-3);border-bottom:var(--wx-border);text-align:left;white-space:nowrap}
.wx-table th{background:var(--wx-gray-50);color:var(--wx-gray-500);font-weight:600}
.wx-table td.num,.wx-table th.num{text-align:right;font-variant-numeric:tabular-nums}
.wx-table td.wx-col-strong{font-weight:600;color:var(--wx-gray-900)}
.wx-table tr:last-child td{border-bottom:0}
.wx-empty{padding:var(--wx-sp-8);text-align:center;background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);color:var(--wx-gray-500);display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-empty b{color:var(--wx-gray-700)}
.wx-pager{display:flex;align-items:center;justify-content:flex-end;gap:var(--wx-sp-3);padding:var(--wx-sp-4) 0;font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-tag{display:inline-block;padding:2px var(--wx-sp-2);border-radius:var(--wx-r-pill);font-size:var(--wx-fs-xs)}
.wx-tag--disabled{background:var(--wx-gray-100);color:var(--wx-gray-500)}
.wx-tag--enabled{background:var(--wx-success-soft);color:var(--wx-success-500)}
.wx-tag--info{background:var(--wx-info-soft);color:var(--wx-info-500)}
.wx-tag--pending{background:var(--wx-warn-soft);color:var(--wx-warn-500)}
.wx-tag--rejected{background:var(--wx-error-soft);color:var(--wx-error-500)}
.wx-chip{display:inline-block;padding:2px var(--wx-sp-2);border:var(--wx-border);border-radius:var(--wx-r-sm);font-size:var(--wx-fs-xs)}
.wx-chip--danger{color:var(--wx-error-500)}
.wx-chip--info{color:var(--wx-info-500)}
.wx-progress{display:flex;align-items:center;gap:var(--wx-sp-2)}
.wx-progress-track{display:block;flex:1;height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100);overflow:hidden}
.wx-progress-track i{display:block;height:100%;background:var(--wx-primary-500)}
.wx-progress-num{font-variant-numeric:tabular-nums;color:var(--wx-gray-500)}
.wx-detail-head{display:flex;align-items:center;gap:var(--wx-sp-3);margin-bottom:var(--wx-sp-4)}
.wx-detail-head b{font-size:var(--wx-fs-lg)}
.wx-detail-note{font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--wx-sp-4);padding:var(--wx-sp-4);background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);margin-bottom:var(--wx-sp-4)}
.wx-detail-field{display:flex;flex-direction:column;gap:var(--wx-sp-1)}
.wx-detail-field span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-detail-field b{font-size:var(--wx-fs-md);font-weight:600}
.wx-detail-actions{display:flex;justify-content:flex-end;gap:var(--wx-sp-2);margin-top:var(--wx-sp-4)}
.wx-hero{margin-bottom:var(--wx-sp-4)}
.wx-hero h1{font-size:var(--wx-fs-2xl);margin:0 0 var(--wx-sp-1)}
.wx-hero p{margin:0;font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-stat-row{display:grid;gap:var(--wx-sp-4);margin-bottom:var(--wx-sp-4)}
.wx-stat{display:flex;flex-direction:column;gap:var(--wx-sp-1);padding:var(--wx-sp-4);background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow)}
.wx-stat span,.wx-stat em{font-size:var(--wx-fs-xs);color:var(--wx-gray-500);font-style:normal}
.wx-stat b{font-size:var(--wx-fs-xl);font-variant-numeric:tabular-nums}
.wx-stat--alert b{color:var(--wx-error-500)}
.wx-stat--ok b{color:var(--wx-success-500)}
.wx-stat--warn b{color:var(--wx-warn-500)}
.wx-block{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow);margin-bottom:var(--wx-sp-4)}
.wx-block-head{display:flex;justify-content:space-between;align-items:center;padding:var(--wx-sp-3) var(--wx-sp-4);border-bottom:var(--wx-border)}
.wx-block-head b{font-size:var(--wx-fs-md)}
.wx-block-head span{font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-block-body{padding:var(--wx-sp-4)}
.wx-timeline{list-style:none;margin:0;padding:0}
.wx-timeline li{display:flex;gap:var(--wx-sp-4);padding:var(--wx-sp-2) 0;font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-timeline li b{color:var(--wx-gray-700);font-weight:500}
.wx-device{display:flex;justify-content:center;padding:var(--wx-sp-6)}
.wx-device-screen{width:375px;max-width:100%;min-height:640px;background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow);display:flex;flex-direction:column;gap:var(--wx-sp-3);padding:var(--wx-sp-4)}
.wx-scan-nav{display:flex;align-items:center;gap:var(--wx-sp-2);min-height:var(--wx-touch)}
.wx-scan-nav b{flex:1;font-size:var(--wx-fs-lg)}
.wx-scan-back{width:var(--wx-touch);height:var(--wx-touch);border:0;background:transparent;font-size:var(--wx-fs-xl)}
.wx-scan-ctx{display:flex;flex-direction:column;gap:var(--wx-sp-1);padding:var(--wx-sp-3);background:var(--wx-gray-50);border-radius:var(--wx-r-sm)}
.wx-scan-ctx span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-scan-input label{display:block;font-size:var(--wx-fs-sm);color:var(--wx-gray-700);margin-bottom:var(--wx-sp-2)}
.wx-scan-field{display:flex;align-items:center;gap:var(--wx-sp-2)}
.wx-scan-field input{flex:1;min-width:0;min-height:var(--wx-touch);border:var(--wx-border);border-radius:var(--wx-r-sm);padding:0 var(--wx-sp-3)}
.wx-scan-field button{min-width:var(--wx-touch);min-height:var(--wx-touch);border:0;border-radius:var(--wx-r-sm);background:var(--wx-primary-500);color:var(--wx-white)}
.wx-scan-input p{margin:var(--wx-sp-2) 0 0;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-scan-line{display:flex;flex-direction:column;gap:var(--wx-sp-1);padding:var(--wx-sp-3);border:var(--wx-border);border-radius:var(--wx-r-sm)}
.wx-scan-line span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-scan-line b{font-size:var(--wx-fs-md)}
.wx-scan-qty{display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-scan-qty>div:first-child{display:flex;align-items:baseline;gap:var(--wx-sp-2)}
.wx-scan-qty b{font-size:var(--wx-fs-2xl);font-variant-numeric:tabular-nums}
.wx-scan-qty em{font-style:normal;color:var(--wx-gray-500)}
.wx-scan-qty-foot{display:flex;justify-content:space-between;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-scan-log{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-scan-log ul{list-style:none;margin:var(--wx-sp-2) 0 0;padding:0}
.wx-scan-log li{display:flex;gap:var(--wx-sp-2);padding:var(--wx-sp-1) 0}
.wx-scan-log li b{flex:1;font-weight:500;color:var(--wx-gray-700)}
.wx-scan-actions{display:flex;gap:var(--wx-sp-2);margin-top:auto}
.wx-scan-actions .wx-btn{flex:1;min-height:var(--wx-touch)}
.wx-drawer{position:fixed;inset:0;background:var(--wx-gray-900);opacity:.35}
.wx-drawer-panel{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:90vw;background:var(--wx-white);padding:var(--wx-sp-6);overflow:auto}
.wx-toast{position:fixed;left:50%;bottom:var(--wx-sp-8);transform:translateX(-50%);padding:var(--wx-sp-3) var(--wx-sp-4);border-radius:var(--wx-r-sm);background:var(--wx-gray-900);color:var(--wx-white);font-size:var(--wx-fs-sm);box-shadow:var(--wx-shadow)}
@media (max-width:1080px){.wx-main{overflow-x:auto}.wx-detail-grid{grid-template-columns:repeat(2,1fr)}}
`;

/* ---------------- 统一交互脚本（构建内联一份） ---------------- */

export const SHELL_SCRIPT = `
(function(){
  function pages(){ return Array.prototype.slice.call(document.querySelectorAll('.page[data-page-id]')); }
  function currentPage(){ return document.querySelector('.page[data-page-id]:not([hidden])'); }
  function rowData(tr){
    try { return JSON.parse(tr.getAttribute('data-row') || '{}'); } catch(e){ return {}; }
  }
  function setNo(page, v){
    var el = page.querySelector('[data-page-no]');
    if (el) el.textContent = String(v);
  }
  function getNo(page){
    var el = page.querySelector('[data-page-no]');
    return Number(el ? el.textContent : 1) || 1;
  }
  function applyFilters(page){
    var list = page.querySelector('.wx-list');
    if (!list) return;
    var size = Number(list.getAttribute('data-page-size')) || 20;
    var pageNo = getNo(page);
    var tab = page.querySelector('.wx-tab.is-active');
    var field = tab ? (tab.getAttribute('data-tab-field') || '') : '';
    var value = tab ? (tab.getAttribute('data-tab-value') || '') : '';
    var inputs = Array.prototype.slice.call(page.querySelectorAll('[data-filter-key]'));
    var ranges = Array.prototype.slice.call(page.querySelectorAll('[data-range-key]'));
    var ownerSel = document.querySelector('.wx-owner-select');
    var owner = ownerSel ? ownerSel.value : '全部';
    var scoped = page.getAttribute('data-owner-scoped') === 'true';
    var trs = Array.prototype.slice.call(page.querySelectorAll('tbody tr[data-row-idx]'));
    var matched = 0;
    trs.forEach(function(tr){
      var r = rowData(tr);
      var ok = true;
      if (field) {
        var cell = r[field] == null ? '' : String(r[field]);
        if (cell !== value) ok = false;
      }
      inputs.forEach(function(el){
        var k = el.getAttribute('data-filter-key');
        var v = (el.value || '').trim();
        if (!k || !v || v === '全部') return;
        var c = r[k] == null ? '' : String(r[k]);
        if (el.getAttribute('data-match') === 'prefix') {
          if (c.indexOf(v) !== 0) ok = false;
        } else if (el.tagName === 'SELECT') {
          if (c !== v) ok = false;
        } else if (c.indexOf(v) === -1) ok = false;
      });
      ranges.forEach(function(el){
        var k = el.getAttribute('data-range-key');
        var v = (el.value || '').trim();
        if (!k || !v) return;
        var c = r[k] == null ? '' : String(r[k]).slice(0, 10);
        if (el.getAttribute('data-range-side') === 'from' && c < v) ok = false;
        if (el.getAttribute('data-range-side') === 'to' && c > v) ok = false;
      });
      if (scoped && owner !== '全部' && (tr.getAttribute('data-owner') || '') !== owner) ok = false;
      var idx = matched;
      if (ok) matched++;
      tr.hidden = !(ok && idx >= (pageNo - 1) * size && idx < pageNo * size);
    });
    var count = page.querySelector('[data-count]');
    if (count) count.textContent = String(matched);
    var total = page.querySelector('[data-total-pages]');
    var maxPage = Math.max(1, Math.ceil(matched / size));
    if (total) total.textContent = String(maxPage);
    if (pageNo > maxPage) { pageNo = maxPage; setNo(page, pageNo); }
    var empty = page.querySelector('.wx-empty');
    if (empty) empty.hidden = matched !== 0;
  }
  function activate(id){
    pages().forEach(function(p){ p.hidden = p.getAttribute('data-page-id') !== id; });
    Array.prototype.slice.call(document.querySelectorAll('.wx-side-item')).forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-target') === id);
    });
    var scope = document.querySelector('.wx-scope');
    var page = currentPage();
    if (scope) scope.hidden = !(page && page.getAttribute('data-owner-scoped') === 'true');
    if (page) { setNo(page, 1); applyFilters(page); }
  }
  function toast(text){
    var t = document.querySelector('.wx-toast');
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    window.setTimeout(function(){ t.hidden = true; }, 2200);
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest('button, [data-toast]') : null;
    if (!el) return;
    if (el.hasAttribute('data-confirm') && !window.confirm(el.getAttribute('data-confirm'))) return;
    if (el.hasAttribute('data-target')) { activate(el.getAttribute('data-target')); return; }
    if (el.classList.contains('wx-tab')) {
      var group = el.parentNode;
      Array.prototype.slice.call(group.querySelectorAll('.wx-tab')).forEach(function(t){ t.classList.remove('is-active'); });
      el.classList.add('is-active');
      var page = currentPage();
      if (page) { setNo(page, 1); applyFilters(page); }
      return;
    }
    if (el.hasAttribute('data-step')) {
      var p = currentPage();
      if (!p) return;
      var total = Number((p.querySelector('[data-total-pages]') || {}).textContent || 1) || 1;
      var next = Math.min(total, Math.max(1, getNo(p) + Number(el.getAttribute('data-step'))));
      setNo(p, next); applyFilters(p);
      return;
    }
    if (el.hasAttribute('data-query')) {
      var q = currentPage();
      if (q) { setNo(q, 1); applyFilters(q); }
      return;
    }
    if (el.hasAttribute('data-reset')) {
      var r = currentPage();
      if (!r) return;
      Array.prototype.slice.call(r.querySelectorAll('[data-filter-key],[data-range-key]')).forEach(function(i){ i.value = ''; });
      var sel = document.querySelector('.wx-owner-select');
      if (sel) sel.value = '全部';
      setNo(r, 1); applyFilters(r);
      return;
    }
    if (el.hasAttribute('data-more')) {
      var extra = document.querySelector('.wx-filters--extra');
      if (extra) { extra.hidden = !extra.hidden; el.textContent = extra.hidden ? '展开全部条件' : '收起条件'; }
      return;
    }
    if (el.hasAttribute('data-toast')) { toast(el.getAttribute('data-toast')); return; }
    if (el.hasAttribute('data-drawer-close')) {
      var ov = document.querySelector('.wx-overlay');
      if (ov) ov.hidden = true;
      return;
    }
    if (el.hasAttribute('data-drawer-open')) {
      var ov2 = document.querySelector('.wx-overlay');
      if (ov2) ov2.hidden = false;
    }
  });
  document.addEventListener('change', function(e){
    var el = e.target;
    if (el.hasAttribute('data-filter-key') || el.hasAttribute('data-range-key') || el.classList.contains('wx-owner-select')) {
      var page = currentPage();
      if (page) { setNo(page, 1); applyFilters(page); }
    }
  });
  var first = document.querySelector('.wx-side-item');
  if (first) activate(first.getAttribute('data-target'));
})();
`;
