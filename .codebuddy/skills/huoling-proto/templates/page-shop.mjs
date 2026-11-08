/**
 * shop 页骨架（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/<模块ID>/pages/<页key>.mjs，
 *       并替换 __MODULE_ID__ / __PAGE_KEY__ / __PAGE_NAME__ / __PREFIX__ 占位符。
 *       本文件放在 skill 目录里时，下面那行 import 的相对路径按
 *       prototypes/<模块ID>/pages/ 算，原地 import 会报 ERR_MODULE_NOT_FOUND。
 *
 * 硬约束（references/shells/mall.md 第 4 节）：
 *   1. 结构只走 ShopPage，页面模块只给数据，不拼大段结构 HTML、不写页面级脚本。
 *   2. 类名、列名、按钮文案逐字取 references/core/glossary.md；自定义样式类名以 __PREFIX__ 开头。
 *   3. 交互一律由共享组件的 data-shop-* 属性驱动，不在这里写脚本。
 */
import { ShopPage, ShopPanel, ProductCard, ShopActions } from '../../shared/ui.mjs';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const cards = rows.map((r) => ProductCard(r)).join('');

  return ShopPage({
    title: ctx.pageName,
    note: `共 ${rows.length} 件商品`,
    body: ShopPanel({ title: '__PAGE_NAME__', body: cards })
      + ShopActions({ items: [{ label: '继续选货', ghost: true, target: 'mall/search' }] }),
  });
}

export const PAGE_CSS = ``;
