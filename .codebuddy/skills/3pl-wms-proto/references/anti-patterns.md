# 误用全集

按「症状 → 根因 → 正确做法 → 出处」组织。出处为本 skill 的规范文件与节号；本工作区由本 skill 起建，条目来自参考 skill 已记录的真实返工类型与模块化产品特有边界，不是具体事故编号。

## 一、骨架与结构

### 1.1 给列表页加统计卡片、大标题、自绘筛选栏

- **症状**：页面顶部一排 6 张数字卡、一个大标题、一条自己写的筛选栏。
- **根因**：把「后台页面应该信息丰富」当成设计依据，没看列表页骨架。
- **正确做法**：计数放 `statusTabs[].count` 或 `scopeNote`；页内标题不写（侧栏已表明当前页）；筛选用 `ListPage` 的 `filters` 传。
- **出处**：[design-spec.md](design-spec.md) 第 4 节。
- **边界**：这条禁的是 `list` 页。`report` 页（用了 `ReportHero` 或 `Block`）本来就摆 KPI。判据是「这页属于哪一类」，不是「组件能不能用」。

### 1.2 页面模块里拼 HTML

- **症状**：`renderPage` 里 `return` 一大段手写 `<div>` 拼接，还可能带 `<script>`。
- **根因**：觉得组件不够灵活，就地改结构。
- **正确做法**：页面模块只写 `columns` / `rows` / `filters` / `toolbar` / `statusTabs`，结构交给 `ui.mjs`；交互由 `data-*` 属性驱动，脚本由构建内联一份。
- **出处**：[output-format.md](output-format.md) 第 3 节。

### 1.3 分页条是静态示意

- **症状**：「共 120 条」+ 两个禁用按钮，120 行全铺在屏上。
- **根因**：照抄静态模板，没注意本原型要求真能切页。
- **正确做法**：全量 `<tr>` 带 `data-row-idx` 写进产物，内联脚本只做显隐；`unit` 随页面取。
- **出处**：[design-spec.md](design-spec.md) 第 4.1 节。

### 1.4 发明菜单名、列名、页签文案

- **症状**：「入库通知单」被写成「到货预约单」，列名自己缩写。
- **根因**：凭语义重新命名，觉得更清楚。
- **正确做法**：逐字取 [glossary.md](glossary.md)；新增文案先登记再写页面。
- **出处**：[glossary.md](glossary.md) 第 6 节。

### 1.5 报表页用 `ListPage`，或列表页用 `ReportHero`

- **症状**：库存总览带状态页签和分页；入库通知单顶着 KPI 卡。
- **根因**：按「这页看起来信息多不多」挑组件，没按注册表 `type` 挑。
- **正确做法**：`type` 决定骨架，五类不混搭；`shop` 只用于商城端。
- **出处**：[design-spec.md](design-spec.md) 第 4 节；构建期 `[骨架]`。

## 二、CSS 与 DOM

### 2.1 同名 CSS 类互相覆盖

- **症状**：抽屉本该贴右侧，实际铺满全屏跑到左边。
- **根因**：两个页面模块都定义 `.drawer`，一个 `inset:0` 一个 `right:0`。
- **正确做法**：自定义类名一律「模块前缀 + 页 key」，例 `ib-asn-list-drawer`；共享组件用 `wx-`。
- **出处**：[design-spec.md](design-spec.md) 第 7 节；验收脚本 S4。

### 2.2 `[hidden]` 被 `display` 盖掉

- **症状**：属性上写了 `hidden`，货主下拉照样显示，不该按货主看的页也挂着下拉。
- **根因**：`.wx-scope{display:flex}` 压过了浏览器默认的 `[hidden]{display:none}`。
- **正确做法**：任何用 `display` 的组件都补 `[hidden]{display:none}`；`.page` 用 `display:none` + `:not([hidden])` 两条显式规则。
- **出处**：[design-spec.md](design-spec.md) 第 3 节。

### 2.3 选择器撞名

- **症状**：分页条被当成页面容器，切页时被写 `hidden` 且永不摘掉。
- **根因**：脚本用 `document.querySelectorAll('[data-page]')`，而分页条的当前页码也叫 `data-page`。
- **正确做法**：页面容器用类名限定 `.page[data-page-id]`；分页条当前页码刻意叫 `data-page-no`。
- **出处**：[design-spec.md](design-spec.md) 第 7 节。

### 2.4 抽屉写在 `.page` 内

- **症状**：切到别的页再切回来，抽屉按钮点了没反应。
- **根因**：`.page{display:none}` 把抽屉一起藏了。
- **正确做法**：页面返回 `{ html, overlay }`，构建把 overlay 挂 `<body>` 末尾。
- **出处**：[output-format.md](output-format.md) 第 1、3 节。

### 2.5 多视图脚本用全局选择器

- **症状**：某页的视图切换把别的页面板也藏了。
- **根因**：脚本用 `document.querySelectorAll('[data-view-panel]')`，全站只有一个这类面板时看不出问题，新页一加就串。
- **正确做法**：以本页 `.page[data-page-id="..."]` 为根再查询。
- **出处**：[design-spec.md](design-spec.md) 第 7 节。

## 三、数据与令牌

### 3.1 页面里写死色值

- **症状**：新页面写 `background:#e8f5e9`。
- **根因**：觉得颜色「差不多就行」，或从别处复制样式连色值一起带过来。
- **正确做法**：只取 `var(--wx-*)`；验收脚本 S3 现场从 `tokens.css.mjs` 收集白名单，写死色表会与实现漂移。
- **出处**：[design-spec.md](design-spec.md) 第 2 节。

### 3.2 `StatusTag` 传了未定义色型

