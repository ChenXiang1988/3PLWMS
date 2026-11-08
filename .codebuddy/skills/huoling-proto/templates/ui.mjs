/**
 * 共享组件与基础样式（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/shared/ui.mjs。
 *       页面模块从 ../../shared/ui.mjs 引入，只写 columns / rows / filters / toolbar，
 *       结构一律交给这里；交互一律由 data-* 属性驱动，由 SHELL_SCRIPT 统一处理。
 *
 * 本文件与 tokens.css.mjs 组成「实现层」：这里只放结构，不放色值。
 * 样式里出现任何 hex 都是错误——取值只在 tokens.css.mjs。
 *
 * 组件白名单见 references/implementation.md 第 3 节，骨架约束见 references/shells/ 对应外壳一卷。
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
  card = null, bare = false, before = '', body = '', live = null,
  emptyTitle = '暂无记录', emptyDesc = '当前筛选条件下没有任何记录。',
} = {}) {
  const liveAttr = live ? ` data-live="${esc(JSON.stringify(live))}"` : '';
  const tabs = statusTabs.map((t) => {
    const attrs = t.field
      ? ` data-tab-field="${esc(t.field)}" data-tab-value="${esc(t.value ?? '')}"`
      : ' data-tab-all="1"';
    const count = t.count == null ? '' : `<span class="wx-tab-count">${n(t.count)}</span>`;
    return `<button type="button" class="wx-tab${t.active ? ' is-active' : ''}"${attrs}>${esc(t.label)}${count}</button>`;
  }).join('');
  const tabBar = statusTabs.length > 1 ? `<div class="wx-tabs">${tabs}</div>` : '';
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
  const table = body || (card
    ? `<div class="wx-list-cards">${rows.map((r, i) => card(r, i)).join('')}</div>`
      + `<div class="wx-empty" hidden><b>${esc(emptyTitle)}</b><span>${esc(emptyDesc)}</span></div>`
    : BaseTable({ columns, rows, rowAttrs, emptyTitle, emptyDesc }));
  if (bare) return `<div class="wx-list" data-page-size="${Number(pageSize) || 20}"${liveAttr}>${before}${table}</div>`;
  return `<div class="wx-list" data-page-size="${Number(pageSize) || 20}"${liveAttr}>`
    + tabBar
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

/** 列表行的下钻入口。按钮由组件出，页面模块不拼 HTML。 */
export function DrawerButton({ label = '查看详情', pageId = '', rowKey = '', formRow = '' } = {}) {
  const extra = formRow ? ` data-form-row="${esc(formRow)}"` : '';
  return `<button type="button" class="wx-link" data-drawer-open="${esc(pageId)}" data-drawer-key="${esc(rowKey)}"${extra}>${esc(label)}</button>`;
}

/** 行下钻详情面板。由 renderPage 作为 overlay 返回，构建挂到 body 末尾，不随页面显隐。 */
export function DrawerDetail({
  pageId = '', rowKey = '', title = '', docNo = '—', status = '', statusTone = 'info',
  fields = [], columns = [], rows = [], timeline = [], actions = [],
} = {}) {
  const detail = DetailPage({ docNo, status, statusTone, fields, columns, rows, timeline, actions: [] });
  const acts = actions.length ? `<div class="wx-drawer-actions">${actions.map(renderButton).join('')}</div>` : '';
  return `<div class="wx-drawer-panel" data-drawer-panel="${esc(pageId)}" data-drawer-key="${esc(rowKey)}" hidden>`
    + `<div class="wx-drawer-head"><b>${esc(title)}</b>`
    + `<button type="button" class="wx-drawer-x" data-drawer-close aria-label="关闭">×</button></div>`
    + `<div class="wx-drawer-body">${detail}</div>`
    + acts
    + `</div>`;
}

/** 表单字段：结构只在实现层出，页面模块只给声明。 */
export function FormField(f = {}) {
  const key = esc(f.key || '');
  const label = esc(f.label || '');
  const required = f.required ? ` data-form-required="${label}"` : '';
  const placeholder = esc(f.placeholder || '');
  const value = esc(f.value ?? '');
  const ro = f.readonly ? ' readonly' : '';
  let control;
  if (f.type === 'select') {
    const opts = (f.options || []).map((o) => {
      const label = typeof o === 'string' ? o : o.label;
      const v = typeof o === 'string' ? o : (o.value ?? o.label);
      return `<option value="${esc(v)}"${String(f.value ?? '') === String(v) ? ' selected' : ''}>${esc(label)}</option>`;
    }).join('');
    control = `<select class="wx-select" data-form-key="${key}"${required}><option value="">请选择</option>${opts}</select>`;
  } else if (f.type === 'textarea') {
    control = `<textarea class="wx-input wx-textarea" data-form-key="${key}"${required}${ro} placeholder="${placeholder}">${value}</textarea>`;
  } else if (f.type === 'checks') {
    const groups = new Map();
    (f.options || []).forEach((o) => {
      const opt = typeof o === 'string' ? { label: o, value: o } : o;
      const g = opt.group || '';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(opt);
    });
    const selected = String(f.value ?? '').split(/[、,，]/).map((s) => s.trim());
    const groupHtml = [...groups.entries()].map(([g, opts]) => {
      const items = opts.map((o) => {
        const v = String(o.value ?? o.label);
        const checked = selected.includes(v) ? ' checked' : '';
        return `<label class="wx-check"><input type="checkbox" data-form-check="${key}" value="${esc(v)}"${checked}><span>${esc(o.label)}</span></label>`;
      }).join('');
      return `<div class="wx-check-group">${g ? `<b>${esc(g)}</b>` : ''}<div class="wx-check-items">${items}</div></div>`;
    }).join('');
    control = `<div class="wx-checks" data-form-check-group="${key}"${required}>${groupHtml}</div>`;
  } else {
    const t = ['number', 'date'].includes(f.type) ? f.type : 'text';
    control = `<input class="wx-input" type="${t}" data-form-key="${key}"${required}${ro} value="${value}" placeholder="${placeholder}">`;
  }
  const tag = f.type === 'checks' ? 'div' : 'label';
  return `<${tag} class="wx-form-field"><span>${label}${f.required ? '<i>*</i>' : ''}</span>${control}</${tag}>`;
}

