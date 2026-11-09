import { ListPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};

  const block = (key, icon, title, desc, actions, hidden) => `<div data-pda-step="${key}"${hidden ? ' hidden' : ''}>`
    + `<div class="wx-pda-face"><span class="wx-pda-face-icon">${icon}</span><b>${title}</b>`
    + `<p>${desc}</p><div class="wx-pda-btns">${actions}</div></div></div>`;

  const body = `<div data-pda-steps>`
    + block('scan', '☻', '人脸识别', `识别到账号 ${esc(doc.staffName)}，正在核验面部特征`,
      `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="pda/pda-invite" data-pda-tab-name="接入自带手机">识别通过</button>`
      + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="noface">未登记人脸</button>`, false)
    + block('noface', '!', '未登记人脸', '本账号还没有面部底片，需要先采集一次',
      `<button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="capture">去登记</button>`
      + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-tab="pda/pda-login" data-pda-tab-name="登录">返回登录</button>`, true)
    + block('capture', '◎', '采集人脸', '正对摄像头，保持光线均匀，采集约 3 秒',
      `<button type="button" class="wx-btn wx-btn--primary" data-pda-step-to="submitted">开始采集</button>`
      + `<button type="button" class="wx-btn wx-btn--ghost" data-pda-step-to="scan">重采</button>`, true)
    + block('submitted', '✓', '已提交登记', '面部底片已提交，等待管理员审核后即可人脸登录',
      `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="pda/pda-login" data-pda-tab-name="登录">返回登录</button>`, true)
    + `</div>`;

  return ListPage({
    unit: '项',
    bare: true,
    body,
    rows: [],
    emptyTitle: '暂无内容',
    emptyDesc: '',
  });
}

export const PAGE_CSS = ``;
