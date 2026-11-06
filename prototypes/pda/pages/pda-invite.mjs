import { ListPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};

  const invite = `<div data-pda-step="invite"><div class="wx-pda-form">`
    + `<label class="wx-pda-field"><span>接入码</span>`
    + `<input value="${esc(doc.inviteCode)}" placeholder="请输入接入码" autocomplete="off"></label>`
    + `</div>`
    + `<div class="wx-pda-tip"><b>接入说明</b><div>接入码由值班管理员下发，一个接入码只能绑定一台终端。</div></div>`
    + `<div class="wx-pda-btns"><button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="done">确认接入</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="pda/pda-login" data-pda-tab-name="登录">返回登录</button></div>`
    + `</div>`;

  const done = `<div data-pda-step="done" hidden><div class="wx-pda-face">`
    + `<span class="wx-pda-face-icon">✓</span><b>接入完成</b>`
    + `<p>${esc(doc.device)} 已绑定本账号，可以开始作业</p>`
    + `<div class="wx-pda-btns"><button type="button" class="wx-btn wx-btn--primary" data-pda-tab="task/pda-home" data-pda-tab-name="作业首页">进入作业</button></div>`
    + `</div></div>`;

  return ListPage({
    unit: '项',
    bare: true,
    body: `<div data-pda-steps>${invite}${done}</div>`,
    rows: [],
    emptyTitle: '暂无内容',
    emptyDesc: '',
  });
}

export const PAGE_CSS = ``;
