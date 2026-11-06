import { ListPage, esc } from '../../shared/ui.mjs';

/**
 * PDA 设备登录屏。
 *
 * 形态是终端登录，不是网页登录表单：主路径是扫工号牌，备选是输入工号 + PIN，
 * 人脸识别交给设备摄像头页。没有「记住我」「忘记密码」「第三方登录」这类桌面语汇——
 * 现场忘记工号找班组长，不是在浏览器里自助找回。
 */
export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};

  const device = `<div class="pd-login-device">`
    + `<span class="pd-login-device-no">${esc(doc.device)}</span>`
    + `<span class="pd-login-device-state">未绑定</span>`
    + `<button type="button" class="pd-login-device-act" data-pda-tab="pda/pda-invite" data-pda-tab-name="接入自带手机">去接入</button>`
    + `</div>`;

  const scan = `<div class="pd-login-scan">`
    + `<button type="button" class="pd-login-cta" data-pda-step-to="pin">`
    + `<span class="pd-login-cta-icon" aria-hidden="true">▣</span>`
    + `<span><b>扫描工号牌</b><small>对准工牌条码，扫完直接进入</small></span>`
    + `</button>`
    + `<div class="pd-login-alt">`
    + `<button type="button" class="pd-login-alt-btn" data-pda-step-to="code">输入工号</button>`
    + `<button type="button" class="pd-login-alt-btn" data-pda-step-to="face">人脸识别</button>`
    + `</div></div>`;

  const code = `<div class="pd-login-step">`
    + `<div class="pd-login-step-head"><b>输入工号</b><span>扫不到工牌时用，工号见工牌正面</span></div>`
    + `<label class="pd-login-field"><span>工号</span>`
    + `<input class="pd-login-input" inputmode="numeric" maxlength="8" placeholder="请输入工号" autocomplete="off"></label>`
    + `<div class="pd-login-actions">`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="scan">返回</button>`
    + `<button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="pin">继续</button>`
    + `</div></div>`;

  const pin = `<div class="pd-login-step">`
    + `<div class="pd-login-step-head"><b>输入 PIN 码</b><span>${esc(doc.staffNo || '')} · 4 位数字</span></div>`
    + `<label class="pd-login-field"><span>PIN 码</span>`
    + `<input class="pd-login-input pd-login-pin" type="password" inputmode="numeric" maxlength="4" placeholder="请输入 4 位 PIN 码"></label>`
    + `<div class="pd-login-actions">`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="code">返回</button>`
    + `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="task/pda-home" data-pda-tab-name="作业首页">进入作业</button>`
    + `</div></div>`;

  const face = `<div class="pd-login-step">`
    + `<div class="pd-login-step-head"><b>人脸识别</b><span>摘掉口罩，正对屏幕上方摄像头</span></div>`
    + `<div class="pd-login-face"><span aria-hidden="true">☻</span><small>识别通过后直接进入作业</small></div>`
    + `<div class="pd-login-actions">`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="scan">返回</button>`
    + `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="pda/pda-face" data-pda-tab-name="人脸识别">开始识别</button>`
    + `</div></div>`;

  const body = `<div class="pd-login" data-pda-steps>`
    + `<div class="pd-login-brand"><span class="pd-login-mark" aria-hidden="true">仓</span>`
    + `<span><b>${esc(doc.product)}</b><small>${esc(doc.subtitle)}</small></span></div>`
    + device
    + `<div data-pda-step="scan">${scan}</div>`
    + `<div data-pda-step="code" hidden>${code}</div>`
    + `<div data-pda-step="pin" hidden>${pin}</div>`
    + `<div data-pda-step="face" hidden>${face}</div>`
    + `<p class="pd-login-foot">工号由班组长分配，无法登录请联系当班组长</p>`
    + `</div>`;

  return ListPage({ unit: '项', bare: true, body, rows: [] });
}

export const PAGE_CSS = `
.pd-login{display:flex;flex-direction:column;gap:var(--wx-sp-3)}
.pd-login-brand{display:flex;align-items:center;gap:var(--wx-sp-3);padding:var(--wx-sp-2) 0}
.pd-login-mark{width:36px;height:36px;display:grid;place-items:center;border-radius:var(--wx-r-md);background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:var(--wx-fs-lg)}
.pd-login-brand b{display:block;font-size:var(--wx-fs-md)}
.pd-login-brand small{display:block;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.pd-login-device{display:flex;align-items:center;gap:var(--wx-sp-2);padding:var(--wx-sp-2) var(--wx-sp-3);border-radius:var(--wx-r-sm);background:var(--wx-gray-50);font-size:var(--wx-fs-xs);color:var(--wx-gray-700)}
.pd-login-device-no{font-weight:600;color:var(--wx-gray-900)}
.pd-login-device-state{color:var(--wx-warn-500)}
.pd-login-device-act{margin-left:auto;border:0;background:transparent;color:var(--wx-primary-600);font-size:var(--wx-fs-xs);padding:var(--wx-sp-1)}
.pd-login-cta{display:flex;align-items:center;gap:var(--wx-sp-3);width:100%;min-height:72px;padding:var(--wx-sp-3) var(--wx-sp-4);border:0;border-radius:var(--wx-r-md);background:var(--wx-primary-500);color:var(--wx-white);text-align:left}
.pd-login-cta b{display:block;font-size:var(--wx-fs-lg)}
.pd-login-cta small{display:block;font-size:var(--wx-fs-xs);opacity:.85;margin-top:2px}
.pd-login-cta-icon{font-size:var(--wx-fs-xl)}
.pd-login-alt{display:grid;grid-template-columns:1fr 1fr;gap:var(--wx-sp-2);margin-top:var(--wx-sp-2)}
.pd-login-alt-btn{min-height:var(--wx-touch);border:var(--wx-border);border-radius:var(--wx-r-sm);background:var(--wx-white);color:var(--wx-gray-700);font-size:var(--wx-fs-sm)}
.pd-login-step{display:flex;flex-direction:column;gap:var(--wx-sp-3);padding:var(--wx-sp-4);border:var(--wx-border);border-radius:var(--wx-r-md);background:var(--wx-white)}
.pd-login-step-head b{display:block;font-size:var(--wx-fs-md)}
.pd-login-step-head span{display:block;margin-top:2px;font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.pd-login-field{display:flex;flex-direction:column;gap:var(--wx-sp-1)}
.pd-login-field span{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.pd-login-input{min-height:56px;border:var(--wx-border);border-radius:var(--wx-r-sm);padding:0 var(--wx-sp-3);font-size:var(--wx-fs-xl);text-align:center;letter-spacing:2px;background:var(--wx-white)}
.pd-login-pin{letter-spacing:12px}
.pd-login-face{display:flex;flex-direction:column;align-items:center;gap:var(--wx-sp-2);padding:var(--wx-sp-6) 0;background:var(--wx-gray-50);border-radius:var(--wx-r-sm);text-align:center}
.pd-login-face span{width:72px;height:72px;display:grid;place-items:center;border-radius:50%;background:var(--wx-primary-50);color:var(--wx-primary-600);font-size:32px}
.pd-login-face small{font-size:var(--wx-fs-xs);color:var(--wx-gray-500)}
.pd-login-actions{display:grid;grid-template-columns:1fr 1fr;gap:var(--wx-sp-2)}
.pd-login-actions .wx-btn{min-height:var(--wx-touch)}
.pd-login-foot{margin:0;text-align:center;font-size:var(--wx-fs-xs);color:var(--wx-gray-400);line-height:1.6}
`;
