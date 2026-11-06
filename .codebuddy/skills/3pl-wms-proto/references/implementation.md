# 实现层契约（令牌、组件、命名）

本文件是规范层与现场之间的唯一桥面。规范层说「能不能用」，本文件说「用哪个值、哪个组件、叫什么名字」，`prototypes/shared/` 是它的落地物。

## 1. 真值分层

| 层 | 文件 | 管什么 | 不许做什么 |
| --- | --- | --- | --- |
| 规范层 | `references/registry.md`、`references/core/*.md`、`references/shells/*.md` | 装配、骨架、上限、文案、验收 | 不写具体 hex 取值 |
| 实现层 | `prototypes/shared/tokens.css.mjs`（取值）、`prototypes/shared/ui.mjs`（组件与结构） | 色字号间距圆角、组件 HTML | 不新增规范未允许的组件 |
| 索引层 | `prototypes/shared/modules.json`、各模块 `module.json` | 装配、部署开关、交付元数据 | **只许引用，不许新增取值** |

推论：查色值去 `tokens.css.mjs`，查「能不能用」去 `references/shells/`，查「叫什么名字」去 `references/core/glossary.md`。三处互相复制就是漂移的起点。

## 2. 令牌

令牌按语义取，不按观感取。页面模块只许写 `var(--wx-*)`，出现 `#rrggbb` 即判自创取值。

| 语义 | 令牌 |
| --- | --- |
| 主色（主按钮、高亮、进度） | `--wx-primary-50/100/500/600` |
| 中性（背景、边框、文字） | `--wx-gray-50/100/200/400/500/700/900`、`--wx-white` |
| 成功软底 / 主色 | `--wx-success-soft` / `--wx-success-500` |
| 警告软底 / 主色 | `--wx-warn-soft` / `--wx-warn-500` |
| 危险软底 / 主色 | `--wx-error-soft` / `--wx-error-500` |
| 信息软底 / 主色 | `--wx-info-soft` / `--wx-info-500` |
| 圆角 / 阴影 / 边框 | `--wx-r-sm`(6) / `--wx-r-md`(8) / `--wx-r-pill`(999)、`--wx-shadow`、`--wx-border` |
| 字号 | `--wx-fs-xs`(12) / `sm`(13) / `md`(14) / `lg`(16) / `xl`(20) / `2xl`(24) |
| 间距 | `--wx-sp-1`(4) / `2`(8) / `3`(12) / `4`(16) / `6`(24) / `8`(32) |
| 布局尺寸 | `--wx-top-h`(54) / `--wx-side-w`(188) / `--wx-side-collapsed`(64) / `--wx-head-h`(54) / `--wx-touch`(44) |
| 商城强调 | `--wx-mall-50` / `--wx-mall-500` / `--wx-mall-600` |

**取值只有这些档位**：圆角只用 6 / 8 / 999 / 0，字号只用 12 / 13 / 14 / 16 / 20 / 24，间距只用 4 / 8 / 12 / 16 / 24 / 32。10、14、18、20px 这类插值一律不许，`rpx` 一律不许。

零依赖图表用内联 SVG 或纯 CSS，用令牌上色，不引图表库；产物里出现 `http(s)://` 引用即判自包含失败。

### 2.1 令牌缺口（待补齐，登记于 2026-11-06）

下列需求当前只能靠临时取值或干脆不做，按第 3 节流程补进 `tokens.css.mjs` 后，第 2 节表格同步更新：

