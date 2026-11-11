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
| 布局尺寸 | `--wx-rail-w`(76) / `--wx-panel-w`(256) / `--wx-touch`(44) |
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
| 悬浮提示 | 只有列头 `tipKey` → 原生 `title`，无自定义 tooltip 与 info 图标载体 | 补充信息只挂得住列头，字段与按钮旁无落点；提示延迟与样式由浏览器决定 |
| 表格与分组语义 | 列头无 `scope`，页签无 `role="tablist"`，勾选组名用 `<span>` 未与组关联；表单字段靠 `label` 包裹隐式关联，图标按钮已有 `aria-label` | 读屏读得出字，读不出「这一列是什么、这一组是什么」；复杂表格与多选组的可访问性不完整 |

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
| `ListPage({ selectable, bulk })` / `BaseTable({ selectable, sortable })` | 批量处置与列头排序：`selectable` 出勾选列（需同时给行主键字段），`bulk` 传 `{ label, status }` 数组，点击把选中行的状态字段改成 `status` 并重算页签；列级 `sortable` 挂到 `<th data-sort-key>`，点格三态循环。未声明即不出现勾选列、箭头与批量按钮 |
| `DrawerButton` / `DrawerDetail` | 列表行下钻：`DrawerButton` 放操作列，`DrawerDetail` 作为 `renderPage` 的 `overlay` 返回；`DetailPage` 只作抽屉内容，不注册独立 `detail` 页 |
| `DagGraph` / `DagDrawer` | 工序编排类抽屉：`DagGraph` 传 `flowKey` / `nodes` / `edges`，节点给 `id` / `label` / `layer` / `gen` / `subject` / `cond` / `props`，边给 `from` / `to`；坐标与连线由组件算，页面不写位置、不拼 SVG。`DagDrawer` 作为 `renderPage` 的 `overlay` 返回，只承载编排抽屉，宽度 920，不注册独立页面、不新增骨架类型 |
| `ReportPage` / `BarRows` | 报表页收口：`ReportPage` 组装 `hero` / `stats` / `blocks`，`BarRows` 按 `label` / `value` 对输出构成横条；页面源不写 `wx-report` 外壳、不自带横条 CSS |
| `PdaTaskCard` | PDA 作业任务卡：传 `row` / `tab` / `tabName` / `status` / `codeKey` / `binLabel` / `binKey`，页面源不拼 `wx-pda-taskcard` |
| `FormDrawer` / `FormField` | 表单抽屉：`FormDrawer` 作为 `renderPage` 的 `overlay` 返回，字段由 `fields` 声明（`label` / `key` / `type` / `required` / `options` / `placeholder` / `readonly`），`type` 取 `text` / `number` / `select` / `date` / `textarea` / `checks`；`checks` 为多选勾选组，`options` 可给字符串或 `{ label, value, group }`，值以「、」拼接回写；`readonly` 用于审核留痕等只读展示，输入控件结构只在本文件与 `ui.mjs` 里出，页面模块不拼 HTML；`label` 必填且控件被 `label` 包裹，`placeholder` 不替代标签，`FormDrawer` 的 `note` 只放必留的后果提示 |
| `ListPage({ live })` | 内存状态机声明：`keyField` / `statusField` / `statusMeta` / `storageKey` / `columns`；`columns[].type` 取 `text` / `num` / `money` / `status` / `tag` / `action`，`action` 列可用 `button` 单独指定按钮文案。状态动作后由外壳脚本重绘行、状态列与页签计数 |
| `ScanPage` | 只给 PDA 作业页，见 `references/shells/pda.md` |
| `ShopPage` / `ShopHero` / `ShopCategory` / `ShopFloor` / `ProductCard` / `ShopHomeGrid` / `ShopRow` / `ShopPanel` / `ShopFilter` / `ShopResult` / `ShopEmpty` / `ShopDetailHero` / `OrderCard` | 仅 `shop` 页 |
| `ShopPrice` / `CartTable` / `ShopSummary` / `ShopTable` / `ShopFields` / `ShopActions` | 仅 `shop` 页；金额一律由 `ShopPrice` → `money()` 从单价与数量派生，访客态由组件出「登录可见价格」，`ShopTable` 金额列标 `price: true` |
| `renderShopShell` / `renderSiteShell` / `renderMobileShell` / `renderPdaShell` / `renderLogin` | 只由构建调用一次，页面模块不调 |
| `STOREFRONT_SCRIPT` / `SITE_CSS` / `MOBILE_CSS` | 独立站两端的切页、类目筛选、返回栈与结构样式，构建内联一份，页面模块不引 |

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
| `data-sort-key` / `data-sort-dir` | 可排序 `<th>` | 排序列字段名与当前方向（`asc` / `desc`），点整格三态循环，方向由箭头表达 |
| `data-select-all` / `data-select-row` | 表头全选框 / 行勾选格 | `data-select-row` 的值取行主键；勾选集合只存页面内存，切页清空 |
| `data-bulk` | 批量动作按钮 | 值为 `bulk[].status`；点击把选中行的状态字段改成该值并重算页签计数，选中为 0 时按钮禁用 |
| `data-print` | 工具条与抽屉底部 | 值为单据名；点击按打印媒体只输出当前页表格，表头补单据名与打印时间 |
| `data-filter-key` | 筛选控件 | 对应行字段名 |
| `data-toast` | 按钮 | 原型示意动作的提示文案 |
| `data-target` | 面板条目 / 商城导航 | 指向 `data-page-id`，唯一换页入口 |
| `data-domain` / `data-domain-panel` | 首栏业务域按钮 / 面板里的域容器 | 值取 `apps[].rail[].id`，两者一一对应；点首栏切到该域面板并激活该域首页，同一时刻只显示当前域 |
| `data-mall-entry` / `data-mall-base` | 货灵ERP面板表头「前往商城」链接 | 全库唯一的跨端入口标记；`href` 取货灵商城产物名相对路径 + `owner` 参数，`data-mall-base` 存不带参数的基准路径，切换演示身份时重拼 `owner`；`target="_blank"` 新开页面，构建期 `[跨端]` 校验 |
| `data-buyer-owner` | 货灵商城 `<html>` | 货灵商城读链接 `owner` 参数写入，顶栏与会话面板显示买家货主名称；加购与分组提交时拦截同货主商品 |
| `data-shop-group` | 结算页店铺分组容器 | 一页多组结算，金额按组独立求和；组内提交带 `data-shop-submit-group` |
| `data-nav-group` | `.page` 页面容器 | 本页所属导航段；外壳脚本据此反查所属业务域并同步首栏与面板当前态，缺省回退到 `data-page-id` 的模块段 |
| `data-drawer-open` / `data-drawer-key` | 列表操作列按钮 | 值为页 id 与行主键，打开 `data-drawer-panel` 对应的那块面板 |
| `data-drawer-panel` / `data-drawer-close` | 抽屉面板 / 关闭按钮与遮罩 | 面板挂 `.wx-overlay` 并默认 `hidden`；切页、点关闭按钮或遮罩都统一收起 |
| `data-form-key` | 表单输入控件 | 对应行字段名；`SHELL_SCRIPT` 收集表单值、做必填校验并回写内存行 |
| `data-form-open` / `data-form-row` | 工具条与操作列的打开按钮 | 值为页 id 与行主键，打开 `data-drawer-panel` 里的表单面板；新建时行主键取 `__new__` |
| `data-form-action` / `data-form-submit` | 表单动作按钮 | 动作名与提交标记；`SHELL_SCRIPT` 按动作改 `data-live` 声明的状态字段并重算列表与页签 |
| `data-form-required` | 必填输入控件 | 值为字段标签，校验失败按 glossary「请填写 + 字段标签」提示 |
| `data-form-check-group` / `data-form-check` | 多选勾选组 / 单个复选 | 组上存字段名，复选上存选项值；`SHELL_SCRIPT` 以「、」拼接回写，`fillForm` 按「、」拆分回显 |
| `data-live` | `.wx-list` | 本页状态机配置 JSON：`keyField` / `statusField` / `statusMeta` / `columns` / `storageKey`；行数据取 `data-row`，状态动作只在内存与 `sessionStorage` 中生效 |
| `data-status-cell` | 状态列 `<td>` | 状态动作后由 `SHELL_SCRIPT` 按 `statusMeta` 重绘该单元格 |
| `data-side-toggle` | 面板底部按钮 | 折叠 / 展开导航面板，收起后只剩首栏；状态写 `sessionStorage` 的 `wx-nav-collapsed` |
| `data-global-search` | 面板表头搜索框 | 按页面名过滤当前域的面板条目，段标签无命中时一并隐藏 |
| `data-pda-tab` / `data-pda-group` / `data-pda-key` / `data-pda-title` | PDA 外壳与入口卡 | 屏内切页、分组 tab 高亮（值为组内 `data-page-id` 竖线分隔）、按键区、导航标题 |
| `data-mobile-tab` / `data-mobile-group` / `data-mobile-back` | 独立站 APP 外壳 | 底部 tab、组内高亮（值为组内 `data-page-id` 竖线分隔）与返回栈；`data-mobile-tab` 切页时清空返回栈 |
| `data-page-name` | 独立站与独立站 APP 的 `.page` | 构建期按注册表页面名写入，外壳脚本据此切换导航标题 |
| `data-login-tab` / `data-login-panel` | 登录方式页签 / 面板 | 切换登录方式 |
| `data-login-submit` / `data-login-retry` | 登录按钮 / 重试按钮 | 统一提交与重试 |
| `data-login-error` | 登录错误条 | 统一错误提示 |
| `data-login-open` / `data-login-close` | 商城登录入口 / 登录层关闭按钮 | 唤起与关闭 `entry` 模式登录层 |
| `data-login-gate` | 登录层 | `1` 后台三端与 PDA 全屏覆盖，`0` 货灵商城与独立站入口唤起 |
| `data-auth` | `<html>` | `guest` / `member`，由登录状态机写入，驱动商城金额与登录入口显隐 |
| `data-auth-guest` / `data-auth-member` | 访客 / 已登录专属元素 | 按 `data-auth` 显隐 |
| `data-session-toggle` / `data-session-*` | 首栏用户块 / 会话面板 | 登录态、令牌刷新与退出 |
| `data-shop-*` | 商城外壳与卡片 | 切页统一用 `data-target`；`data-shop-cat` 类目筛选、`data-shop-search` 商品搜索、`data-shop-add` 加入进货单、`data-shop-qty` 数量增减、`data-shop-remove` 移除、`data-shop-submit` 提交订单、`data-shop-cart-count` 进货单角标、`data-shop-total` 合计 |

## 6. 页面模块的边界

页面模块只写数据与组合，不写结构与样式：

```js
import { ListPage, StatusTag } from '../../shared/ui.mjs';

export function renderPage(data, ctx) { /* 只给 columns / rows / filters / toolbar */ }
export const PAGE_CSS = ``;   // 可选，类名以「模块前缀 + 页 key」开头
```

页面模块里出现 `<script>`、硬编码 hex、跨模块 import、大段手写结构 HTML、往数据里塞派生字段，都判违规。`renderPage(data, ctx)` 的 `data` 以页 key 为键，`ctx` 给 `{ moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped, modules }`，返回 HTML 字符串或 `{ html, overlay }`。
