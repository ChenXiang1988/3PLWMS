import { ListPage, esc } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { doc = {} } = data[ctx.pageKey] || {};

  const kv = `<div class="wx-pda-kv">`
    + `<div class="wx-pda-kv-row"><span>设备编码</span><b>${esc(doc.deviceCode)}</b></div>`
    + `<div class="wx-pda-kv-row"><span>序列号</span><b>${esc(doc.serialNo)}</b></div>`
    + `<div class="wx-pda-kv-row"><span>上次登录</span><b>${esc(doc.lastLogin)}</b></div>`
    + `<div class="wx-pda-kv-row"><span>终端状态</span><b>${esc(doc.deviceStatus)}</b></div>`
    + `</div>`;

  const btns = `<div class="wx-pda-btns">`
    + `<button type="button" class="wx-btn wx-btn--primary" data-pda-tab="pda/pda-activate" data-pda-tab-name="激活本机">换机</button>`
    + `<button type="button" class="wx-btn wx-btn--ghost" data-toast="解绑本机（原型示意）">解绑本机</button>`
    + `</div>`;

  const tip = `<div class="wx-pda-tip"><b>换机说明</b><div>换机前请先完成本机在办任务，解绑后未提交的采集记录会作废。</div></div>`;

  return ListPage({
    unit: '项',
    bare: true,
    body: kv + tip + btns,
    rows: [],
    emptyTitle: '暂无内容',
    emptyDesc: '',
  });
}

export const PAGE_CSS = ``;
