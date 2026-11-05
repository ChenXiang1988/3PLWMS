# 统一页面设计规范

本文件是 [SKILL.md](../SKILL.md) 第 0、2、3 步的规范层展开。多人协作时**以本文件为唯一视觉与结构依据**：页面模块不自带审美，规范没写的取值一律不许出现。

## 1. 真值分层

| 层 | 文件 | 管什么 | 不许做什么 |
| --- | --- | --- | --- |
| 规范层 | 本文件、[glossary.md](glossary.md)、[modules.md](modules.md) | 上限、骨架、文案、模块边界 | 不写具体 hex 取值 |
| 实现层 | `prototypes/01 shared/tokens.css.mjs`（取值）、`prototypes/01 shared/ui.mjs`（组件与结构） | 色字号间距圆角、组件 HTML | 不新增规范未允许的组件 |
| 索引层 | `prototypes/01 shared/modules.json`、各模块 `module.json` | 装配、部署开关、交付元数据 | **只许引用，不许新增取值** |

推论：查色值去 `tokens.css.mjs`，查「能不能用」来本文件，查「叫什么名字」去 `glossary.md`。三处互相复制就是漂移的起点。

## 2. 设计基准与令牌

| 项 | 取值 |
| --- | --- |
| PC 设计基准 | 1440 × 900；内容区最小宽度 1080px，横向滚动优于压缩列 |
| PDA 设计基准 | 375 × 812；适配用 flex / grid / 百分比 / media query，**不用 `rpx`** |
| 最小触控目标 | 44px（`--wx-touch`） |
| 字体 | 系统字体栈，不引外部字体文件 |
| 布局尺寸 | 顶栏 54px、侧栏 188px（收起 64px）、页头 54px |
| 圆角 | 仅 `6px` / `8px` / `999px`，以及 0 |
| 字号 | 仅 12 / 13 / 14 / 16 / 20 / 24 px |
| 间距 | 仅 4 / 8 / 12 / 16 / 24 / 32 px |
| 色值 | 仅 `tokens.css.mjs` 里出现的 hex；页面模块里出现任何 hex 都判自创取值 |

令牌按语义取，不按观感取：

| 语义 | 令牌 |
| --- | --- |
| 主色（主按钮、高亮、进度） | `--wx-primary-500` / `--wx-primary-600` / `--wx-primary-50` / `--wx-primary-100` |
| 中性（背景、边框、文字） | `--wx-gray-50/100/200/400/500/700/900`、`--wx-white` |
| 成功软底 / 主色 | `--wx-success-soft` / `--wx-success-500` |
| 警告软底 / 主色 | `--wx-warn-soft` / `--wx-warn-500` |
| 危险软底 / 主色 | `--wx-error-soft` / `--wx-error-500` |
| 信息软底 / 主色 | `--wx-info-soft` / `--wx-info-500` |
| 圆角 / 阴影 / 边框 | `--wx-r-sm/md/pill`、`--wx-shadow`、`--wx-border` |
| 布局尺寸 | `--wx-top-h` / `--wx-side-w` / `--wx-side-collapsed` / `--wx-head-h` |
| 商城强调（价格、促销、主按钮） | `--wx-mall-50` / `--wx-mall-500` / `--wx-mall-600` |

判据：`var(--wx-*)` 出现在页面模块里是合法的；`#rrggbb` 出现即违规。零依赖图表用内联 SVG 或纯 CSS，用令牌上色，不引图表库。

## 3. 布局骨架

```
.wx-app（height:100vh，overflow:hidden）
├ .wx-top（fixed，54px）：品牌 / 全局搜索 / 工具与用户
├ .wx-shell（margin-top 顶栏高度，height:calc(100vh - 顶栏高度)）
│   ├ .wx-side（fixed，188px，可收起 64px）：模块分组 + 本端页面
│   └ .wx-main（margin-left 跟随侧栏）
│       ├ .wx-page-header（flex-shrink:0，钉住）：本模块页面页签 + 货主作用域
│       └ .wx-page-body（唯一滚动容器）：一屏一个 .page
└ .wx-toast / 抽屉与弹层挂 body 末尾
```

