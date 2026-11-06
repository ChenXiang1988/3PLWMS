import { ListPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};

  const check = `<div data-pda-step="check">`
    + `<div class="wx-pda-kv">`
    + `<div class="wx-pda-kv-row"><span>当前版本</span><b>${esc(doc.currentVersion)}</b></div>`
    + `<div class="wx-pda-kv-row"><span>最新版本</span><b>${esc(doc.latestVersion)}</b></div>`
    + `<div class="wx-pda-kv-row"><span>安装包</span><b>${esc(doc.packageSize)}</b></div>`
    + `</div>`
    + `<div class="wx-pda-btns"><button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="updating">检查更新</button></div>`
    + `</div>`;

  const updating = `<div data-pda-step="updating" hidden><div class="wx-pda-face">`
    + `<span class="wx-pda-face-icon">⤓</span><b>更新中</b>`
    + `<p>正在下载 ${esc(doc.latestVersion)}，请勿关闭终端</p>`
    + `<div class="wx-pda-progress"><i style="width:64%"></i></div>`
    + `<div class="wx-pda-btns"><button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="done">下载完成</button></div>`
    + `</div></div>`;

  const done = `<div data-pda-step="done" hidden><div class="wx-pda-face">`
    + `<span class="wx-pda-face-icon">✓</span><b>已更新</b>`
    + `<p>${esc(doc.latestVersion)} 已安装，重启终端后生效</p>`
    + `<div class="wx-pda-btns"><button type="button" class="wx-btn wx-btn--primary" data-toast="重启终端（原型示意）">重启终端</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="task/pda-home" data-pda-tab-name="作业首页">返回作业</button></div>`
    + `</div></div>`;

  return ListPage({
    unit: '项',
    bare: true,
    body: `<div data-pda-steps>${check}${updating}${done}</div>`,
    rows: [],
    emptyTitle: '暂无内容',
    emptyDesc: '',
  });
}

export const PAGE_CSS = ``;