/** 表单抽屉：作为 renderPage 的 overlay 返回，不注册独立页面与骨架类型。 */
export function FormDrawer({
  pageId = '', rowKey = '__new__', title = '', fields = [], groups = [], actions = [], note = '',
} = {}) {
  const sections = groups.length ? groups : [{ title: '', fields }];
  const body = sections.map((g) => {
    const inner = (g.fields || []).map(FormField).join('');
    const head = g.title ? `<div class="wx-form-group-title">${esc(g.title)}</div>` : '';
    return `<div class="wx-form-group">${head}<div class="wx-form-grid">${inner}</div></div>`;
  }).join('');
  const acts = actions.length ? `<div class="wx-drawer-actions">${actions.map(renderButton).join('')}</div>` : '';
  return `<div class="wx-drawer-panel" data-drawer-panel="${esc(pageId)}" data-drawer-key="${esc(rowKey)}" hidden>`
    + `<div class="wx-drawer-head"><b>${esc(title)}</b>`
    + `<button type="button" class="wx-drawer-x" data-drawer-close aria-label="关闭">×</button></div>`
    + `<div class="wx-drawer-body"><div class="wx-form" data-form-panel="${esc(pageId)}">`
    + (note ? `<p class="wx-form-note">${esc(note)}</p>` : '')
    + body + `</div></div>`
    + acts
    + `</div>`;
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
  process = '作业', docNo = '—', refNo = '', state = '待作业', stateTone = 'pending',
  owner = '', operator = '', device = '', location = '',
  scanLabel = '扫描商品条码', scanHint = '对准条码扫描', scanThen = '',
  line = null, planQty = 0, doneQty = 0, thisTime = 0, qtyUnit = '件',
  logs = [], primary = '确认', next = '下一件',
} = {}) {
  const p = Number(planQty || 0);
  const d = Number(doneQty || 0);
  const t = Number(thisTime || 0);
  const pct = p ? Math.min(100, Math.round(((d + t) / p) * 100)) : 0;
  const ownerName = owner || (line && line.owner) || '';
  const ctxLine = [ownerName, operator, device, location].filter(Boolean).join(' · ');
  const lineInfo = line
    ? [ownerName, line.skuCode, line.batchNo ? `批次 ${line.batchNo}` : ''].filter(Boolean).join(' · ')
    : '';
  const nav = `<div class="wx-scan-nav"><button type="button" class="wx-scan-back" data-toast="返回上一屏（原型示意）" aria-label="返回">‹</button>`
    + `<b>${esc(process)}</b>${StatusTag(state, stateTone)}</div>`;
  const ctx = `<div class="wx-scan-ctx"><b>${esc(docNo)}</b>`
    + (refNo ? `<em>${esc(refNo)}</em>` : '')
    + `<span>${esc(ctxLine)}</span></div>`;
  const input = `<div class="wx-scan-input"><label>${esc(scanLabel)}</label>`
    + `<div class="wx-scan-field"><span aria-hidden="true">▣</span>`
    + `<input inputmode="text" autocomplete="off" placeholder="${esc(scanHint)}">`
    + `<button type="button" data-toast="扫码录入（原型示意）">扫</button></div>`
    + (scanThen ? `<p>下一步：${esc(scanThen)}</p>` : '') + `</div>`;
  const lineCard = line ? `<div class="wx-scan-line"><span>第 ${esc(line.lineNo)} 行 · ${esc(line.fromLocation || '')}</span>`
    + `<b>${esc(line.skuName)}</b><span>${esc(lineInfo)}</span>`
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
.wx-app{height:100vh;overflow:hidden;background:var(--wx-gray-50)}
.wx-top{position:fixed;top:0;left:0;right:0;height:var(--wx-top-h);z-index:100;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:var(--wx-sp-6);padding:0 var(--wx-sp-6);background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-brand{display:flex;align-items:center;gap:var(--wx-sp-2)}
.wx-brand-mark{width:32px;height:32px;display:grid;place-items:center;border-radius:var(--wx-r-md);background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:var(--wx-fs-lg)}
.wx-brand-copy{display:flex;flex-direction:column;line-height:1.2}
.wx-brand-copy b{font-size:var(--wx-fs-lg)}
.wx-brand-copy small{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-global-search{display:flex;align-items:center;max-width:420px;height:36px;padding:0 var(--wx-sp-3);border:var(--wx-border);border-radius:var(--wx-r-pill);background:var(--wx-white)}
.wx-global-search input{flex:1;min-width:0;border:0;outline:none;background:transparent;font:inherit;font-size:var(--wx-fs-sm)}
.wx-top-tools{display:flex;align-items:center;gap:var(--wx-sp-1)}
.wx-top-tool{height:32px;padding:0 var(--wx-sp-2);border:0;background:transparent;border-radius:var(--wx-r-sm);font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-top-tool:hover{background:var(--wx-gray-50);color:var(--wx-gray-900)}
.wx-top-mall{display:inline-flex;align-items:center;height:32px;padding:0 var(--wx-sp-3);border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);font-size:var(--wx-fs-sm);font-weight:600;color:var(--wx-primary-600);text-decoration:none;white-space:nowrap}
.wx-top-mall:hover{background:var(--wx-primary-50)}
.wx-user{display:flex;align-items:center;gap:var(--wx-sp-2);padding:var(--wx-sp-1) var(--wx-sp-2);border-radius:var(--wx-r-sm);font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-user-avatar{width:26px;height:26px;display:grid;place-items:center;border-radius:var(--wx-r-pill);background:var(--wx-primary-500);color:var(--wx-white);font-size:var(--wx-fs-xs);font-weight:600}
.wx-shell{display:flex;margin-top:var(--wx-top-h);height:calc(100vh - var(--wx-top-h))}
.wx-side{position:fixed;top:var(--wx-top-h);left:0;bottom:0;width:var(--wx-side-w);z-index:90;display:flex;flex-direction:column;background:var(--wx-white);border-right:var(--wx-border);transition:width .2s}
.wx-app.is-collapsed .wx-side{width:var(--wx-side-collapsed)}
.wx-side-scroll{flex:1;overflow-y:auto;overflow-x:hidden;padding:var(--wx-sp-2)}
.wx-nav-group + .wx-nav-group{margin-top:var(--wx-sp-1);padding-top:var(--wx-sp-1);border-top:var(--wx-border)}
.wx-nav-item{display:flex;align-items:center;width:100%;gap:var(--wx-sp-2);min-height:var(--wx-touch);padding:0 var(--wx-sp-2);border:0;background:transparent;border-radius:var(--wx-r-sm);text-align:left;font-size:var(--wx-fs-md);font-weight:600;color:var(--wx-gray-700)}
.wx-nav-item:hover{background:var(--wx-gray-50)}
.wx-nav-item.is-current{color:var(--wx-primary-600);background:var(--wx-primary-50)}
.wx-nav-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wx-nav-chevron{color:var(--wx-gray-400);font-size:var(--wx-fs-xs)}
.wx-nav-item[aria-expanded="true"] .wx-nav-chevron{transform:rotate(180deg)}
.wx-nav-children{padding:var(--wx-sp-1) 0 var(--wx-sp-2)}
.wx-nav-children[hidden]{display:none !important}
.wx-side-item{display:block;width:100%;min-height:38px;padding:var(--wx-sp-2) var(--wx-sp-3) var(--wx-sp-2) var(--wx-sp-8);text-align:left;border:0;background:transparent;border-radius:var(--wx-r-sm);font-size:var(--wx-fs-sm);color:var(--wx-gray-700);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wx-side-item:hover{background:var(--wx-gray-50)}
.wx-side-item.is-active{background:var(--wx-primary-50);color:var(--wx-primary-600);font-weight:600}
.wx-side-footer{display:flex;justify-content:flex-end;padding:var(--wx-sp-2);border-top:var(--wx-border)}
.wx-side-toggle{width:32px;height:32px;display:grid;place-items:center;border:0;background:transparent;border-radius:var(--wx-r-sm);color:var(--wx-gray-500)}
.wx-app.is-collapsed .wx-nav-label,.wx-app.is-collapsed .wx-nav-chevron,.wx-app.is-collapsed .wx-nav-children{display:none}
.wx-app.is-collapsed .wx-nav-item{justify-content:center;padding:0}
.wx-app.is-collapsed .wx-nav-group + .wx-nav-group{border-top:0}
.wx-main{flex:1;margin-left:var(--wx-side-w);display:flex;flex-direction:column;min-width:0;min-height:0;transition:margin-left .2s}
.wx-app.is-collapsed .wx-main{margin-left:var(--wx-side-collapsed)}
.wx-page-header{position:relative;z-index:10;flex:0 0 auto;display:flex;align-items:center;gap:var(--wx-sp-6);min-height:var(--wx-head-h);padding:0 var(--wx-sp-6);background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-head-tabs{display:flex;align-items:center;flex:1;min-width:0;flex-wrap:wrap;column-gap:var(--wx-sp-6)}
.wx-head-tabs[hidden]{display:none !important}
.wx-head-tab{position:relative;min-height:var(--wx-head-h);border:0;background:transparent;padding:0 2px;font-size:var(--wx-fs-md);color:var(--wx-gray-700);white-space:nowrap}
.wx-head-tab:hover{color:var(--wx-primary-600)}
.wx-head-tab.is-active{color:var(--wx-primary-600);font-weight:700}
.wx-head-tab.is-active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:3px;background:var(--wx-primary-500);border-radius:3px 3px 0 0}
.wx-scope{display:flex;align-items:center;gap:var(--wx-sp-2);flex:0 0 auto;font-size:var(--wx-fs-sm);color:var(--wx-gray-500);white-space:nowrap}
.wx-scope[hidden]{display:none !important}
.wx-scope select{height:32px;padding:0 var(--wx-sp-2);border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);font-size:var(--wx-fs-sm)}
.wx-page-body{flex:1;min-height:0;overflow:auto;padding:var(--wx-sp-6);background:var(--wx-gray-50)}
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
.wx-block .wx-table-wrap{border:0;border-radius:0;box-shadow:none}
.wx-timeline{list-style:none;margin:0;padding:0}
.wx-timeline li{display:flex;gap:var(--wx-sp-4);padding:var(--wx-sp-2) 0;font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-timeline li b{color:var(--wx-gray-700);font-weight:500}
.wx-device{display:flex;justify-content:center;padding:var(--wx-sp-6)}
.wx-device-screen{width:375px;max-width:100%;min-height:640px;background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow);display:flex;flex-direction:column;gap:var(--wx-sp-3);padding:var(--wx-sp-4)}
.wx-scan-nav{display:flex;align-items:center;gap:var(--wx-sp-2);min-height:var(--wx-touch)}
.wx-scan-nav b{flex:1;font-size:var(--wx-fs-lg)}
.wx-scan-back{width:var(--wx-touch);height:var(--wx-touch);border:0;background:transparent;font-size:var(--wx-fs-xl)}
.wx-scan-ctx{display:flex;flex-direction:column;gap:var(--wx-sp-1);padding:var(--wx-sp-3);background:var(--wx-gray-50);border-radius:var(--wx-r-sm)}
.wx-scan-ctx em{font-style:normal;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
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
.wx-overlay[hidden]{display:none !important}
.wx-drawer{position:fixed;inset:0;border:0;padding:0;cursor:pointer;background:var(--wx-gray-900);opacity:.35}
.wx-drawer-panel{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:90vw;background:var(--wx-white);padding:var(--wx-sp-6);overflow:auto;box-shadow:var(--wx-shadow);z-index:1}
.wx-drawer-panel[hidden]{display:none !important}
.wx-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:var(--wx-sp-2);margin-bottom:var(--wx-sp-4);font-size:var(--wx-fs-lg)}
.wx-drawer-x{width:32px;height:32px;border:0;background:transparent;border-radius:var(--wx-r-sm);color:var(--wx-gray-500);font-size:var(--wx-fs-lg)}
.wx-drawer-body .wx-detail-grid{grid-template-columns:repeat(2,1fr)}
.wx-drawer-actions{display:flex;justify-content:flex-end;gap:var(--wx-sp-2);margin-top:var(--wx-sp-4)}
.wx-toast{position:fixed;left:50%;bottom:var(--wx-sp-8);transform:translateX(-50%);padding:var(--wx-sp-3) var(--wx-sp-4);border-radius:var(--wx-r-sm);background:var(--wx-gray-900);color:var(--wx-white);font-size:var(--wx-fs-sm);box-shadow:var(--wx-shadow)}
@media (max-width:1080px){.wx-page-body{overflow-x:auto}.wx-detail-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:900px){.wx-global-search{display:none}}
.wx-form{display:flex;flex-direction:column;gap:var(--wx-sp-4)}
.wx-form-note{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-form-group-title{font-size:var(--wx-fs-sm);color:var(--wx-gray-700);margin-bottom:var(--wx-sp-2);padding-bottom:var(--wx-sp-1);border-bottom:var(--wx-border)}
.wx-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--wx-sp-3)}
.wx-form-field{display:flex;flex-direction:column;gap:var(--wx-sp-1);min-width:0;font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-form-field>span i{font-style:normal;color:var(--wx-error-500)}
.wx-form-field .wx-input,.wx-form-field .wx-select{min-height:var(--wx-touch);width:100%;border:var(--wx-border);border-radius:var(--wx-r-sm);padding:0 var(--wx-sp-3);font-size:var(--wx-fs-md)}
.wx-form-field .wx-textarea{min-height:80px;padding:var(--wx-sp-2) var(--wx-sp-3);resize:vertical}
.wx-form-field .wx-input:focus,.wx-form-field .wx-select:focus,.wx-form-field .wx-textarea:focus{outline:2px solid var(--wx-primary-500);outline-offset:1px}
.wx-form-field [readonly]{background:var(--wx-gray-50);color:var(--wx-gray-500)}
.wx-form-field:has(.wx-checks){grid-column:1/-1}
.wx-checks{display:flex;flex-direction:column;gap:var(--wx-sp-2);width:100%}
.wx-check-group{display:flex;flex-direction:column;gap:var(--wx-sp-1)}
.wx-check-group>b{font-size:var(--wx-fs-xs);color:var(--wx-gray-500);font-weight:500}
.wx-check-items{display:flex;flex-wrap:wrap;gap:var(--wx-sp-2) var(--wx-sp-3)}
.wx-check{display:inline-flex;align-items:center;gap:var(--wx-sp-1);font-size:var(--wx-fs-sm);color:var(--wx-gray-700);min-height:24px}
.wx-check input{width:16px;height:16px;accent-color:var(--wx-primary-500)}
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
    var scoped = page.getAttribute('data-owner-scoped') === 'true';
    var owner = '全部';
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
  function activeView(){
    return document.documentElement.getAttribute('data-owner-view') || '';
  }
  function applyOwnerView(ov, notify){
    document.documentElement.setAttribute('data-owner-view', ov || '');
    var sessionUser = document.querySelector('[data-session-user]');
    if (sessionUser && ov) sessionUser.textContent = ov;
    var topUser = document.querySelector('[data-top-user]');
    if (topUser && ov) topUser.textContent = ov;
    var topAvatar = document.querySelector('[data-top-avatar]');
    if (topAvatar && ov) topAvatar.textContent = ov.slice(0, 1);
    var mallLink = document.querySelector('[data-mall-entry]');
    if (mallLink) {
      var base = mallLink.getAttribute('data-mall-base') || '';
      mallLink.setAttribute('href', base + '?owner=' + encodeURIComponent(ov || ''));
    }
    if (notify) {
      var cur = currentPage();
      var id = cur ? cur.getAttribute('data-page-id') : (location.hash || '').replace('#','');
      if (id) activate(id, false);
    }
  }
  function activate(id, push){
    var hit = null;
    var view = activeView();
    pages().forEach(function(p){
      var on = p.getAttribute('data-page-id') === id
        && (p.getAttribute('data-owner-view') || '') === view;
      p.hidden = !on;
      if (on) hit = p;
    });
    if (!hit) return;
    closeDrawer();
    var groupId = hit.getAttribute('data-nav-group') || id.split('/')[0];
    Array.prototype.slice.call(document.querySelectorAll('.wx-side-item')).forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-target') === id);
    });
    Array.prototype.slice.call(document.querySelectorAll('.wx-nav-item')).forEach(function(b){
      var on = b.getAttribute('data-nav') === groupId;
      b.classList.toggle('is-current', on);
      b.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    Array.prototype.slice.call(document.querySelectorAll('.wx-nav-children')).forEach(function(box){
      box.hidden = box.getAttribute('data-children') !== groupId;
    });
    Array.prototype.slice.call(document.querySelectorAll('.wx-head-tabs')).forEach(function(row){
      row.hidden = row.getAttribute('data-tabs') !== groupId;
      if (!row.hidden) {
        Array.prototype.slice.call(row.querySelectorAll('.wx-head-tab')).forEach(function(b){
          b.classList.toggle('is-active', b.getAttribute('data-target') === id);
        });
      }
    });
    var scope = document.querySelector('.wx-scope');
    if (scope) scope.hidden = hit.getAttribute('data-owner-scoped') !== 'true';
    setNo(hit, 1); applyFilters(hit);
    if (push !== false) { try { location.hash = id; } catch(e){} }
  }
  function escText(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function liveCfg(page){
    var list = page ? page.querySelector('.wx-list[data-live]') : null;
    if (!list) return null;
    try { return JSON.parse(list.getAttribute('data-live') || 'null'); } catch(e){ return null; }
  }
  function stateKey(page, cfg){
    return 'wx-live-' + page.getAttribute('data-page-id') + '-' + (activeView() || 'all') + '-' + (cfg.storageKey || 'rows');
  }
  function readRows(page, cfg){
    try {
      var saved = window.sessionStorage.getItem(stateKey(page, cfg));
      if (saved) { var arr = JSON.parse(saved); if (Object.prototype.toString.call(arr) === '[object Array]') return arr; }
    } catch(e){}
    var out = [];
    Array.prototype.slice.call(page.querySelectorAll('tbody tr[data-row-idx]')).forEach(function(tr){ out.push(rowData(tr)); });
    return out;
  }
  function saveRows(page, cfg, rows){
    try { window.sessionStorage.setItem(stateKey(page, cfg), JSON.stringify(rows)); } catch(e){}
  }
  function liveCell(r, c, cfg, pageId){
    var v = r[c.key];
    if (c.type === 'status') {
      var m = (cfg.statusMeta || {})[String(v == null ? '' : v)] || { label: (v == null || v === '') ? '—' : v, tone: 'info' };
      return '<span class="wx-tag wx-tag--' + m.tone + '">' + escText(m.label) + '</span>';
    }
    if (c.type === 'tag') return '<span class="wx-chip wx-chip--info">' + escText(v == null || v === '' ? '—' : v) + '</span>';
    if (c.type === 'risk') {
      var rm = (c.riskMeta || {})[String(v == null ? '' : v)] || { label: (v == null || v === '') ? '—' : v, tone: 'info' };
      return '<span class="wx-tag wx-tag--' + rm.tone + '">' + escText(rm.label) + '</span>';
    }
    if (c.type === 'money') return v == null || v === '' ? '—' : '￥' + Number(v).toFixed(2);
    if (c.type === 'action') {
      const primary = '<button type="button" class="wx-link" data-' + 'drawer-open="' + escText(pageId) + '" data-drawer-key="__new__" data-form-row="' + escText(r[cfg.keyField]) + '">' + escText(c.button || c.label || '查看') + '</button>';
      const detail = c.detailButton
        ? ' <button type="button" class="wx-link" data-' + 'drawer-open="' + escText(pageId) + '" data-drawer-key="' + escText(r[cfg.keyField]) + '">' + escText(c.detailButton) + '</button>'
        : '';
      return primary + detail;
    }
    return escText(v == null || v === '' ? '—' : v);
  }
  function rebuildRows(page, cfg, rows){
    var tbody = page.querySelector('tbody');
    if (!tbody) return;
    var pageId = page.getAttribute('data-page-id');
    var html = '';
    rows.forEach(function(r, i){
      var cells = '';
      (cfg.columns || []).forEach(function(c){
        var cls = c.type === 'num' ? ' class="num"' : '';
        cells += '<td' + cls + (c.type === 'status' ? ' data-status-cell' : '') + '>' + liveCell(r, c, cfg, pageId) + '</td>';
      });
      var owner = r.owner ? ' data-owner="' + escText(r.owner) + '"' : '';
      html += '<tr data-row-idx="' + i + '" data-row="' + escText(JSON.stringify(r)) + '" data-status="' + escText(r[cfg.statusField] || '') + '"' + owner + '>' + cells + '</tr>';
    });
    tbody.innerHTML = html;
    Array.prototype.slice.call(page.querySelectorAll('.wx-tab')).forEach(function(t){
      var badge = t.querySelector('.wx-tab-count');
      if (!badge) return;
      if (t.hasAttribute('data-tab-all')) { badge.textContent = String(rows.length); return; }
      var f = t.getAttribute('data-tab-field'), v = t.getAttribute('data-tab-value'), cnt = 0;
      rows.forEach(function(r){ if (String(r[f] == null ? '' : r[f]) === v) cnt++; });
      badge.textContent = String(cnt);
    });
    setNo(page, 1);
    applyFilters(page);
  }
  function collectForm(panel){
    var out = {}, missing = '';
    Array.prototype.slice.call(panel.querySelectorAll('[data-form-key]')).forEach(function(el){
      var k = el.getAttribute('data-form-key');
      var v = (el.value || '').trim();
      if (el.hasAttribute('data-form-required') && !v && !missing) missing = el.getAttribute('data-form-required');
      out[k] = v;
    });
    Array.prototype.slice.call(panel.querySelectorAll('[data-form-check-group]')).forEach(function(group){
      var k = group.getAttribute('data-form-check-group');
      var vals = [];
      Array.prototype.slice.call(group.querySelectorAll('input[data-form-check]:checked')).forEach(function(cb){ vals.push(cb.value); });
      if (group.hasAttribute('data-form-required') && !vals.length && !missing) missing = group.getAttribute('data-form-required');
      out[k] = vals.join('、');
    });
    return { values: out, missing: missing };
  }
  function fillForm(panel, row, isNew){
    Array.prototype.slice.call(panel.querySelectorAll('[data-form-key]')).forEach(function(el){
      var k = el.getAttribute('data-form-key');
      el.value = isNew || !row || row[k] == null ? '' : String(row[k]);
    });
    Array.prototype.slice.call(panel.querySelectorAll('[data-form-check-group]')).forEach(function(group){
      var k = group.getAttribute('data-form-check-group');
      var raw = isNew || !row || row[k] == null ? '' : String(row[k]);
      var vals = raw.split(/[、,，]/).map(function(s){ return s.trim(); });
      Array.prototype.slice.call(group.querySelectorAll('input[data-form-check]')).forEach(function(cb){
        cb.checked = vals.indexOf(cb.value) !== -1;
      });
    });
  }
  function nowText(){
    var d = new Date();
    function p(x){ return (x < 10 ? '0' : '') + x; }
    return d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  var FORM_STATUS = {
    saveDraft: 'draft', submitReview: 'pendingReview', approve: 'approved',
    reject: 'rejectedReview', withdraw: 'withdrawn', voidApply: 'voided',
    republish: 'pendingReview', resubmit: 'pendingReview'
  };
  var FORM_LABEL = {
    saveDraft: '保存草稿', submitReview: '提交审核', approve: '审核通过',
    reject: '驳回', withdraw: '撤回', voidApply: '作废', republish: '反审核', resubmit: '退回修改重提',
    confirm: '确认', appeal: '异议申诉', cancel: '变更取消', publish: '发布',
    submit: '提交', confirmBill: '确认账单', invoice: '开票', resync: '重新同步', cancelDropship: '取消代发',
    authorize: '授权', reauthorize: '重新授权', revoke: '解除授权', retry: '重试',
    dispatch: '下发 3PL', selfship: '自发货', replenish: '备货到平台仓',
    cartonMark: '生成箱唛', packingList: '生成装箱单', book: '预约入仓',
    ship: '发货', sign: '签收', agree: '同意', refuse: '拒绝', receive: '确认收货',
    refund: '退款', createInbound: '生成售后入库计划单'
  };
  function applyFormAction(el, panel){
    var page = currentPage();
    var cfg = page ? liveCfg(page) : null;
    if (!page || !cfg) { closeDrawer(); return; }
    var action = el.getAttribute('data-form-action');
    var f = collectForm(panel);
    if (f.missing && action !== 'saveDraft') { toast('请填写' + f.missing); return; }
    if (action === 'reject' && !f.values.rejectReason) { toast('请填写驳回原因'); return; }
    var rows = readRows(page, cfg);
    var rk = panel.getAttribute('data-form-current') || '__new__';
    var idx = -1, i, j;
    for (i = 0; i < rows.length; i++) { if (String(rows[i][cfg.keyField]) === String(rk)) { idx = i; break; } }
    var r = {};
    if (idx >= 0) { for (j in rows[idx]) r[j] = rows[idx][j]; }
    else {
      var seq = rows.length + 1;
      r[cfg.keyField] = 'AP' + nowText().slice(0,10).replace(/-/g,'') + (seq < 10 ? '00' : seq < 100 ? '0' : '') + seq;
      r.owner = activeView() || '海纳食品';
      r.applicant = activeView() || '运营账号';
      r.trace = '';
    }
    for (j in f.values) r[j] = f.values[j];
    var st = (cfg.actionStatus && cfg.actionStatus[action]) || FORM_STATUS[action];
    if (st) r[cfg.statusField] = st;
    var t = nowText();
    if (action === 'submitReview') { r.submitTime = t; r.applicant = activeView() || '运营账号'; }
    if (action === 'approve' || action === 'reject') {
      r.reviewer = activeView() || '仓网审核';
      r.reviewTime = t;
      if (action === 'approve') {
        if ('skuCode' in r && !r.skuCode) r.skuCode = 'SKU' + String(100300 + rows.length);
        if ('releasedVersion' in r) r.releasedVersion = Number(r.releasedVersion || 0) + 1;
      }
    }
    if (action === 'confirm') { r.confirmTime = t; r.confirmBy = activeView() || '运营账号'; }
    r.trace = (r.trace ? r.trace + '；' : '') + t + ' ' + (FORM_LABEL[action] || action);
    if (idx >= 0) rows[idx] = r; else rows.unshift(r);
    saveRows(page, cfg, rows);
    rebuildRows(page, cfg, rows);
    closeDrawer();
    toast((FORM_LABEL[action] || '操作') + '已生效');
  }
  function toast(text){
    var t = document.querySelector('.wx-toast');
    if (!t) return;
    t.textContent = text;
    t.hidden = false;
    window.setTimeout(function(){ t.hidden = true; }, 2200);
  }
  function closeDrawer(){
    var ov = document.querySelector('.wx-overlay');
    if (!ov) return;
    ov.hidden = true;
    Array.prototype.slice.call(ov.querySelectorAll('[data-drawer-panel]')).forEach(function(p){ p.hidden = true; });
  }
  function openDrawer(pageId, rowKey){
    var ov = document.querySelector('.wx-overlay');
    if (!ov) return;
    var hit = false;
    Array.prototype.slice.call(ov.querySelectorAll('[data-drawer-panel]')).forEach(function(p){
      var on = p.getAttribute('data-drawer-panel') === pageId && p.getAttribute('data-drawer-key') === rowKey;
      p.hidden = !on;
      if (on) hit = true;
    });
    ov.hidden = !hit;
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest('button, [data-toast]') : null;
    if (!el) return;
    if (el.hasAttribute('data-confirm') && !window.confirm(el.getAttribute('data-confirm'))) return;
    if (el.hasAttribute('data-nav')) {
      var box2 = el.nextElementSibling;
      if (box2 && box2.classList.contains('wx-nav-children')) {
        var isCur = el.classList.contains('is-current');
        var open = !box2.hidden;
        Array.prototype.slice.call(document.querySelectorAll('.wx-nav-children')).forEach(function(b){
          if (b === box2) return;
          b.hidden = true;
          if (b.previousElementSibling) b.previousElementSibling.setAttribute('aria-expanded', 'false');
        });
        box2.hidden = open && !isCur;
        el.setAttribute('aria-expanded', box2.hidden ? 'false' : 'true');
      }
      return;
    }
    if (el.hasAttribute('data-side-toggle')) {
      var appEl = document.querySelector('.wx-app');
      var folded = !appEl.classList.contains('is-collapsed');
      appEl.classList.toggle('is-collapsed', folded);
      el.setAttribute('title', folded ? '展开侧栏' : '收起侧栏');
      el.setAttribute('aria-label', folded ? '展开侧栏' : '收起侧栏');
      el.textContent = folded ? '›' : '‹';
      return;
    }
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
      setNo(r, 1); applyFilters(r);
      return;
    }
    if (el.hasAttribute('data-more')) {
      var cur = currentPage();
      var extra = cur ? cur.querySelector('.wx-filters--extra') : null;
      if (extra) { extra.hidden = !extra.hidden; el.textContent = extra.hidden ? '展开全部条件' : '收起条件'; }
      return;
    }
    if (el.hasAttribute('data-toast')) { toast(el.getAttribute('data-toast')); return; }
    if (el.hasAttribute('data-drawer-close')) { closeDrawer(); return; }
    if (el.hasAttribute('data-form-action')) {
      var actionPanel = el.closest ? el.closest('.wx-drawer-panel') : null;
      if (actionPanel) applyFormAction(el, actionPanel);
      return;
    }
    if (el.hasAttribute('data-drawer-open')) {
      var openId = el.getAttribute('data-drawer-open');
      var openKey = el.getAttribute('data-drawer-key') || '';
      var formPanel = document.querySelector('.wx-overlay [data-' + 'drawer-panel="' + openId + '"][data-drawer-key="' + openKey + '"]');
      if (formPanel && formPanel.querySelector('[data-form-panel]')) {
        var rowKeyValue = el.getAttribute('data-form-row') || '__new__';
        formPanel.setAttribute('data-form-current', rowKeyValue);
        var curPage = currentPage(), curCfg = curPage ? liveCfg(curPage) : null;
        var currentRow = null;
        if (curCfg && rowKeyValue !== '__new__') {
          var allRows = readRows(curPage, curCfg);
          for (var ri = 0; ri < allRows.length; ri++) {
            if (String(allRows[ri][curCfg.keyField]) === String(rowKeyValue)) { currentRow = allRows[ri]; break; }
          }
        }
        fillForm(formPanel, currentRow, rowKeyValue === '__new__');
      }
      openDrawer(openId, openKey);
      return;
    }
  });
  document.addEventListener('change', function(e){
    var el = e.target;
    if (el.hasAttribute('data-login-owner')) {
      applyOwnerView(el.value, true);
      try { window.sessionStorage.setItem('wx-auth-owner', el.value); } catch(err){}
      return;
    }
    if (el.hasAttribute('data-filter-key') || el.hasAttribute('data-range-key')) {
      var page = currentPage();
      if (page) { setNo(page, 1); applyFilters(page); }
    }
  });
  var gs = document.querySelector('[data-global-search]');
  if (gs) gs.addEventListener('input', function(){
    var q = (gs.value || '').trim();
    Array.prototype.slice.call(document.querySelectorAll('.wx-side-item,.wx-head-tab')).forEach(function(b){
      b.hidden = q ? (b.textContent || '').indexOf(q) === -1 : false;
    });
  });
  window.addEventListener('hashchange', function(){
    var want = (location.hash || '').replace('#','');
    if (want) activate(want, false);
  });
  var first = document.querySelector('.wx-side-item');
  var initial = (location.hash || '').replace('#','');
  var valid = initial && pages().some(function(p){ return p.getAttribute('data-page-id') === initial; });
  var ownerSelect = document.querySelector('[data-login-owner]');
  if (ownerSelect) {
    var savedOwner = null;
    try { savedOwner = window.sessionStorage.getItem('wx-auth-owner'); } catch(err){}
    var ownerOptions = Array.prototype.slice.call(ownerSelect.options);
    if (savedOwner && ownerOptions.some(function(o){ return o.value === savedOwner; })) ownerSelect.value = savedOwner;
    applyOwnerView(ownerSelect.value, false);
  }
  activate(valid ? initial : (first ? first.getAttribute('data-target') : ''));
})();
`;

/* ---------------- 登录演示：外壳层，不属于任何 .page ---------------- */

export function renderLogin({ product = '', appName = '', userLabel = '', demoOwners = [], gate = true } = {}) {
  const tab = (key, name, active) => `<button type="button" class="wx-login-tab${active ? ' is-active' : ''}" data-login-tab="${key}">${esc(name)}</button>`;
  const submit = (key) => `<button type="button" class="wx-login-submit" data-login-submit="${key}">登录</button>`;
  const ownerField = demoOwners.length
    ? `<label class="wx-login-field"><span>演示身份</span><select data-login-owner>${demoOwners.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select></label>`
    : '';
  return `<div class="wx-login-layer" id="loginLayer" data-login-gate="${gate ? '1' : '0'}"${gate ? '' : ' hidden'}>
  <div class="wx-login-card">
    ${gate ? '' : `<button type="button" class="wx-login-close" data-login-close aria-label="关闭">×</button>`}
    <div class="wx-login-brand"><span class="wx-brand-mark">仓</span><span class="wx-brand-copy"><b>${esc(product)}</b><small>${esc(appName)}</small></span></div>
    <div class="wx-login-tabs">${tab('password', '账号密码', true)}${tab('captcha', '验证码', false)}${tab('third', '第三方登录', false)}</div>
    <div class="wx-login-panel" data-login-panel="password">
      ${ownerField}
      <label class="wx-login-field"><span>账号</span><input type="text" data-login-account placeholder="请输入账号" autocomplete="off"></label>
      <label class="wx-login-field"><span>密码</span><input type="password" data-login-password placeholder="请输入密码" autocomplete="off"></label>
      <div class="wx-login-digest"><span>传输摘要</span><b data-login-digest>—</b></div>
      ${submit('password')}
    </div>
    <div class="wx-login-panel" data-login-panel="captcha" hidden>
      <label class="wx-login-field"><span>手机号</span><input type="text" data-login-phone placeholder="请输入手机号" autocomplete="off"></label>
      <div class="wx-login-code"><label class="wx-login-field"><span>验证码</span><input type="text" data-login-code placeholder="请输入验证码" autocomplete="off"></label><button type="button" class="wx-login-send" data-login-send>获取验证码</button></div>
      ${submit('captcha')}
    </div>
    <div class="wx-login-panel" data-login-panel="third" hidden>
      <button type="button" class="wx-login-third" data-login-third="企业微信">企业微信登录</button>
      <button type="button" class="wx-login-third" data-login-third="微信">微信登录</button>
    </div>
    <div class="wx-login-error" hidden><span data-login-error></span><button type="button" data-login-retry>重试</button></div>
    <div class="wx-login-note">演示账号 admin，密码 123456；验证码 888888；账号填 error 触发网络异常</div>
    <div class="wx-login-safe">密码加密传输 · 连续失败 5 次锁定 60 秒 · 令牌可刷新</div>
  </div>
</div>
<div class="wx-session" id="sessionPanel" hidden>
  <div class="wx-session-head"><b>账号与会话</b><button type="button" data-session-close aria-label="关闭">×</button></div>
  <div class="wx-session-row"><span>当前身份</span><b data-session-user>${esc(userLabel)}</b></div>
  <div class="wx-session-row"><span>令牌剩余</span><b data-session-expire>—</b></div>
  <div class="wx-session-actions">
    <button type="button" data-session-refresh>刷新令牌</button>
    <button type="button" data-session-expire-now>模拟令牌过期</button>
    <button type="button" data-session-logout>退出登录</button>
  </div>
</div>`;
}

export const LOGIN_CSS = `
.wx-user{border:0;background:transparent;cursor:pointer}
.wx-user:hover{background:var(--wx-gray-50)}
.wx-toast{z-index:1200}
.wx-login-layer{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;overflow:auto;padding:var(--wx-sp-6);background:var(--wx-gray-50)}
.wx-login-layer[hidden]{display:none !important}
.wx-login-card{width:100%;max-width:400px;padding:var(--wx-sp-8);background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow)}
.wx-login-brand{display:flex;align-items:center;gap:var(--wx-sp-2);margin-bottom:var(--wx-sp-6)}
.wx-login-tabs{display:flex;gap:var(--wx-sp-4);border-bottom:var(--wx-border);margin-bottom:var(--wx-sp-6)}
.wx-login-tab{border:0;background:transparent;padding:0 0 var(--wx-sp-2);font-size:var(--wx-fs-md);color:var(--wx-gray-500);border-bottom:2px solid transparent}
.wx-login-tab.is-active{color:var(--wx-primary-600);border-bottom-color:var(--wx-primary-500);font-weight:600}
.wx-login-panel[hidden]{display:none !important}
.wx-login-field{display:flex;flex-direction:column;gap:var(--wx-sp-1);margin-bottom:var(--wx-sp-3);font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-login-field input,.wx-login-field select{height:40px;padding:0 var(--wx-sp-3);border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);font-size:var(--wx-fs-md);color:var(--wx-gray-900)}
.wx-login-digest{display:flex;justify-content:space-between;margin-bottom:var(--wx-sp-3);font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-login-submit,.wx-login-third{width:100%;height:40px;border:0;border-radius:var(--wx-r-sm);background:var(--wx-primary-500);color:var(--wx-white);font-size:var(--wx-fs-md);font-weight:600}
.wx-login-submit:disabled,.wx-login-third:disabled{background:var(--wx-gray-200);color:var(--wx-gray-500)}
.wx-login-third{margin-bottom:var(--wx-sp-2);background:var(--wx-primary-50);color:var(--wx-primary-600)}
.wx-login-code{display:flex;align-items:flex-end;gap:var(--wx-sp-2)}
.wx-login-code .wx-login-field{flex:1}
.wx-login-send{height:40px;padding:0 var(--wx-sp-3);border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);font-size:var(--wx-fs-sm);white-space:nowrap}
.wx-login-send:disabled{color:var(--wx-gray-400)}
.wx-login-error{display:flex;align-items:center;justify-content:space-between;gap:var(--wx-sp-2);margin-top:var(--wx-sp-3);padding:var(--wx-sp-2) var(--wx-sp-3);border-radius:var(--wx-r-sm);background:var(--wx-error-soft);color:var(--wx-error-500);font-size:var(--wx-fs-sm)}
.wx-login-error[hidden]{display:none !important}
.wx-login-error button{border:0;background:transparent;color:var(--wx-error-500);font-size:var(--wx-fs-sm);font-weight:600}
.wx-login-note,.wx-login-safe{margin-top:var(--wx-sp-3);font-size:var(--wx-fs-xs);line-height:1.6;color:var(--wx-gray-400)}
.wx-session{position:fixed;top:calc(var(--wx-top-h) + 8px);right:var(--wx-sp-6);z-index:1100;width:280px;padding:var(--wx-sp-4);background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);box-shadow:var(--wx-shadow)}
.wx-session[hidden]{display:none !important}
.wx-session-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--wx-sp-3)}
.wx-session-head button{border:0;background:transparent;font-size:var(--wx-fs-lg);color:var(--wx-gray-500)}
.wx-session-row{display:flex;justify-content:space-between;margin-bottom:var(--wx-sp-2);font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-session-row b{color:var(--wx-gray-900)}
.wx-session-actions{display:flex;flex-direction:column;gap:var(--wx-sp-2);margin-top:var(--wx-sp-3)}
.wx-session-actions button{height:36px;border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);font-size:var(--wx-fs-sm)}
.wx-session-actions button:last-child{background:var(--wx-error-soft);color:var(--wx-error-500)}
.wx-login-card{position:relative}
.wx-login-close{position:absolute;right:var(--wx-sp-3);top:var(--wx-sp-3);width:32px;height:32px;border:0;background:transparent;font-size:var(--wx-fs-lg);color:var(--wx-gray-500)}
html[data-auth="guest"] [data-auth-member],html[data-auth="member"] [data-auth-guest]{display:none !important}
html[data-auth="guest"] .wx-shop-price-value{display:none !important}
html[data-auth="member"] .wx-shop-price-guest{display:none !important}
@media (max-width:900px){.wx-login-card{padding:var(--wx-sp-6)}.wx-session{right:var(--wx-sp-2);left:var(--wx-sp-2);width:auto}}
`;

export const LOGIN_SCRIPT = `
(function(){
  var ERR = {
    EMPTY: '请输入账号和密码',
    BAD: '账号或密码错误',
    NETWORK: '网络异常，请重试',
    LOCKED: '尝试次数过多，请 N 秒后重试',
    PHONE: '请输入 11 位手机号',
    CODE: '验证码错误',
    EXPIRED: '登录已过期，请重新登录'
  };
  var LOCK_LIMIT = 5, LOCK_SECONDS = 60, TOKEN_SECONDS = 3600, CODE_SECONDS = 60;
  var layer = document.getElementById('loginLayer');
  var GATE = !layer || layer.getAttribute('data-login-gate') !== '0';
  function setAuth(on){ document.documentElement.setAttribute('data-auth', on ? 'member' : 'guest'); }
  var session = document.getElementById('sessionPanel');
  var errorBox = document.querySelector('.wx-login-error');
  var errorText = document.querySelector('[data-login-error]');
  var digestEl = document.querySelector('[data-login-digest]');
  var expireEl = document.querySelector('[data-session-expire]');
  var sendBtn = document.querySelector('[data-login-send]');
  var toastEl = document.querySelector('.wx-toast');
  var state = { mode:'password', lastMode:'password', loading:false, fails:0, lockUntil:0, codeUntil:0, expireAt:0, logged:false };

  function toast(text){
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.hidden = false;
    window.setTimeout(function(){ toastEl.hidden = true; }, 2200);
  }
  function digest(v){
    var h = 2166136261;
    for (var i = 0; i < v.length; i++) { h ^= v.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function read(k){ try { return window.sessionStorage.getItem(k); } catch(e){ return null; } }
  function write(k,v){ try { window.sessionStorage.setItem(k,v); } catch(e){} }
  function clear(){ try { ['wx-auth-logged','wx-auth-expire','wx-auth-user'].forEach(function(k){ window.sessionStorage.removeItem(k); }); } catch(e){} }
  function showError(text){
    if (!errorBox || !errorText) return;
    errorText.textContent = text;
    errorBox.hidden = false;
  }
  function hideError(){ if (errorBox) errorBox.hidden = true; }
  function setLoading(on){
    state.loading = on;
    Array.prototype.slice.call(document.querySelectorAll('[data-login-submit],[data-login-third]')).forEach(function(b){
      b.disabled = on;
      if (b.hasAttribute('data-login-submit')) b.textContent = on ? '登录中…' : '登录';
    });
  }
  function showLayer(show){
    if (layer) layer.hidden = !show;
    if (session) session.hidden = true;
  }
  function setTab(mode){
    state.mode = mode;
    Array.prototype.slice.call(document.querySelectorAll('[data-login-tab]')).forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-login-tab') === mode);
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-login-panel]')).forEach(function(p){
      p.hidden = p.getAttribute('data-login-panel') !== mode;
    });
    hideError();
  }
  function renderExpire(){
    if (!expireEl) return;
    var left = Math.max(0, Math.ceil((state.expireAt - Date.now()) / 1000));
    var m = Math.floor(left / 60), s = left % 60;
    expireEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function expireNow(reason){
    clear();
    state.logged = false; state.expireAt = 0; state.fails = 0; state.lockUntil = 0;
    setAuth(false);
    setLoading(false);
    setTab('password');
    hideError();
    if (GATE) { showLayer(true); showError(reason || ERR.EXPIRED); }
    else { showLayer(false); toast(reason || ERR.EXPIRED); }
  }
  function loginSuccess(){
    state.logged = true;
    state.fails = 0;
    state.expireAt = Date.now() + TOKEN_SECONDS * 1000;
    write('wx-auth-logged','1');
    write('wx-auth-expire', String(state.expireAt));
    hideError();
    showLayer(false);
    setLoading(false);
    setAuth(true);
    renderExpire();
    toast('登录成功（原型示意）');
  }
  function lockCheck(){
    var left = Math.ceil((state.lockUntil - Date.now()) / 1000);
    if (left > 0) { showError(ERR.LOCKED.replace('N', String(left))); return true; }
    return false;
  }
  function fail(code){
    state.fails++;
    showError(code);
    if (state.fails >= LOCK_LIMIT) {
      state.lockUntil = Date.now() + LOCK_SECONDS * 1000;
      showError(ERR.LOCKED.replace('N', String(LOCK_SECONDS)));
    }
  }
  function submit(mode){
    if (state.loading || lockCheck()) return;
    hideError();
    state.lastMode = mode;
    var account = (document.querySelector('[data-login-account]') || {}).value || '';
    var password = (document.querySelector('[data-login-password]') || {}).value || '';
    var phone = (document.querySelector('[data-login-phone]') || {}).value || '';
    var code = (document.querySelector('[data-login-code]') || {}).value || '';
    if (mode === 'password') {
      if (!account.trim() || !password) { fail(ERR.EMPTY); return; }
    } else if (mode === 'captcha') {
      if (!/^\\d{11}$/.test(phone.trim())) { fail(ERR.PHONE); return; }
      if (!code.trim()) { fail(ERR.CODE); return; }
    }
    setLoading(true);
    window.setTimeout(function(){
      setLoading(false);
      if (mode === 'password' && account.trim() === 'error') { fail(ERR.NETWORK); return; }
      var ok = mode === 'password'
        ? (account.trim() === 'admin' && password === '123456')
        : (code.trim() === '888888');
      if (ok) loginSuccess(); else fail(mode === 'password' ? ERR.BAD : ERR.CODE);
    }, 600);
  }
  function thirdLogin(){
    if (state.loading || lockCheck()) return;
    hideError();
    state.lastMode = 'third';
    setLoading(true);
    window.setTimeout(function(){ setLoading(false); loginSuccess(); }, 900);
  }
  function sendCode(){
    var phone = (document.querySelector('[data-login-phone]') || {}).value || '';
    if (!/^\\d{11}$/.test(phone.trim())) { showError(ERR.PHONE); return; }
    hideError();
    state.codeUntil = Date.now() + CODE_SECONDS * 1000;
    toast('验证码已发送（原型示意）');
  }
  function refresh(){
    if (!state.logged) return;
    state.expireAt = Date.now() + TOKEN_SECONDS * 1000;
    write('wx-auth-expire', String(state.expireAt));
    renderExpire();
    toast('令牌已刷新（原型示意）');
  }
  function logout(){
    clear();
    state.logged = false; state.expireAt = 0; state.fails = 0; state.lockUntil = 0;
    setAuth(false);
    if (GATE) showLayer(true); else showLayer(false);
    setTab('password');
    hideError();
    toast('已退出登录（原型示意）');
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest('button') : null;
    if (!el) return;
    if (el.hasAttribute('data-login-open')) { showLayer(true); setTab('password'); hideError(); return; }
    if (el.hasAttribute('data-login-close')) { showLayer(false); hideError(); return; }
    if (el.hasAttribute('data-login-tab')) { setTab(el.getAttribute('data-login-tab')); return; }
    if (el.hasAttribute('data-login-submit')) { submit(el.getAttribute('data-login-submit')); return; }
    if (el.hasAttribute('data-login-third')) { thirdLogin(); return; }
    if (el.hasAttribute('data-login-send')) { sendCode(); return; }
    if (el.hasAttribute('data-login-retry')) { submit(state.lastMode); return; }
    if (el.hasAttribute('data-session-toggle')) { if (session) session.hidden = !session.hidden; return; }
    if (el.hasAttribute('data-session-close')) { if (session) session.hidden = true; return; }
    if (el.hasAttribute('data-session-refresh')) { refresh(); return; }
    if (el.hasAttribute('data-session-expire-now')) { expireNow(ERR.EXPIRED); return; }
    if (el.hasAttribute('data-session-logout')) { logout(); return; }
  });
  document.addEventListener('input', function(e){
    if (!e.target.hasAttribute || !e.target.hasAttribute('data-login-password')) return;
    var v = e.target.value || '';
    if (digestEl) digestEl.textContent = v ? digest(v) : '—';
  });
  window.setInterval(function(){
    if (state.codeUntil > Date.now()) {
      if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '重新获取（' + Math.ceil((state.codeUntil - Date.now()) / 1000) + ' 秒）'; }
    } else if (sendBtn && sendBtn.disabled) {
      sendBtn.disabled = false; sendBtn.textContent = '获取验证码';
    }
    if (state.logged) {
      renderExpire();
      if (Date.now() >= state.expireAt) expireNow(ERR.EXPIRED);
    }
    if (!state.logged && state.lockUntil > Date.now()) {
      showError(ERR.LOCKED.replace('N', String(Math.ceil((state.lockUntil - Date.now()) / 1000))));
    }
  }, 1000);
  var saved = read('wx-auth-logged');
  var savedExpire = Number(read('wx-auth-expire') || 0);
  if (saved === '1' && savedExpire > Date.now()) {
    state.logged = true; state.expireAt = savedExpire;
    showLayer(false); renderExpire(); setAuth(true);
  } else {
    clear(); setAuth(false);
    if (GATE) showLayer(true); else showLayer(false);
  }
})();
`;

/* ---------------- 商城前台组件（只给 shell = "mall" 的端用） ---------------- */

export const SHOP_CATEGORIES = ['全部商品', '食品饮料', '日化清洁', '家居百货', '数码配件'];

export function money(v) {
  return '￥' + Number(v || 0).toFixed(2);
}

export function ShopPrice(value, { tag = 'b', cls = '', attrs = '' } = {}) {
  const text = typeof value === 'string' ? value : money(value);
  const klass = ['wx-shop-price-value', cls].filter(Boolean).join(' ');
  return `<span class="wx-shop-price"><${tag} class="${klass}"${attrs ? ` ${attrs}` : ''}>${esc(text)}</${tag}>`
    + `<button type="button" class="wx-shop-price-guest" data-login-open>登录可见价格</button></span>`;
}

export function ShopPage({ title = '', note = '', body = '' } = {}) {
  return `<div class="wx-shop-page"><div class="wx-shop-page-head"><h1>${esc(title)}</h1>`
    + (note ? `<span>${esc(note)}</span>` : '') + `</div>`
    + `<div class="wx-shop-page-body">${body}</div></div>`;
}

export function ShopHero({ title = '', note = '', marks = [], action = '继续选货', guest = false } = {}) {
  const cards = marks.map((m) => `<div class="wx-shop-hero-mark"><span>${esc(m.label)}</span><b>${esc(m.value)}</b></div>`).join('');
  const guestBar = guest
    ? `<div class="wx-shop-hero-guest" data-auth-guest><span>登录后查看批发价</span><button type="button" class="wx-shop-btn" data-login-open>登录</button></div>`
    : '';
  return `<div class="wx-shop-hero"><div><h2>${esc(title)}</h2><p>${esc(note)}</p>`
    + `<div class="wx-shop-hero-actions"><button type="button" class="wx-shop-btn" data-target="mall/search">${esc(action)}</button>${guestBar}</div></div>`
    + `<div class="wx-shop-hero-marks">${cards}</div></div>`;
}

export function ShopCategory({ items = [], count = 0 } = {}) {
  const links = items.map((c) => `<button type="button" data-shop-cat="${esc(c)}">${esc(c)}</button>`).join('');
  return `<div class="wx-shop-cats"><div class="wx-shop-cats-title">商品类目</div>${links}`
    + `<div class="wx-shop-cats-note">共 ${esc(count)} 件商品</div></div>`;
}

export function ProductCard(p = {}) {
  const tone = p.tone || 'food';
  const short = String(p.skuName || '货').slice(0, 1);
  const badge = p.badge ? `<em class="wx-shop-badge">${esc(p.badge)}</em>` : '';
  return `<article class="wx-shop-card" data-shop-card data-cat="${esc(p.category || '')}" `
    + `data-shop-name="${esc(p.skuName || '')}" data-shop-owner="${esc(p.owner || '')}">`
    + `<div class="wx-shop-thumb wx-shop-thumb--${esc(tone)}">${esc(short)}${badge}</div>`
    + `<div class="wx-shop-card-body">`
    + `<button type="button" class="wx-shop-card-title" data-target="mall/product-detail">${esc(p.skuName)}</button>`
    + `<span class="wx-shop-card-spec">${esc(p.spec)} · ${esc(p.unit)}</span>`
    + `<div class="wx-shop-card-price">${ShopPrice(p.price)}<span class="wx-shop-price-value">/ ${esc(p.unit)}</span></div>`
    + `<div class="wx-shop-card-meta"><span>起批 ${esc(p.minQty)} ${esc(p.unit)}</span><span>可售 ${esc(p.stock)}</span></div>`
    + `<div class="wx-shop-card-shop"><span>${esc(p.owner)}</span><em>店铺评分 ${esc(p.score)}</em></div>`
    + `<div class="wx-shop-card-actions">`
    + `<button type="button" class="wx-shop-btn" data-shop-add data-shop-sku="${esc(p.skuCode || '')}">加入进货单</button>`
    + `<button type="button" class="wx-shop-btn wx-shop-btn--ghost" data-target="mall/product-detail">查看商品</button>`
    + `</div></div></article>`;
}

export function ShopFloor({ title = '', note = '', more = '继续选货', cards = [] } = {}) {
  return `<section class="wx-shop-floor"><div class="wx-shop-floor-head"><h2>${esc(title)}</h2>`
    + `<span>${esc(note)}</span>${more ? `<button type="button" data-target="mall/search">${esc(more)}</button>` : ''}</div>`
    + `<div class="wx-shop-grid">${cards.join('')}</div></section>`;
}

export function CartTable({ rows = [], readonly = false } = {}) {
  const head = `<div class="wx-shop-table-head"><span>商品名称</span><span>单价</span><span>起批量</span>`
    + `<span>数量</span><span>小计</span><span>操作</span></div>`;
  const body = rows.map((r) => {
    const qty = Number(r.qty || 1);
    const qtyCell = readonly
      ? `<input type="hidden" data-shop-qty-input value="${qty}">${esc(qty)} ${esc(r.unit || '')}`
      : `<div class="wx-shop-qty"><button type="button" data-shop-qty="-1">−</button>`
        + `<input type="text" data-shop-qty-input value="${qty}" readonly>`
        + `<button type="button" data-shop-qty="1">+</button></div>`;
    const action = readonly
      ? `<span>—</span>`
      : `<button type="button" class="wx-shop-link" data-shop-remove>移除</button>`;
    return `<div class="wx-shop-cart-row" data-shop-cart-row data-shop-price="${Number(r.price || 0)}">`
      + `<div class="wx-shop-cart-goods"><span class="wx-shop-thumb wx-shop-thumb--${esc(r.tone || 'food')} wx-shop-thumb--sm">${esc(String(r.skuName || '货').slice(0, 1))}</span>`
      + `<div><b>${esc(r.skuName)}</b><span>${esc(r.spec)} · ${esc(r.owner)}</span></div></div>`
      + `<span>${ShopPrice(r.price)}</span><span>起批 ${esc(r.minQty)} ${esc(r.unit)}</span>`
      + `<div>${qtyCell}</div>`
      + `${ShopPrice(Number(r.price || 0) * qty, { cls: 'wx-shop-line-total', attrs: 'data-shop-line-total' })}`
      + `<div>${action}</div></div>`;
  }).join('');
  const total = rows.reduce((a, r) => a + Number(r.price || 0) * Number(r.qty || 1), 0);
  return `<div class="wx-shop-table">${head}${body}`
    + `<div class="wx-shop-cart-foot"><span>共 <b data-shop-item-count>${rows.length}</b> 件商品</span>`
    + `<span>合计 ${ShopPrice(total, { attrs: 'data-shop-total' })}</span></div></div>`;
}

export function ShopFields({ items = [] } = {}) {
  return `<div class="wx-shop-fields">${items.map((i) => `<div><span>${esc(i.label)}</span><b>${dash(i.value)}</b></div>`).join('')}</div>`;
}

export function ShopPanel({ title = '', body = '' } = {}) {
  return `<div class="wx-shop-panel"><h2>${esc(title)}</h2>${body}</div>`;
}

export function ShopSummary({ freight = 0 } = {}) {
  return `<div class="wx-shop-summary">`
    + `<div><span>商品金额</span>${ShopPrice('—', { attrs: 'data-shop-goods-total' })}</div>`
    + `<div><span>运费</span>${ShopPrice(freight)}</div>`
    + `<div class="wx-shop-summary-total"><span>应付合计</span>${ShopPrice('—', { attrs: 'data-shop-total' })}</div></div>`;
}

export function OrderCard(o = {}) {
  return `<article class="wx-shop-order"><div class="wx-shop-order-head">`
    + `<span>订单编号 ${esc(o.orderNo)}</span><span>下单时间 ${esc(o.createdAt)}</span>${o.statusHtml || ''}</div>`
    + `<div class="wx-shop-order-body"><span class="wx-shop-thumb wx-shop-thumb--${esc(o.tone || 'food')} wx-shop-thumb--sm">${esc(String(o.skuName || '货').slice(0, 1))}</span>`
    + `<div><b>${esc(o.skuName)}</b><small>${esc(o.owner)} · ${esc(o.qty)} ${esc(o.unit)} · ${ShopPrice(o.price, { tag: 'span' })}<span class="wx-shop-price-value"> / ${esc(o.unit)}</span></small></div>`
    + `${ShopPrice(Number(o.price || 0) * Number(o.qty || 1), { cls: 'wx-shop-order-amount' })}</div>`
    + `<div class="wx-shop-order-foot"><span>履约单号 ${esc(o.soNo)}</span><span>承运商 ${esc(o.carrier)}</span>`
    + `<button type="button" class="wx-shop-btn wx-shop-btn--ghost" data-toast="查看订单（原型示意）">查看订单</button></div></article>`;
}

export function ShopFilter({ categories = [], owners = [] } = {}) {
  const cats = categories.map((c) => `<button type="button" class="wx-shop-chip" data-shop-cat="${esc(c)}">${esc(c)}</button>`).join('');
  const shops = owners.map((o) => `<button type="button" class="wx-shop-chip" data-toast="${esc(o)}（原型示意）">${esc(o)}</button>`).join('');
  return `<div class="wx-shop-filter"><span class="wx-shop-filter-label">商品类目</span>${cats}`
    + `<span class="wx-shop-filter-label">货主店铺</span>${shops}</div>`;
}

/**
 * PDA 作业端外壳：仿工业 PDA 机身，状态栏 + 顶栏 + 内容区 + 六键键盘。
 * 页面靠 data-pda-tab 切换，「主页 / 菜单」回作业首页，「返回」回上一屏。
 * 窄屏（<=480px）铺满，不显示机身；不渲染侧栏与货主下拉。
 */
export function renderPdaShell({ product = '', appName = '', operator = '', device = '', tabs = [], sections = '', minePageId = '' } = {}) {
  const first = tabs[0] || { id: '', name: '' };
  const boot = tabs.length ? tabs[0].id : '';
  return `<div class="wx-pda"${boot ? ` data-boot="${esc(boot)}"` : ''} data-operator="${esc(operator)}">\n`
    + `<div class="wx-pda-device">`
    + `<span class="wx-pda-cam" aria-hidden="true"></span><span class="wx-pda-led" aria-hidden="true"></span>`
    + `<span class="wx-pda-key-side wx-pda-key-side--l" aria-hidden="true"></span>`
    + `<span class="wx-pda-key-side wx-pda-key-side--r" aria-hidden="true"></span>`
    + `<div class="wx-pda-screen">`
    + `<div class="wx-pda-status"><span data-pda-status-left>${esc(operator || '未登录')}</span>`
    + `<span data-pda-status-mid>${esc(device)}</span><span data-pda-status-right>${esc(appName)}</span></div>`
    + `<header class="wx-pda-nav"><button type="button" class="wx-pda-back" data-pda-key="back" aria-label="返回">‹</button>`
    + `<b data-pda-title>${esc(first.name)}</b>`
    + (minePageId
      ? `<button type="button" class="wx-pda-me" data-pda-tab="${esc(minePageId)}" aria-label="我的">${esc(String(operator || '·').slice(0, 1))}</button>`
      : `<span class="wx-pda-me-slot" aria-hidden="true"></span>`)
    + `</header>`
    + `<main class="wx-pda-body">${sections}</main>`
    + `<div class="wx-pda-toast" data-pda-toast hidden></div>`
    + `</div>`
    + `<div class="wx-pda-keypad">`
    + `<button type="button" class="wx-pda-key" data-pda-key="back">返回</button>`
    + `<button type="button" class="wx-pda-key" data-pda-key="home">主页</button>`
    + `<button type="button" class="wx-pda-key" data-pda-key="menu">菜单</button>`
    + `<button type="button" class="wx-pda-key" data-pda-key="clear">清空</button>`
    + `<button type="button" class="wx-pda-key wx-pda-key--scan" data-pda-key="scan">扫描</button>`
    + `<button type="button" class="wx-pda-key wx-pda-key--ok" data-pda-key="ok">确定</button>`
    + `</div></div></div>`;
}

export const PDA_CSS = `
.wx-pda{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:var(--wx-sp-8) var(--wx-sp-4);background:var(--wx-gray-100)}
.wx-pda-device{position:relative;flex:0 0 auto;margin:0 auto;width:405px;padding:14px 15px 15px;border-radius:30px;background:var(--wx-gray-900);box-shadow:var(--wx-shadow),var(--wx-shadow)}
.wx-pda-cam{position:absolute;top:7px;left:50%;transform:translateX(-50%);width:44px;height:4px;border-radius:2px;background:var(--wx-gray-700)}
.wx-pda-led{position:absolute;top:8px;right:18px;width:6px;height:6px;border-radius:50%;background:var(--wx-primary-500)}
.wx-pda-key-side{position:absolute;right:-3px;width:3px;border-radius:2px;background:var(--wx-gray-700)}
.wx-pda-key-side--l{left:-3px;right:auto;height:52px;top:150px}
.wx-pda-key-side--r{height:74px;top:190px}
.wx-pda-screen{position:relative;width:375px;height:720px;display:flex;flex-direction:column;overflow:hidden;border-radius:8px;background:var(--wx-gray-50)}
.wx-pda-status{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:var(--wx-sp-2);height:28px;padding:0 var(--wx-sp-3);font-size:var(--wx-fs-xs);color:var(--wx-gray-500);background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-pda-status span:nth-child(2){text-align:center}
.wx-pda-status span:last-child{text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wx-pda-nav{display:grid;grid-template-columns:32px 1fr 32px;align-items:center;gap:var(--wx-sp-2);min-height:44px;padding:0 var(--wx-sp-2);background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-pda-nav b{font-size:var(--wx-fs-md);font-weight:600;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wx-pda-back{width:32px;height:32px;border:0;background:transparent;font-size:var(--wx-fs-xl);color:var(--wx-gray-700)}
.wx-pda-me{width:28px;height:28px;border:0;border-radius:50%;background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:var(--wx-fs-xs)}
.wx-pda-me-slot{width:28px;height:28px}
.wx-pda-body{position:relative;flex:1;min-height:0;overflow:hidden}
.wx-pda-body .page{position:absolute;inset:0;display:block;overflow-y:auto;padding:var(--wx-sp-3)}
.wx-pda-body .page[hidden]{display:none}
.wx-pda-body .wx-device{padding:0}
.wx-pda-body .wx-device-screen{width:100%;min-height:0;border:0;border-radius:0;box-shadow:none;padding:0;gap:var(--wx-sp-2)}
.wx-pda-toast{position:absolute;left:50%;bottom:var(--wx-sp-6);z-index:20;transform:translateX(-50%);padding:var(--wx-sp-2) var(--wx-sp-4);border-radius:var(--wx-r-pill);background:var(--wx-gray-900);color:var(--wx-white);font-size:var(--wx-fs-sm)}
.wx-pda-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px 8px 6px}
.wx-pda-key{min-height:44px;border:0;border-radius:6px;background:var(--wx-gray-100);color:var(--wx-gray-700);font-size:var(--wx-fs-sm)}
.wx-pda-key--scan{background:var(--wx-primary-500);color:var(--wx-white)}
.wx-pda-key--ok{background:var(--wx-primary-600);color:var(--wx-white)}
.wx-pda-ctx{display:flex;flex-direction:column;gap:2px;padding:var(--wx-sp-3);background:var(--wx-white);border-radius:8px}
.wx-pda-ctx-row{display:flex;justify-content:space-between;gap:var(--wx-sp-2);font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-ctx-row b{font-weight:600;color:var(--wx-gray-900)}
.wx-pda-entry{display:flex;align-items:center;gap:var(--wx-sp-3);min-height:64px;padding:0 var(--wx-sp-3);border:0;background:var(--wx-white);border-radius:8px;text-align:left;width:100%}
.wx-pda-entry-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:var(--wx-fs-lg)}
.wx-pda-entry-body{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.wx-pda-entry-body b{font-size:var(--wx-fs-sm);font-weight:600}
.wx-pda-entry-body small{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-entry-arrow{color:var(--wx-gray-500);font-size:var(--wx-fs-lg)}
.wx-pda-taskcard{display:flex;flex-direction:column;gap:var(--wx-sp-2);width:100%;padding:var(--wx-sp-3);border:0;background:var(--wx-white);border-radius:8px;text-align:left;box-shadow:var(--wx-shadow)}
.wx-pda-task-head{display:flex;align-items:center;justify-content:space-between;gap:var(--wx-sp-2)}
.wx-pda-task-id{font-size:var(--wx-fs-sm);font-weight:600;font-variant-numeric:tabular-nums}
.wx-pda-task-meta{display:flex;flex-wrap:wrap;gap:var(--wx-sp-2);font-size:var(--wx-fs-xs);color:var(--wx-gray-700)}
.wx-pda-task-foot{display:flex;justify-content:space-between;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;background:var(--wx-gray-50);font-size:var(--wx-fs-xs);color:var(--wx-gray-700)}
.wx-pda-chip b{font-weight:600;color:var(--wx-gray-900)}
.wx-pda-qty{display:flex;flex-direction:column;gap:var(--wx-sp-2);padding:var(--wx-sp-3);background:var(--wx-white);border-radius:8px}
.wx-pda-qty-main{display:flex;align-items:baseline;gap:var(--wx-sp-2)}
.wx-pda-qty-main span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-qty-main b{font-size:var(--wx-fs-xl);font-variant-numeric:tabular-nums}
.wx-pda-qty-main em{font-style:normal;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-qty-track{height:6px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100)}
.wx-pda-qty-track i{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500)}
.wx-pda-qty-foot{display:flex;justify-content:space-between;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-mine-head{display:flex;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-4) var(--wx-sp-3);background:var(--wx-white);border-radius:8px}
.wx-pda-mine-avatar{width:48px;height:48px;display:grid;place-items:center;border-radius:50%;background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:var(--wx-fs-lg)}
.wx-pda-mine-info{display:flex;flex-direction:column;gap:2px;min-width:0}
.wx-pda-mine-info b{font-size:var(--wx-fs-md)}
.wx-pda-mine-info small{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-today{display:flex;flex-direction:column;gap:var(--wx-sp-2);padding:var(--wx-sp-3);background:var(--wx-white);border-radius:8px}
.wx-pda-today-head{display:flex;justify-content:space-between;align-items:baseline;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-today-head b{font-size:var(--wx-fs-xl);color:var(--wx-gray-900);font-variant-numeric:tabular-nums}
.wx-pda-today-head b small{font-size:var(--wx-fs-xs);font-weight:400;color:var(--wx-gray-500)}
.wx-pda-today-bars{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--wx-sp-2)}
.wx-pda-today-item{display:flex;flex-direction:column;gap:2px;padding:var(--wx-sp-2);text-align:center;background:var(--wx-gray-50);border-radius:6px}
.wx-pda-today-item span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-today-item b{font-size:var(--wx-fs-md);font-variant-numeric:tabular-nums}
.wx-pda-empty{padding:var(--wx-sp-8) var(--wx-sp-4);text-align:center;color:var(--wx-gray-500)}
.wx-pda-empty b{display:block;margin-bottom:4px;font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-pda-empty p{margin:0;font-size:var(--wx-fs-xs)}
.wx-pda-stack{display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-pda .wx-list{display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-pda .wx-list-cards{display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-pda-brand{display:flex;flex-direction:column;align-items:center;gap:var(--wx-sp-1);padding:var(--wx-sp-6) 0 var(--wx-sp-4)}
.wx-pda-brand-logo{width:56px;height:56px;display:grid;place-items:center;border-radius:14px;background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:var(--wx-fs-xl)}
.wx-pda-brand b{font-size:var(--wx-fs-lg)}
.wx-pda-brand small{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-tabs2{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:var(--wx-sp-2);margin-bottom:var(--wx-sp-3)}
.wx-pda-tabs2 button{min-height:36px;border:0;border-radius:6px;background:var(--wx-gray-100);color:var(--wx-gray-700);font-size:var(--wx-fs-sm)}
.wx-pda-tabs2 button.is-active{background:var(--wx-primary-500);color:var(--wx-white)}
.wx-pda-form{display:flex;flex-direction:column;gap:var(--wx-sp-3)}
.wx-pda-field{display:flex;flex-direction:column;gap:var(--wx-sp-1)}
.wx-pda-field span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-field input{min-height:44px;border:var(--wx-border);border-radius:6px;padding:0 var(--wx-sp-3);font-size:var(--wx-fs-sm);background:var(--wx-white)}
.wx-pda-row{display:flex;align-items:center;justify-content:space-between;gap:var(--wx-sp-2)}
.wx-pda-check{display:flex;align-items:center;gap:var(--wx-sp-1);font-size:var(--wx-fs-xs);color:var(--wx-gray-700)}
.wx-pda-link{border:0;background:transparent;color:var(--wx-primary-600);font-size:var(--wx-fs-xs)}
.wx-pda-tip{padding:var(--wx-sp-3);border-radius:6px;background:var(--wx-gray-50);font-size:var(--wx-fs-xs);color:var(--wx-gray-700);line-height:1.6}
.wx-pda-tip b{display:block;margin-bottom:2px;color:var(--wx-gray-900)}
.wx-pda-face{display:flex;flex-direction:column;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-6) var(--wx-sp-4);background:var(--wx-white);border-radius:8px;text-align:center}
.wx-pda-face-icon{width:96px;height:96px;display:grid;place-items:center;border-radius:50%;background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:36px}
.wx-pda-face b{font-size:var(--wx-fs-md)}
.wx-pda-face p{margin:0;font-size:var(--wx-fs-xs);color:var(--wx-gray-500);line-height:1.6}
.wx-pda-btns{display:grid;gap:var(--wx-sp-2);margin-top:var(--wx-sp-3)}
.wx-pda-btns .wx-btn{min-height:44px}
.wx-pda-kv{display:flex;flex-direction:column;gap:var(--wx-sp-2);padding:var(--wx-sp-3);background:var(--wx-white);border-radius:8px}
.wx-pda-kv-row{display:flex;justify-content:space-between;gap:var(--wx-sp-2);font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-pda-kv-row b{font-weight:600;color:var(--wx-gray-900)}
.wx-pda-progress{height:8px;border-radius:var(--wx-r-pill);background:var(--wx-gray-100);overflow:hidden}
.wx-pda-progress i{display:block;height:100%;border-radius:var(--wx-r-pill);background:var(--wx-primary-500);transition:width .3s}
.wx-pda .wx-btn{min-height:44px}
@media (max-width:480px){
  .wx-pda{padding:0;align-items:stretch}
  .wx-pda-device{width:100%;padding:0;border-radius:0;background:var(--wx-gray-50)}
  .wx-pda-cam,.wx-pda-led,.wx-pda-key-side{display:none}
  .wx-pda-screen{width:100%;height:100vh;border-radius:0}
}
`;

export const PDA_SCRIPT = `
(function(){
  var screens = Array.prototype.slice.call(document.querySelectorAll('.wx-pda-body .page'));
  var title = document.querySelector('[data-pda-title]');
  var toastEl = document.querySelector('[data-pda-toast]');
  var stack = [];
  var timer = null;
  function current(){
    for (var i = 0; i < screens.length; i++) if (!screens[i].hidden) return screens[i];
    return null;
  }
  function show(id, name, push){
    var cur = current();
    if (cur && cur.dataset.pageId === id) return;
    if (cur && push) stack.push(cur.dataset.pageId);
    var box = null;
    screens.forEach(function(s){
      s.hidden = s.dataset.pageId !== id;
      if (s.dataset.pageId === id) box = s;
    });
    if (title && name) title.textContent = name;
    var shell = document.querySelector('.wx-pda');
    var statusLeft = document.querySelector('[data-pda-status-left]');
    if (shell && statusLeft){
      var boot = shell.getAttribute('data-boot');
      statusLeft.textContent = id === boot ? '未登录' : (shell.getAttribute('data-operator') || '未登录');
    }
    if (box) box.scrollTop = 0;
  }
  function toast(msg){
    if (!toastEl || !msg) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(function(){ toastEl.hidden = true; }, 1400);
  }
  document.querySelectorAll('[data-pda-steps]').forEach(function(host){
    var firstBtn = host.querySelector('[data-pda-step-to]');
    if (firstBtn) firstBtn.classList.add('is-active');
  });
  document.addEventListener('click', function(e){
    var stepBtn = e.target.closest('[data-pda-step-to]');
    if (stepBtn){
      var host = stepBtn.closest('[data-pda-steps]') || stepBtn.closest('.page');
      if (host){
        var to = stepBtn.dataset.pdaStepTo;
        host.querySelectorAll('[data-pda-step-to]').forEach(function(b){ b.classList.toggle('is-active', b.dataset.pdaStepTo === to); });
        host.querySelectorAll('[data-pda-step]').forEach(function(s){ s.hidden = s.dataset.pdaStep !== to; });
      }
      return;
    }
    var tab = e.target.closest('[data-pda-tab]');
    if (tab){
      var name = tab.dataset.pdaTabName || '';
      if (!name){ var b = tab.querySelector('b'); name = b ? b.textContent : ''; }
      show(tab.dataset.pdaTab, name, true);
      return;
    }
    var key = e.target.closest('[data-pda-key]');
    if (key){
      var k = key.dataset.pdaKey;
      if (k === 'back'){
        var prev = stack.pop();
        if (prev) show(prev, '', false); else toast('已在首页（原型示意）');
        return;
      }
      if (k === 'home' || k === 'menu'){
        stack.length = 0;
        show(screens[0].dataset.pageId, '', false);
        return;
      }
      if (k === 'clear'){
        var c1 = current(); var i1 = c1 && c1.querySelector('input');
        if (i1){ i1.value = ''; i1.focus(); }
        return;
      }
      if (k === 'scan'){
        var c2 = current(); var i2 = c2 && c2.querySelector('input');
        if (i2) i2.focus();
        toast('扫码录入（原型示意）');
        return;
      }
      if (k === 'ok'){
        var c3 = current();
        var btn = (c3 && c3.querySelector('[data-pda-ok]')) || (c3 && c3.querySelector('.wx-btn--primary'));
        if (btn) btn.click(); else toast('确认（原型示意）');
        return;
      }
    }
    var toastBtn = e.target.closest('[data-toast]');
    if (toastBtn) toast(toastBtn.dataset.toast);
  });
  var shellEl = document.querySelector('.wx-pda');
  var bootId = (shellEl && shellEl.getAttribute('data-boot')) || (screens[0] && screens[0].dataset.pageId) || '';
  if (bootId) show(bootId, '', false);
})();
`;

export function renderShopShell({ product = '', appName = '', userLabel = '', nav = [], categories = [], cartCount = 0, content = '' } = {}) {
  const navHtml = nav.map((n) => `<button type="button" class="wx-shop-nav-item${n.id === 'mall/home' ? ' is-active' : ''}" data-target="${esc(n.id)}">${esc(n.name)}</button>`).join('');
  const catHtml = categories.map((c) => `<button type="button" class="wx-shop-cat-item${c === '全部商品' ? ' is-active' : ''}" data-shop-cat="${esc(c)}">${esc(c)}</button>`).join('');
  return `<div class="wx-shop-app">\n`
    + `<header class="wx-shop-top"><div class="wx-shop-top-inner">`
    + `<button type="button" class="wx-shop-brand" data-target="mall/home"><span class="wx-shop-brand-mark">仓</span>`
    + `<span class="wx-shop-brand-copy"><b>${esc(product)}</b><small>${esc(appName)}</small></span></button>`
    + `<div class="wx-shop-search"><input type="text" data-shop-search placeholder="搜索商品" aria-label="搜索商品">`
    + `<button type="button" data-shop-search-go>搜索商品</button></div>`
    + `<div class="wx-shop-top-tools">`
    + `<button type="button" class="wx-shop-tool" data-target="mall/cart">进货单 <span class="wx-shop-cart-count" data-shop-cart-count>${esc(cartCount)}</span></button>`
    + `<button type="button" class="wx-shop-tool" data-target="mall/orders">我的订单</button>`
    + `<button type="button" class="wx-shop-login" data-login-open data-auth-guest>登录</button>`
    + `<button type="button" class="wx-shop-user" data-session-toggle data-auth-member>${esc(userLabel)}</button>`
    + `</div></div></header>\n`
    + `<nav class="wx-shop-nav"><div class="wx-shop-nav-inner">${navHtml}`
    + `<span class="wx-shop-nav-sep"></span>${catHtml}</div></nav>\n`
    + `<main class="wx-shop-main">${content}</main>\n`
    + `<footer class="wx-shop-foot">${esc(product)} · ${esc(appName)}｜货源由本部署货主提供，下单后由出库订单履约</footer>\n`
    + `<div class="wx-toast" hidden></div></div>\n`;
}

/* ---------------- 商城前台样式（结构层，色值只在 tokens.css.mjs） ---------------- */

export const MALL_CSS = `
.wx-shop-app{min-height:100vh;background:var(--wx-gray-50)}
.wx-shop-top{position:sticky;top:0;z-index:100;background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-shop-top-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:var(--wx-sp-6);padding:var(--wx-sp-3) var(--wx-sp-6)}
.wx-shop-brand{display:flex;align-items:center;gap:var(--wx-sp-2);cursor:pointer;border:0;background:transparent;padding:0}
.wx-shop-brand-mark{width:36px;height:36px;display:grid;place-items:center;border-radius:var(--wx-r-md);background:var(--wx-mall-500);color:var(--wx-white);font-size:var(--wx-fs-lg);font-weight:700}
.wx-shop-brand-copy{display:flex;flex-direction:column;line-height:1.2;text-align:left}
.wx-shop-brand-copy b{font-size:var(--wx-fs-lg)}
.wx-shop-brand-copy small{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-shop-search{flex:1;display:flex;height:38px;border:2px solid var(--wx-mall-500);border-radius:var(--wx-r-sm);overflow:hidden}
.wx-shop-search input{flex:1;min-width:0;border:0;outline:none;padding:0 var(--wx-sp-3);font-size:var(--wx-fs-md);background:var(--wx-white)}
.wx-shop-search button{border:0;background:var(--wx-mall-500);color:var(--wx-white);padding:0 var(--wx-sp-6);font-size:var(--wx-fs-md);font-weight:600}
.wx-shop-top-tools{display:flex;align-items:center;gap:var(--wx-sp-2)}
.wx-shop-tool{border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);padding:var(--wx-sp-2) var(--wx-sp-3);font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-shop-tool:hover{border-color:var(--wx-mall-500);color:var(--wx-mall-600)}
.wx-shop-cart-count{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 var(--wx-sp-1);border-radius:var(--wx-r-pill);background:var(--wx-mall-500);color:var(--wx-white);font-size:var(--wx-fs-xs);margin-left:var(--wx-sp-1)}
.wx-shop-user{border:0;background:transparent;font-size:var(--wx-fs-sm);color:var(--wx-gray-700);padding:var(--wx-sp-2)}
.wx-shop-nav{background:var(--wx-white);border-bottom:var(--wx-border)}
.wx-shop-nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:var(--wx-sp-4);padding:0 var(--wx-sp-6);flex-wrap:wrap}
.wx-shop-nav-item,.wx-shop-cat-item{border:0;background:transparent;padding:var(--wx-sp-3) 0;font-size:var(--wx-fs-md);color:var(--wx-gray-700)}
.wx-shop-nav-item.is-active,.wx-shop-cat-item.is-active{color:var(--wx-mall-600);font-weight:700}
.wx-shop-cat-item{color:var(--wx-gray-500);font-size:var(--wx-fs-sm)}
.wx-shop-nav-sep{width:1px;height:16px;background:var(--wx-gray-200)}
.wx-shop-main{max-width:1200px;margin:0 auto;padding:var(--wx-sp-6)}
.wx-shop-foot{border-top:var(--wx-border);background:var(--wx-white);padding:var(--wx-sp-6);text-align:center;font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-shop-page-head{display:flex;align-items:baseline;gap:var(--wx-sp-4);margin-bottom:var(--wx-sp-4)}
.wx-shop-page-head h1{margin:0;font-size:var(--wx-fs-xl);color:var(--wx-gray-900)}
.wx-shop-page-head span{font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-hero{display:grid;grid-template-columns:1fr 260px;gap:var(--wx-sp-6);align-items:center;padding:var(--wx-sp-8);border-radius:var(--wx-r-md);background:var(--wx-mall-50);border:var(--wx-border);margin-bottom:var(--wx-sp-6)}
.wx-shop-hero h2{margin:0 0 var(--wx-sp-2);font-size:var(--wx-fs-2xl);color:var(--wx-mall-600)}
.wx-shop-hero p{margin:0 0 var(--wx-sp-4);font-size:var(--wx-fs-md);color:var(--wx-gray-700)}
.wx-shop-btn{border:0;border-radius:var(--wx-r-sm);background:var(--wx-mall-500);color:var(--wx-white);padding:var(--wx-sp-2) var(--wx-sp-4);min-height:36px;font-size:var(--wx-fs-sm);font-weight:600}
.wx-shop-btn--ghost{background:var(--wx-white);color:var(--wx-gray-700);border:var(--wx-border);font-weight:400}
.wx-shop-hero-marks{display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-shop-hero-mark{display:flex;align-items:center;justify-content:space-between;padding:var(--wx-sp-3) var(--wx-sp-4);background:var(--wx-white);border-radius:var(--wx-r-sm);font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-hero-mark b{font-size:var(--wx-fs-lg);color:var(--wx-mall-600);font-variant-numeric:tabular-nums}
.wx-shop-home-grid{display:grid;grid-template-columns:200px 1fr;gap:var(--wx-sp-4);margin-bottom:var(--wx-sp-6)}
.wx-shop-cats{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);padding:var(--wx-sp-3)}
.wx-shop-cats-title{font-size:var(--wx-fs-md);font-weight:700;padding:var(--wx-sp-2) var(--wx-sp-3);color:var(--wx-gray-900)}
.wx-shop-cats button{display:block;width:100%;text-align:left;border:0;background:transparent;padding:var(--wx-sp-2) var(--wx-sp-3);border-radius:var(--wx-r-sm);font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-shop-cats button:hover,.wx-shop-cats button.is-active{background:var(--wx-mall-50);color:var(--wx-mall-600)}
.wx-shop-cats-note{padding:var(--wx-sp-3);font-size:var(--wx-fs-xs);color:var(--wx-gray-400);border-top:var(--wx-border);margin-top:var(--wx-sp-2)}
.wx-shop-floor{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);padding:var(--wx-sp-4);margin-bottom:var(--wx-sp-4)}
.wx-shop-floor-head{display:flex;align-items:baseline;gap:var(--wx-sp-3);margin-bottom:var(--wx-sp-4)}
.wx-shop-floor-head h2{margin:0;font-size:var(--wx-fs-lg);color:var(--wx-gray-900)}
.wx-shop-floor-head span{flex:1;font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-shop-floor-head button{border:0;background:transparent;color:var(--wx-mall-600);font-size:var(--wx-fs-sm)}
.wx-shop-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:var(--wx-sp-4)}
.wx-shop-card{border:var(--wx-border);border-radius:var(--wx-r-md);background:var(--wx-white);overflow:hidden;display:flex;flex-direction:column}
.wx-shop-thumb{position:relative;height:140px;display:grid;place-items:center;font-size:var(--wx-fs-2xl);font-weight:700;border-radius:var(--wx-r-sm)}
.wx-shop-thumb--food{background:var(--wx-warn-soft);color:var(--wx-warn-500)}
.wx-shop-thumb--daily{background:var(--wx-info-soft);color:var(--wx-info-500)}
.wx-shop-thumb--home{background:var(--wx-success-soft);color:var(--wx-success-500)}
.wx-shop-thumb--digital{background:var(--wx-primary-50);color:var(--wx-primary-600)}
.wx-shop-thumb--sm{width:44px;height:44px;font-size:var(--wx-fs-md);flex:0 0 auto}
.wx-shop-badge{position:absolute;left:var(--wx-sp-2);top:var(--wx-sp-2);font-style:normal;font-size:var(--wx-fs-xs);padding:2px var(--wx-sp-2);border-radius:var(--wx-r-sm);background:var(--wx-mall-500);color:var(--wx-white)}
.wx-shop-card-body{padding:var(--wx-sp-3);display:flex;flex-direction:column;gap:var(--wx-sp-2)}
.wx-shop-card-title{font-size:var(--wx-fs-md);font-weight:600;line-height:1.4;cursor:pointer;border:0;background:transparent;padding:0;text-align:left;color:var(--wx-gray-900)}
.wx-shop-card-spec{font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-shop-card-price{display:flex;align-items:baseline;gap:var(--wx-sp-1)}
.wx-shop-card-price b{font-size:var(--wx-fs-xl);color:var(--wx-mall-600);font-variant-numeric:tabular-nums}
.wx-shop-card-price span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-shop-card-meta{display:flex;justify-content:space-between;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-shop-card-shop{display:flex;justify-content:space-between;align-items:center;padding-top:var(--wx-sp-2);border-top:var(--wx-border);font-size:var(--wx-fs-xs);color:var(--wx-gray-700)}
.wx-shop-card-shop em{font-style:normal;color:var(--wx-mall-600)}
.wx-shop-card-actions{display:flex;gap:var(--wx-sp-2);margin-top:var(--wx-sp-1)}
.wx-shop-card-actions .wx-shop-btn{flex:1;padding:var(--wx-sp-2) var(--wx-sp-1)}
.wx-shop-card-actions .wx-shop-btn--ghost{flex:0 0 auto}
.wx-shop-table{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);overflow:hidden}
.wx-shop-table-head,.wx-shop-cart-row{display:grid;grid-template-columns:2.2fr 1fr 1fr 1.1fr 1fr .7fr;gap:var(--wx-sp-3);align-items:center;padding:var(--wx-sp-3) var(--wx-sp-4)}
.wx-shop-table-head{background:var(--wx-gray-50);font-size:var(--wx-fs-xs);color:var(--wx-gray-500);border-bottom:var(--wx-border)}
.wx-shop-cart-row{border-bottom:var(--wx-border);font-size:var(--wx-fs-sm)}
.wx-shop-cart-goods{display:flex;align-items:center;gap:var(--wx-sp-3);min-width:0}
.wx-shop-cart-goods div{display:flex;flex-direction:column;gap:var(--wx-sp-1);min-width:0}
.wx-shop-cart-goods b{font-size:var(--wx-fs-sm);font-weight:600}
.wx-shop-cart-goods span:not(.wx-shop-thumb){font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-shop-qty{display:flex;align-items:center;border:var(--wx-border);border-radius:var(--wx-r-sm);overflow:hidden;width:fit-content}
.wx-shop-qty button{width:28px;height:30px;border:0;background:var(--wx-gray-50);font-size:var(--wx-fs-md)}
.wx-shop-qty input{width:44px;height:30px;border:0;text-align:center;font-size:var(--wx-fs-sm);background:var(--wx-white)}
.wx-shop-line-total{color:var(--wx-mall-600);font-variant-numeric:tabular-nums}
.wx-shop-link{border:0;background:transparent;color:var(--wx-gray-500);font-size:var(--wx-fs-sm)}
.wx-shop-cart-foot{display:flex;justify-content:flex-end;align-items:center;gap:var(--wx-sp-4);padding:var(--wx-sp-4);font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-cart-foot b{color:var(--wx-mall-600);font-size:var(--wx-fs-lg);font-variant-numeric:tabular-nums}
.wx-shop-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--wx-sp-4);padding:var(--wx-sp-4);background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);margin-bottom:var(--wx-sp-4)}
.wx-shop-fields div{display:flex;flex-direction:column;gap:var(--wx-sp-1)}
.wx-shop-fields span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-shop-fields b{font-size:var(--wx-fs-md);font-weight:600}
.wx-shop-panel{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);padding:var(--wx-sp-4);margin-bottom:var(--wx-sp-4);box-shadow:var(--wx-shadow)}
.wx-shop-panel h2{margin:0 0 var(--wx-sp-4);font-size:var(--wx-fs-md)}
.wx-shop-shop-row{display:flex;align-items:center;gap:var(--wx-sp-4);padding:var(--wx-sp-3) var(--wx-sp-4);border-bottom:var(--wx-border)}
.wx-shop-shop-row:last-child{border-bottom:0}
.wx-shop-shop-row b{font-size:var(--wx-fs-md)}
.wx-shop-shop-row span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-shop-shop-row em{margin-left:auto;font-style:normal;color:var(--wx-mall-600);font-size:var(--wx-fs-sm)}
.wx-shop-shop-row button{margin-left:var(--wx-sp-2)}
.wx-shop-summary{margin-left:auto;width:320px;display:flex;flex-direction:column;gap:var(--wx-sp-2);padding:var(--wx-sp-4);background:var(--wx-gray-50);border-radius:var(--wx-r-sm)}
.wx-shop-summary div{display:flex;justify-content:space-between;font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-summary b{font-variant-numeric:tabular-nums}
.wx-shop-summary .wx-shop-summary-total{border-top:var(--wx-border);padding-top:var(--wx-sp-2);font-size:var(--wx-fs-md);color:var(--wx-gray-900)}
.wx-shop-summary .wx-shop-summary-total b{color:var(--wx-mall-600);font-size:var(--wx-fs-xl)}
.wx-shop-actions{display:flex;justify-content:flex-end;gap:var(--wx-sp-3);padding:var(--wx-sp-4) 0}
.wx-shop-order{background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);margin-bottom:var(--wx-sp-4);overflow:hidden}
.wx-shop-order-head{display:flex;align-items:center;gap:var(--wx-sp-4);padding:var(--wx-sp-3) var(--wx-sp-4);background:var(--wx-gray-50);font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-order-head span:first-child{color:var(--wx-gray-900);font-weight:600}
.wx-shop-order-body{display:flex;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-4)}
.wx-shop-order-body div{display:flex;flex-direction:column;gap:var(--wx-sp-1);flex:1}
.wx-shop-order-body b{font-size:var(--wx-fs-md)}
.wx-shop-order-body small{font-size:var(--wx-fs-xs);color:var(--wx-gray-400)}
.wx-shop-order-body .wx-shop-order-amount{font-size:var(--wx-fs-lg);color:var(--wx-mall-600);font-variant-numeric:tabular-nums}
.wx-shop-order-foot{display:flex;align-items:center;gap:var(--wx-sp-4);padding:var(--wx-sp-3) var(--wx-sp-4);border-top:var(--wx-border);font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.wx-shop-order-foot button{margin-left:auto}
.wx-shop-filter{display:flex;align-items:center;gap:var(--wx-sp-2);flex-wrap:wrap;margin-bottom:var(--wx-sp-4)}
.wx-shop-filter-label{font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-chip{border:var(--wx-border);border-radius:var(--wx-r-pill);background:var(--wx-white);padding:var(--wx-sp-1) var(--wx-sp-3);font-size:var(--wx-fs-sm);color:var(--wx-gray-700)}
.wx-shop-chip.is-active{background:var(--wx-mall-50);border-color:var(--wx-mall-500);color:var(--wx-mall-600)}
.wx-shop-empty{margin-top:var(--wx-sp-4)}
.wx-shop-detail{display:grid;grid-template-columns:260px 1fr;gap:var(--wx-sp-6);padding:var(--wx-sp-4);background:var(--wx-white);border:var(--wx-border);border-radius:var(--wx-r-md);margin-bottom:var(--wx-sp-4)}
.wx-shop-thumb--lg{height:220px;font-size:var(--wx-fs-2xl)}
.wx-shop-detail-copy{display:flex;flex-direction:column;gap:var(--wx-sp-3)}
.wx-shop-detail-copy>b{font-size:var(--wx-fs-xl)}
.wx-shop-detail-copy>span{font-size:var(--wx-fs-sm);color:var(--wx-gray-500)}
.wx-shop-detail-copy .wx-shop-card-price b{font-size:var(--wx-fs-2xl)}
.wx-shop-detail-copy .wx-shop-card-actions{max-width:320px}
.wx-shop-login{border:0;border-radius:var(--wx-r-sm);background:var(--wx-mall-500);color:var(--wx-white);padding:var(--wx-sp-2) var(--wx-sp-4);font-size:var(--wx-fs-sm);font-weight:600}
.wx-shop-hero-actions{display:flex;align-items:center;gap:var(--wx-sp-4);flex-wrap:wrap}
.wx-shop-hero-guest{display:flex;align-items:center;gap:var(--wx-sp-2);font-size:var(--wx-fs-sm);color:var(--wx-mall-600)}
.wx-shop-hero-guest .wx-shop-btn{background:var(--wx-white);color:var(--wx-mall-600);border:var(--wx-border);font-weight:400}
.wx-shop-price{display:inline-flex;align-items:baseline;gap:var(--wx-sp-1)}
.wx-shop-price-guest{border:0;background:transparent;padding:0;font-size:inherit;font-weight:600;color:var(--wx-mall-600);white-space:nowrap;text-decoration:underline;text-underline-offset:3px}
.wx-shop-card-price .wx-shop-price-guest{font-size:var(--wx-fs-md)}
.wx-shop-summary .wx-shop-price-guest,.wx-shop-order-body .wx-shop-price-guest{font-size:var(--wx-fs-sm)}
@media (max-width:1080px){.wx-shop-grid{grid-template-columns:repeat(3,1fr)}.wx-shop-home-grid{grid-template-columns:160px 1fr}}
@media (max-width:800px){.wx-shop-grid{grid-template-columns:repeat(2,1fr)}.wx-shop-home-grid,.wx-shop-hero{grid-template-columns:1fr}.wx-shop-fields{grid-template-columns:repeat(2,1fr)}.wx-shop-table-head,.wx-shop-cart-row{grid-template-columns:2fr 1fr 1fr 1fr}}
`;

export function ShopHomeGrid({ side = '', main = '' } = {}) {
  return `<div class="wx-shop-home-grid"><div>${side}</div><div>${main}</div></div>`;
}

export function ShopRow({ name = '', note = '', value = '', action = '' } = {}) {
  const btn = action
    ? `<button type="button" class="wx-shop-btn wx-shop-btn--ghost" data-toast="${esc(action)}（原型示意）">${esc(action)}</button>`
    : '';
  return `<div class="wx-shop-shop-row"><b>${esc(name)}</b><span>${esc(note)}</span><em>${esc(value)}</em>${btn}</div>`;
}

export function ShopResult({ count = 0 } = {}) {
  return `<div class="wx-shop-filter"><span class="wx-shop-filter-label">共 <b data-shop-result-count>${esc(count)}</b> 件商品</span></div>`;
}

export function ShopEmpty() {
  return `<div class="wx-empty wx-shop-empty" data-shop-empty hidden><b>暂无商品</b><span>当前筛选条件下没有任何记录。</span></div>`;
}

export function ShopTable({ columns = [], rows = [] } = {}) {
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
  const body = rows.map((r) => `<tr>${columns.map((c) => `<td>${c.price ? ShopPrice(r[c.key]) : dash(r[c.key])}</td>`).join('')}</tr>`).join('');
  return `<div class="wx-shop-table"><table class="wx-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

export function ShopActions({ items = [] } = {}) {
  const attrs = (i) => [
    i.target ? `data-target="${esc(i.target)}"` : '',
    i.submit ? 'data-shop-submit' : '',
    i.group ? `data-shop-submit-group="${esc(i.group)}"` : '',
    i.toast ? `data-toast="${esc(i.toast)}"` : '',
  ].filter(Boolean).join(' ');
  return `<div class="wx-shop-actions">${items.map((i) => `<button type="button" class="wx-shop-btn${i.ghost ? ' wx-shop-btn--ghost' : ''}" ${attrs(i)}>${esc(i.label)}</button>`).join('')}</div>`;
}

export function ShopDetailHero(p = {}) {
  return `<div class="wx-shop-detail"><div class="wx-shop-thumb wx-shop-thumb--${esc(p.tone || 'food')} wx-shop-thumb--lg">${esc(String(p.skuName || '货').slice(0, 1))}</div>`
    + `<div class="wx-shop-detail-copy"><b>${esc(p.skuName)}</b>`
    + `<span>${esc(p.spec)} · ${esc(p.unit)} · ${esc(p.owner)}</span>`
    + `<div class="wx-shop-card-price">${ShopPrice(p.price)}<span class="wx-shop-price-value">/ ${esc(p.unit)}</span></div>`
    + `<span>起批 ${esc(p.minQty)} ${esc(p.unit)} · 可售 ${esc(p.stock)} · 店铺评分 ${esc(p.score)}</span>`
    + `<div class="wx-shop-card-actions">`
    + `<button type="button" class="wx-shop-btn" data-shop-add data-shop-sku="${esc(p.skuCode || '')}">加入进货单</button>`
    + `<button type="button" class="wx-shop-btn wx-shop-btn--ghost" data-target="mall/checkout">立即下单</button>`
    + `</div></div></div>`;
}

/* ---------------- 商城前台交互（构建内联一份） ---------------- */

export const MALL_SCRIPT = `
(function(){
  function pages(){ return Array.prototype.slice.call(document.querySelectorAll('.page[data-page-id]')); }
  function current(){ return document.querySelector('.page[data-page-id]:not([hidden])'); }
  function toast(text){
    var t = document.querySelector('.wx-toast');
    if (!t) return;
    t.textContent = text; t.hidden = false;
    window.setTimeout(function(){ t.hidden = true; }, 2200);
  }
  function money(v){ return '￥' + Number(v || 0).toFixed(2); }
  var cat = '全部商品', q = '', cartCount = 0;
  var buyerOwner = '';
  try {
    var ownerMatch = (location.search || '').match(/[?&]owner=([^&]*)/);
    if (ownerMatch) buyerOwner = decodeURIComponent(ownerMatch[1]) || '';
  } catch (e) { buyerOwner = ''; }
  function activate(id, push){
    var hit = null;
    pages().forEach(function(p){
      var on = p.getAttribute('data-page-id') === id;
      p.hidden = !on;
      if (on) hit = p;
    });
    if (!hit) return;
    Array.prototype.slice.call(document.querySelectorAll('.wx-shop-nav-item')).forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-target') === id);
    });
    window.scrollTo(0, 0);
    if (push !== false) { try { location.hash = id; } catch(e){} }
  }
  function setCat(value){
    cat = value || '全部商品';
    Array.prototype.slice.call(document.querySelectorAll('[data-shop-cat]')).forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-shop-cat') === cat);
    });
  }
  function applyFilter(){
    var page = document.querySelector('.page[data-page-id="mall/search"]');
    if (!page) return;
    var shown = 0;
    Array.prototype.slice.call(page.querySelectorAll('[data-shop-card]')).forEach(function(c){
      var okCat = cat === '全部商品' || (c.getAttribute('data-cat') || '') === cat;
      var okQ = !q || (c.getAttribute('data-shop-name') || '').indexOf(q) !== -1;
      var ok = okCat && okQ;
      c.hidden = !ok;
      if (ok) shown++;
    });
    var empty = page.querySelector('[data-shop-empty]');
    if (empty) empty.hidden = shown !== 0;
    var count = page.querySelector('[data-shop-result-count]');
    if (count) count.textContent = String(shown);
  }
  function sumRows(root){
    var total = 0, kinds = 0;
    Array.prototype.slice.call(root.querySelectorAll('[data-shop-cart-row]')).forEach(function(row){
      if (row.hidden) return;
      var price = Number(row.getAttribute('data-shop-price') || 0);
      var input = row.querySelector('[data-shop-qty-input]');
      var qty = Math.max(1, Number(input ? input.value : 1) || 1);
      var cell = row.querySelector('[data-shop-line-total]');
      if (cell) cell.textContent = money(price * qty);
      total += price * qty; kinds++;
    });
    return { total: total, kinds: kinds };
  }
  function writeTotals(root, sum){
    Array.prototype.slice.call(root.querySelectorAll('[data-shop-total]')).forEach(function(el){ el.textContent = money(sum.total); });
    Array.prototype.slice.call(root.querySelectorAll('[data-shop-goods-total]')).forEach(function(el){ el.textContent = money(sum.total); });
    Array.prototype.slice.call(root.querySelectorAll('[data-shop-item-count]')).forEach(function(el){ el.textContent = String(sum.kinds); });
  }
  function recalc(){
    var cart = document.querySelector('.page[data-page-id="mall/cart"]');
    if (cart) writeTotals(cart, sumRows(cart));
    Array.prototype.slice.call(document.querySelectorAll('[data-shop-group]')).forEach(function(g){
      writeTotals(g, sumRows(g));
    });
  }
  function bumpCart(by){
    cartCount = Math.max(0, cartCount + by);
    Array.prototype.slice.call(document.querySelectorAll('[data-shop-cart-count]')).forEach(function(el){ el.textContent = String(cartCount); });
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest ? e.target.closest('button, [data-toast]') : null;
    if (!el || el.hasAttribute('data-session-toggle')) return;
    if (el.hasAttribute('data-target')) { activate(el.getAttribute('data-target')); return; }
    if (el.hasAttribute('data-shop-cat')) { setCat(el.getAttribute('data-shop-cat')); activate('mall/search'); applyFilter(); return; }
    if (el.hasAttribute('data-shop-search-go')) { activate('mall/search'); applyFilter(); return; }
    if (el.hasAttribute('data-shop-add')) {
      var card = el.closest('[data-shop-card]');
      var cardOwner = card ? card.getAttribute('data-shop-owner') || '' : '';
      if (buyerOwner && cardOwner && cardOwner === buyerOwner) { toast('不允许买自己的货'); return; }
      bumpCart(1); toast('已加入进货单（原型示意）'); return;
    }
    if (el.hasAttribute('data-shop-qty')) {
      var row = el.closest('[data-shop-cart-row]');
      var input = row ? row.querySelector('[data-shop-qty-input]') : null;
      if (!input) return;
      input.value = String(Math.max(1, (Number(input.value) || 1) + Number(el.getAttribute('data-shop-qty'))));
      recalc(); return;
    }
    if (el.hasAttribute('data-shop-remove')) {
      var r = el.closest('[data-shop-cart-row]');
      if (r) r.hidden = true;
      bumpCart(-1); recalc(); toast('已移除（原型示意）'); return;
    }
    if (el.hasAttribute('data-shop-submit')) {
      var groupOwner = el.getAttribute('data-shop-submit-group') || '';
      if (buyerOwner && groupOwner && groupOwner === buyerOwner) { toast('不允许买自己的货'); return; }
      if (groupOwner) { toast('提交本店订单（原型示意）'); return; }
      toast('订单已提交（原型示意）'); activate('mall/orders'); return;
    }
    if (el.hasAttribute('data-toast')) { toast(el.getAttribute('data-toast')); return; }
  });
  document.addEventListener('input', function(e){
    if (!e.target.hasAttribute || !e.target.hasAttribute('data-shop-search')) return;
    q = (e.target.value || '').trim();
    var cur = current();
    if (!cur || cur.getAttribute('data-page-id') !== 'mall/search') activate('mall/search', false);
    applyFilter();
  });
  window.addEventListener('hashchange', function(){
    var want = (location.hash || '').replace('#','');
    if (want) activate(want, false);
  });
  Array.prototype.slice.call(document.querySelectorAll('[data-shop-cart-count]')).forEach(function(el){
    cartCount = Number(el.textContent) || 0;
  });
  if (buyerOwner) {
    Array.prototype.slice.call(document.querySelectorAll('[data-session-user]')).forEach(function(el){ el.textContent = buyerOwner; });
    Array.prototype.slice.call(document.querySelectorAll('.wx-shop-user')).forEach(function(el){ el.textContent = buyerOwner; });
    document.documentElement.setAttribute('data-buyer-owner', buyerOwner);
  }
  setCat('全部商品'); recalc();
  var initial = (location.hash || '').replace('#','');
  var valid = initial && pages().some(function(p){ return p.getAttribute('data-page-id') === initial; });
  activate(valid ? initial : 'mall/home', false);
})();
`;