- 顶栏只放产品名、端名（品牌副标题）、全局搜索、工具与当前用户。不放部署形态、运营主体说明、「当前端：」这类装配元信息，也不放主体切换器。
- 侧栏按模块分组：一级 `data-nav` 只做展开 / 收起，不跳页；二级 `data-target` 直接切到本端页面。侧栏不列别的端页面，条目文案取 `pages[].name`。
- 页头页签按模块成组，只显示当前模块那组，是同模块内换页的入口；页面名逐字取 `pages[].name`。
- 页面归属只由注册表的 `pages[].app` 决定，不在页面名里加端前缀。
- 货主下拉放在页头右侧，取自 `modules.json` 的 `owners`，首项必须是「全部」。它只影响 `ownerScoped: true` 的页面：该页行上带 `data-owner`，切换时按值显隐。其余页面下拉 `hidden`。
- 页头钉住靠布局层级：`.wx-app` 固定高度、`.wx-page-body` 是唯一滚动容器，不用 `position:sticky`。
- `.page` 默认 `display:none`，靠 `.page:not([hidden])` 显示。**任何写了 `display` 的组件都要补 `[hidden]{display:none}`**，否则 `display:flex` 会压过浏览器默认隐藏规则。
- 登录层与会话面板挂 `.wx-app` 之后：登录层全屏覆盖，会话面板是弹层；两者不属于任何 `.page`，由共享外壳统一生成，不占页面注册表。
- 四个端共用同一份登录状态机与错误提示表，端差异只体现在品牌副标题与登录后的身份名称；商城端的用户块是采购账号。

## 4. 五类页面骨架

页面类型由 `modules.json` 的 `pages[].type` 声明，决定用哪套组件，不允许混搭。`shop` 只给 `shell = "mall"` 的商城端用，后台三端不得使用。

| 类型 | 组件 | 结构 | 硬约束 |
| --- | --- | --- | --- |
| `list` | `ListPage` | 状态页签 → 筛选条 → 工具条 → 表格 → 分页 | 一页一张表；**不加** `StatRow`、`ReportHero`、页内大标题、自绘筛选栏 |
| `detail` | `DetailPage` | 抬头字段网格 → 明细表 → 操作轨迹 → 底部操作条 | 抬头字段只读；明细用 `BaseTable`；不套状态页签与分页 |
| `report` | `ReportHero` + `StatRow` + `Block` | 页头 → 指标卡 → 分节卡片 | 唯一允许摆 KPI 的类型；指标值由数据算，不写死数字 |
| `scan` | `ScanPage` | 六段：导航 → 任务上下文 → 当前输入 → 对象摘要 → 数量与进度 → 操作 | 一屏只露当前一个输入；动作快照不铺成步骤表 |
| `shop` | `ShopPage` | 页头 → 楼层 / 卡片 / 表单 / 摘要，由页面自己组合共享组件 | 只用于商城端；不套 `ListPage` / `DetailPage` / `ReportHero` / `ScanPage`；不用侧栏与页头页签；不写页面级脚本 |

判据是「这页属于哪一类」，不是「组件能不能用」。报表页用了 `ReportHero` 或 `Block` 即豁免列表页禁令；列表页用了 `ListPage` 就不得出现 `StatRow` / `PageHeader`。

### 4.1 列表页细则

