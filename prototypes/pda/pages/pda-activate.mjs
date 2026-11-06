import { ListPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};

  const activate = `<div data-pda-step="activate">`
    + `<div class="wx-pda-kv">`
    + `<div class="wx-pda-kv-row"><span>设备编码</span><b>${esc(doc.deviceCode)}</b></div>`
    + `<div class="wx-pda-kv-row"><span>序列号</span><b>${esc(doc.serialNo)}</b></div>`
    + `</div>`
    + `<div class="wx-pda-tip"><b>激活说明</b><div>激活后本机只允许当前账号登录，换人使用需先解绑。</div></div>`
    + `<div class="wx-pda-btns"><button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="confirm">激活</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="pda/pda-login" data-pda-tab-name="登录">返回登录</button></div>`
    + `</div>`;

  const confirm = `<div data-pda-step="confirm" hidden><div class="wx-pda-face">`
    + `<span class="wx-pda-face-icon">▣</span><b>确认绑定本机</b>`
    + `<p>绑定后 ${esc(doc.deviceCode)} 归属当前账号，其他账号无法登录</p>`
    + `<div class="wx-pda-btns">`
    + `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="task/pda-home" data-pda-tab-name="作业首页">确认绑定</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="switch">换设备登录</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="activate">取消</button>`
    + `</div></div></div>`;

  const switcher = `<div data-pda-step="switch" hidden><div class="wx-pda-face">`
    + `<span class="wx-pda-face-icon">⇄</span><b>换设备登录</b>`
    + `<p>解绑后本机回到未激活状态，可在新终端重新激活</p>`
    + `<div class="wx-pda-btns">`
    + `<button type="button" class="wx-btn wx-btn--primary" data-toast="解绑本机（原型示意）">解绑本机</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="pda/pda-login" data-pda-tab-name="登录">去登录</button>`
    + `</div></div></div>`;

  return ListPage({
    unit: '项',
    bare: true,
    body: `<div data-pda-steps>${activate}${confirm}${switcher}</div>`,
    rows: [],
    emptyTitle: '暂无内容',
    emptyDesc: '',
  });
}

export const PAGE_CSS = ``;