- **症状**：状态胶囊落成灰底灰字，或直接让构建失败。
- **根因**：`ui.mjs` 只定义 `disabled` / `enabled` / `info` / `pending` / `rejected` 五种，页面传了 `ok` / `out` / `low`。
- **正确做法**：成功用 `enabled`、危险用 `rejected`、警告用 `pending`；中文名取 [glossary.md](glossary.md) 第 3 节。
- **出处**：[design-spec.md](design-spec.md) 第 5 节；构建期 `[色型]`。

### 3.3 往数据文件里塞派生字段

- **症状**：为了显示「下层容器数」，往任务 JSON 里加 `childCount`。
- **根因**：把展示逻辑固化进源数据。
- **正确做法**：派生列写成页面模块里的纯函数，构建期算，不新增数据字段，避免第二份真相。
- **出处**：[output-format.md](output-format.md) 第 3.2 节。

### 3.4 图表引外部库

- **症状**：产物 `<script src="https://.../chart.js">`，断网即空白。
- **根因**：为了画得快，忽略「单文件自包含」。
- **正确做法**：内联 SVG 或纯 CSS 横条，用令牌上色；构建期 `[自包含]` 会拦任何 `http(s)://` 引用。
- **出处**：[output-format.md](output-format.md) 第 1 节。

## 四、模块化与非 SaaS

### 4.1 模块 A 的页面 import 模块 B

- **症状**：`pages/asn-list.mjs` 里 `import ... from '../../outbound/pages/...'`。
- **根因**：想复用一个函数，忽略模块即部署单元。
- **正确做法**：共用的东西上提到 `prototypes/01 shared/`，`dependsOn` 只写 `shared`；A 单独交付时不许缺件。
- **出处**：[modules.md](modules.md) 第 4 节；构建期 `[模块边界]`、验收 S1。

### 4.2 产物里放跨模块 HTML 链接

- **症状**：模块条上每个模块都是 `<a href="../billing/dist/billing.html">`。
- **根因**：把集成视图的思路套进单模块产物。
- **正确做法**：侧栏按模块分组，当前模块展开并高亮，页头页签只列本端页面；未部署模块不出现。
- **出处**：[output-format.md](output-format.md) 第 2 节；验收 B11。

### 4.3 所有模块合成一份总产物

- **症状**：全系统只有一个 `dist/index.html`，交付任一模块都得带上整包。
- **根因**：把「一套系统」当成「一个交付物」。
- **正确做法**：一个模块一个自包含 HTML，各自 `build.mjs`，各自 `--check` 与交付清单。
- **出处**：[modules.md](modules.md) 第 3 节。

### 4.4 画出 SaaS 界面

- **症状**：顶栏有租户切换器、套餐条、试用到期提示、平台运营后台入口。
- **根因**：照搬 SaaS 后台的观感，忽略产品是可独立部署的软件。
- **正确做法**：单实例单主体，顶栏只放产品名、端名副标题、全局搜索、工具与只读用户块；货主下拉放页头且只在该响应的页面出现；构建期 `[非SaaS]` 拦红线词。
- **出处**：[SKILL.md](../SKILL.md) 第 1 节；[design-spec.md](design-spec.md) 第 8 节。

### 4.5 把货主当租户

- **症状**：界面写「租户 A / 账号空间」，或做「跨主体库存汇总」。
- **根因**：把 3PL 多货主业务维度误读成多租户隔离。
- **正确做法**：货主是同一套部署内的业务数据，用「货主」字段、筛选与 `data-owner` 表达；报表口径写「本部署主体」。
- **出处**：[design-spec.md](design-spec.md) 第 8 节。

### 4.6 改了共享层只重建自己那一个模块

- **症状**：令牌改了，只有本模块产物变新，其它模块 `--check` 全报 drift。
- **根因**：把共享层当成私有文件。
- **正确做法**：改 `prototypes/01 shared/` 后重建所有 `deployed: true` 模块，跑全量验收。
- **出处**：[modules.md](modules.md) 第 4 节。

## 五、流程

### 5.1 手改产物

- **症状**：直接编辑 `dist/inbound.html` 改一个文案。
- **根因**：觉得重建慢。
- **正确做法**：改源再构建。产物不入库，手改会在下次构建时被覆盖且不进版本库。
- **出处**：[output-format.md](output-format.md) 第 5 节。

### 5.2 在别人的改动上重建

- **症状**：自己只改一个页面，产物里却多出自己没写过的变化。
- **根因**：没先跑 `--check` 记基线，多人并行。
- **正确做法**：开工 `--check` 记 `data-build`；与记录不一致先停下确认。
- **出处**：[SKILL.md](../SKILL.md) 第 0 节。

### 5.3 模板占位符没替换

- **症状**：产物里出现 `__MODULE_ID__` / `__PAGE_NAME__`，或构建报 `[页面装配] key 不匹配`。
- **根因**：手工复制了 `templates/` 下的文件但没替换占位符，或直接在 skill 目录里 import 模板。
- **正确做法**：用 `init-module.mjs` 生成，或照 [output-format.md](output-format.md) 第 3.3 节逐项替换；`../../01 shared/ui.mjs` 的相对路径是相对 `prototypes/<id>/pages/` 算的。
- **出处**：[output-format.md](output-format.md) 第 3.3 节。

### 5.4 跑 `--fast` 就交付

- **症状**：验收输出「全部通过」，但产物其实是上一次构建的。
- **根因**：`--fast` 跳过产物漂移检查，A7 未验证。
- **正确做法**：交付前不带 `--fast` 跑全量，再逐条过 [acceptance.md](acceptance.md) B 组。
- **出处**：[acceptance.md](acceptance.md) 第 1、5 节。