- `statusTabs` 第一项是「全部」，不带 `field`；其余每项**必须**带 `field` + `value`，点了要真筛数据。行数据放在 `<tr data-row="转义后的行 JSON">` 里，脚本按 `row[field] === value` 比。
- 计数写 `statusTabs[].count` 或 `scopeNote`，不另做统计卡片。
- `filters` 由 `filters` 数组传，`type` 仅 `text` / `select` / `date` / `daterange`；`select` 的 options 从行数据 `uniq()` 派生，不手抄枚举；`extra: true` 的收进「展开全部条件」。
- 数字列加 `align:'right'`，自动带 `tabular-nums`；列头口径说明用 `tipKey` 写进 `title`，**不许在 `<th>` 里塞按钮**。
- 全量 `<tr>` 都写进产物并带 `data-row-idx`，分页只做显隐，`unit` 随页面取（条 / 单 / 行 / 个 / 件）。
- 派生列写成纯函数，不往 `data/*.json` 里加展示字段，避免产生第二份真相。

### 4.2 PDA 作业页细则

六段的职责边界：导航说在哪一屏，任务上下文说哪张单哪道工序，当前输入只露**现在该扫的那一个**，对象摘要把扫到的东西摆出来，数量与进度给大数字，操作区一个次操作 + 一个主操作底部常驻。

写之前先答三句：人现在只该扫哪一个？扫到的东西显示在哪？这条做完该干嘛？答不上就是又想铺步骤表了。系统的校验序列（拦什么、留什么证）不是人的操作步骤，不落到界面上。

## 5. 组件取值约束

| 组件 | 允许的取值 |
| --- | --- |
| `StatusTag(text, tone)` | tone 仅 `disabled` / `enabled` / `info` / `pending` / `rejected`；成功用 `enabled`、危险用 `rejected`、警告用 `pending`、常态用 `info`、失效用 `disabled` |
| `Tag(text, tone)` | tone 仅 `default` / `info` / `danger` |
| `StatRow(items)` | `tone` 仅 `default` / `ok` / `alert` / `warn`；`cols` 取 3 或 4 |
| `ProgressCell(done, plan)` | 只展示进度，不自定义颜色 |
| `EmptyState` | 一页一处，标题 + 一句说明 |
| 抽屉 / 弹层 | 页面返回 `{ html, overlay }`，由构建挂 `<body>`；不写在 `.page` 内 |
| `ShopPage` / `ShopHero` / `ShopCategory` / `ShopFloor` / `ProductCard` | 仅 `shop` 页；结构由组件出，页面模块只给数据 |
| `CartTable` / `ShopSummary` / `OrderCard` / `ShopTable` / `ShopFields` / `ShopActions` | 仅 `shop` 页；金额一律由 `money()` 从单价与数量派生 |
| `renderShopShell` | 仅 `shell = "mall"` 的端外壳，构建时调用一次 |

状态中文名与色型的映射登记在 [glossary.md](glossary.md) 第 3 节，页面模块照抄，不自造词、不自造色型。

## 6. 文案规范

- 菜单名、页面名、页签、列名、按钮文案、状态中文名**逐字**取 `glossary.md`。
- 页面只放「读数」；「怎么读数」（指标定义、口径边界、设计理由、实现说明）收进 `tipKey` / `title` / `data-tip`，不摆在版面上。判据一句话：**这句话是数据本身，还是对数据的解释**？
- 禁止出现：实现注解、设计说明、`TODO`、`lorem`、占位符文案、「本期不做」「后续迭代」「示意代码」等过程文字。原型里不做真实动作的按钮挂 `data-toast` 给出结果提示，不写「暂不支持」。
- 空态、分页单位、日期格式统一按 `glossary.md` 第 5 节。
- 表头是纯文本列，任何 HTML 标签都会被转义成源码，不要在列头拼按钮或图标。

## 7. 命名与 data 属性

- 共享组件类名固定 `wx-` 前缀；页面自定义类名一律「模块前缀 + 页 key」（例：`ib-asn-bar`）。模块前缀表见 [modules.md](modules.md) 第 2 节。同名类跨页互相覆盖是真实返工来源。
- 页面容器选择器必须写成 `.page[data-page-id]`（类名限定）。分页条的当前页码属性刻意叫 `data-page-no`，不叫 `data-page`，避免全站选择器撞名。
- 多视图脚本以本页 `.page` 为根再查询，不用全站 `document.querySelectorAll`。