| 缺口 | 现状 | 影响 |
| --- | --- | --- |
| 字重档 | 直接写 `font-weight:600/700` | 层级只能靠字号拉，`references/shells/admin.md` 第 5 节的三件套落不实 |
| 行高档 | 零散写 `line-height:1.2` 等 | 多行文本与表格行高不成节奏 |
| 焦点环 | 无令牌、无规则 | 键盘焦点不可见，`input` 上还有 `outline:none` |
| 阴影层级 | 只有一枚 `--wx-shadow` | 浮层与卡片同阴影，层级不分 |
| 信息色与主色 | `--wx-info-500`(#4f46e5) 与 `--wx-primary-500`(#2563eb) 色相接近 | 信息态胶囊会被读成主色，语义区分弱 |

### 2.2 新增取值的顺序

先改规范层（`references/shells/` 或本文件），再改 `prototypes/shared/tokens.css.mjs`，然后重建**所有** `deployed: true` 的模块与全部端产物，最后跑全量验收。反过来做（先在页面里补一个颜色）会在下次验收被 `[取值越界]` 拦下。

## 3. 组件白名单

页面模块只能用 `ui.mjs` 已导出的组件，不自造组件、不复制组件 HTML。

| 组件 | 允许的取值 |
| --- | --- |
| `StatusTag(text, tone)` | tone 仅 `disabled` / `enabled` / `info` / `pending` / `rejected`；成功用 `enabled`、危险用 `rejected`、警告用 `pending`、常态用 `info`、失效用 `disabled` |
| `Tag(text, tone)` | tone 仅 `default` / `info` / `danger` |
| `StatRow(items)` | `tone` 仅 `default` / `ok` / `alert` / `warn`；`cols` 取 3 或 4 |
| `ProgressCell(done, plan)` | 只展示进度，不自定义颜色 |
| `EmptyState` | 一页一处，标题 + 一句说明 |
| `BaseTable` / `ListPage` / `DetailPage` / `ReportHero` / `Block` | 后台外壳使用，见 `references/shells/admin.md` |
| `ScanPage` | 只给 PDA 作业页，见 `references/shells/pda.md` |
| `ShopPage` / `ShopHero` / `ShopCategory` / `ShopFloor` / `ProductCard` / `ShopHomeGrid` / `ShopRow` / `ShopPanel` / `ShopFilter` / `ShopResult` / `ShopEmpty` / `ShopDetailHero` / `OrderCard` | 仅 `shop` 页 |
| `ShopPrice` / `CartTable` / `ShopSummary` / `ShopTable` / `ShopFields` / `ShopActions` | 仅 `shop` 页；金额一律由 `ShopPrice` → `money()` 从单价与数量派生，访客态由组件出「登录可见价格」，`ShopTable` 金额列标 `price: true` |
| `renderShopShell` / `renderPdaShell` / `renderLogin` | 只由构建调用一次，页面模块不调 |

状态中文名与色型的映射登记在 `references/core/glossary.md` 第 3 节，照抄不自造。

## 4. 命名

- 共享组件类名固定 `wx-` 前缀；页面自定义类名一律「模块前缀 + 页 key」（例：`ib-asn-list-bar`）。模块前缀表见 `references/registry.md`。
- 页面容器选择器必须写成 `.page[data-page-id]`（类名限定）。分页条的当前页码属性刻意叫 `data-page-no`，不叫 `data-page`，避免全站选择器撞名。
- 多视图脚本以本页 `.page` 为根再查询，不用全站 `document.querySelectorAll`。
- 同名类跨页互相覆盖是真实返工来源，见 `references/core/anti-patterns.md`。

## 5. data-* 契约

| 属性 | 位置 | 用途 |
| --- | --- | --- |
| `data-build` | `<html>` | 源指纹；`--check` 比对值 |
| `data-page-id` | `.page` | `<模块ID>/<页key>`，导航唯一依据 |
| `data-page-no` | 分页条 | 当前页码 |
| `data-tab-field` / `data-tab-value` | 页签按钮 | 真筛数据 |
| `data-row-idx` | `<tr>` | 分页显隐 |
| `data-row` | `<tr>` | 转义后的行 JSON，页签与筛选的取值来源 |
| `data-owner` | `<tr>` | 货主筛选作用域 |
| `data-filter-key` | 筛选控件 | 对应行字段名 |
| `data-toast` | 按钮 | 原型示意动作的提示文案 |
| `data-target` | 侧栏二级 / 页头页签 / 商城导航 | 指向 `data-page-id`，唯一换页入口 |
| `data-nav` / `data-children` | 侧栏一级按钮 / 二级容器 | 模块分组展开与收起 |
| `data-tabs` | 页头页签组 | 只显示当前模块那组页签 |
| `data-side-toggle` | 侧栏底部按钮 | 侧栏收起 / 展开 |
| `data-global-search` | 顶栏搜索框 | 按页面名过滤侧栏与页头页签 |
| `data-pda-tab` / `data-pda-key` / `data-pda-title` | PDA 外壳与入口卡 | 屏内切页、按键区、导航标题 |
| `data-login-tab` / `data-login-panel` | 登录方式页签 / 面板 | 切换登录方式 |
| `data-login-submit` / `data-login-retry` | 登录按钮 / 重试按钮 | 统一提交与重试 |
| `data-login-error` | 登录错误条 | 统一错误提示 |
| `data-login-open` / `data-login-close` | 商城登录入口 / 登录层关闭按钮 | 唤起与关闭 `entry` 模式登录层 |
| `data-login-gate` | 登录层 | `1` 后台三端与 PDA 全屏覆盖，`0` 商城端入口唤起 |
| `data-auth` | `<html>` | `guest` / `member`，由登录状态机写入，驱动商城金额与登录入口显隐 |
| `data-auth-guest` / `data-auth-member` | 访客 / 已登录专属元素 | 按 `data-auth` 显隐 |
| `data-session-toggle` / `data-session-*` | 顶栏用户块 / 会话面板 | 登录态、令牌刷新与退出 |
| `data-shop-*` | 商城外壳与卡片 | 切页统一用 `data-target`；`data-shop-cat` 类目筛选、`data-shop-search` 商品搜索、`data-shop-add` 加入进货单、`data-shop-qty` 数量增减、`data-shop-remove` 移除、`data-shop-submit` 提交订单、`data-shop-cart-count` 进货单角标、`data-shop-total` 合计 |

## 6. 页面模块的边界

页面模块只写数据与组合，不写结构与样式：

```js
import { ListPage, StatusTag } from '../../shared/ui.mjs';

export function renderPage(data, ctx) { /* 只给 columns / rows / filters / toolbar */ }
export const PAGE_CSS = ``;   // 可选，类名以「模块前缀 + 页 key」开头
```

页面模块里出现 `<script>`、硬编码 hex、跨模块 import、大段手写结构 HTML、往数据里塞派生字段，都判违规。`renderPage(data, ctx)` 的 `data` 以页 key 为键，`ctx` 给 `{ moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped, modules }`，返回 HTML 字符串或 `{ html, overlay }`。