| 属性 | 位置 | 用途 |
| --- | --- | --- |
| `data-build` | `<html>` | 源指纹；`--check` 比对值 |
| `data-page-id` | `.page` | `<模块ID>/<页key>`，导航唯一依据 |
| `data-page-no` | 分页条 | 当前页码 |
| `data-tab-field` / `data-tab-value` | 页签按钮 | 真筛数据 |
| `data-row-idx` | `<tr>` | 分页显隐 |
| `data-row` | `<tr>` | 转义后的行 JSON，页签与筛选的取值来源 |
| `data-owner` | `<tr>` | 货主下拉作用域 |
| `data-filter-key` | 筛选控件 | 对应行字段名 |
| `data-toast` | 按钮 | 原型示意动作的提示文案 |
| `data-target` | 侧栏二级 / 页头页签 | 指向 `data-page-id`，唯一换页入口 |
| `data-nav` / `data-children` | 侧栏一级按钮 / 二级容器 | 模块分组展开与收起 |
| `data-tabs` | 页头页签组 | 只显示当前模块那组页签 |
| `data-side-toggle` | 侧栏底部按钮 | 侧栏收起 / 展开 |
| `data-global-search` | 顶栏搜索框 | 按页面名过滤侧栏与页头页签 |
| `data-login-tab` / `data-login-panel` | 登录方式页签 / 面板 | 切换登录方式 |
| `data-login-submit` / `data-login-retry` | 登录按钮 / 重试按钮 | 统一提交与重试 |
| `data-login-error` | 登录错误条 | 统一错误提示 |
| `data-session-toggle` / `data-session-*` | 顶栏用户块 / 会话面板 | 登录态、令牌刷新与退出 |
| `data-shop-target` 系列 | 商城外壳与卡片 | 切页统一用 `data-target`；`data-shop-cat` 类目筛选、`data-shop-search` 商品搜索、`data-shop-add` 加入进货单、`data-shop-qty` 数量增减、`data-shop-remove` 移除、`data-shop-submit` 提交订单、`data-shop-cart-count` 进货单角标、`data-shop-total` 合计 |

## 8. 非 SaaS 红线

产物中禁止出现下列词与对应界面：租户、账号空间、按租户分库、订阅、套餐、充值、续费、试用到期、升级专业版、平台运营后台、主体切换器。

3PL 的多货主是同一套部署内的业务数据维度，用「货主」字段、筛选与 `data-owner` 表达；不按租户做隔离话术，不画跨主体统计。报表与总览的口径是「本部署主体」，不是「全平台」。

商城端的多店铺同理：一家店铺对应本部署内的一个货主，卖的是货主的在仓货，用「货主店铺」与店铺评分表达。店铺数量、评分与入驻入口不构成租户体系，不写订阅、套餐、充值、续费、试用到期、升级专业版，不画平台运营后台与主体切换器。本节红线词一个都不放宽。

## 9. 多人协作一致性

| 场景 | 做法 |
| --- | --- |
| 分工 | 一个模块一个 owner，写在 `module.json`；只改自己模块的 `pages/` 与 `data/` |
| 改共享层 | 先改规范层，再改 `prototypes/01 shared/`，然后重建所有 `deployed: true` 模块；不得只重建自己那一个 |
| 并行开工 | 各自先跑本模块 `--check` 记 `data-build`，指纹与记录不符先停下确认 |
| 风格争议 | 以本文件与 `glossary.md` 裁决，不以个人审美裁决；确需新增取值走第 1 节的分层流程 |
| 交付 | 统一跑 `verify-delivery.mjs`，再逐条过 [acceptance.md](acceptance.md) 的 B 组人工项 |
