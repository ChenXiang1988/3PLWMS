# 误用全集

按「症状 → 根因 → 正确做法 → 出处」组织。出处为对应规范卷的节号。本卷是返工类型的全集，比 SKILL.md 的正误对照表更细；新发现的返工类型补进这里，不另开文件。

## 一、骨架与结构

### 1.1 给列表页加统计卡片、大标题、自绘筛选栏

- **症状**：页面顶部一排 6 张数字卡、一个大标题、一条自己写的筛选栏。
- **根因**：把「后台页面应该信息丰富」当成设计依据，没看列表页骨架。
- **正确做法**：计数放 `statusTabs[].count` 或 `scopeNote`；页内标题不写（侧栏已表明当前页）；筛选用 `ListPage` 的 `filters` 传。
- **出处**：`references/shells/admin.md` 第 4、4.1 节。
- **边界**：这条禁的是 `list` 页。`report` 页（用了 `ReportHero` 或 `Block`）本来就摆 KPI。判据是「这页属于哪一类」，不是「组件能不能用」。

### 1.2 页面模块里拼 HTML

- **症状**：`renderPage` 里 `return` 一大段手写 `<div>` 拼接，还可能带 `<script>`。
- **根因**：觉得组件不够灵活，就地改结构。
- **正确做法**：页面模块只写 `columns` / `rows` / `filters` / `toolbar` / `statusTabs`，结构交给 `ui.mjs`；交互由 `data-*` 属性驱动，脚本由构建内联一份。
- **出处**：`references/core/output-format.md` 第 3 节、`references/implementation.md` 第 6 节。

### 1.3 分页条是静态示意

- **症状**：「共 120 条」+ 两个禁用按钮，120 行全铺在屏上。
- **根因**：照抄静态模板，没注意本原型要求真能切页。
- **正确做法**：全量 `<tr>` 带 `data-row-idx` 写进产物，内联脚本只做显隐；`unit` 随页面取。
- **出处**：`references/shells/admin.md` 4.1。

### 1.4 发明菜单名、列名、页签文案

- **症状**：「入库通知单」被写成「到货预约单」，列名自己缩写。
- **根因**：凭语义重新命名，觉得更清楚。
- **正确做法**：逐字取 `references/core/glossary.md`；新增文案先登记再写页面。
- **出处**：`references/core/glossary.md` 第 1、6 节。

### 1.5 报表页用 `ListPage`，或列表页用 `ReportHero`

- **症状**：库存总览带状态页签和分页；入库通知单顶着 KPI 卡。
- **根因**：按「这页看起来信息多不多」挑组件，没按注册表 `type` 挑。
- **正确做法**：`type` 决定骨架，五类不混搭；允许的外壳见 `references/registry.md` 第 3 节。
- **出处**：`references/registry.md` 第 3 节；构建期 `[骨架]`。

## 二、CSS 与 DOM

### 2.1 同名 CSS 类互相覆盖

- **症状**：抽屉本该贴右侧，实际铺满全屏跑到左边。
- **根因**：两个页面模块都定义 `.drawer`，一个 `inset:0` 一个 `right:0`。
- **正确做法**：自定义类名一律「模块前缀 + 页 key」，例 `ib-asn-list-drawer`；共享组件用 `wx-`。
- **出处**：`references/implementation.md` 第 4 节；构建期 `[命名]`。

### 2.2 `[hidden]` 被 `display` 盖掉

- **症状**：顶栏又加回货主下拉；或同一页既有顶栏下拉又有筛选区下拉，两处都叫「货主」。
- **根因**：`.wx-scope{display:flex}` 压过了浏览器默认的 `[hidden]{display:none}`。
- **正确做法**：任何用 `display` 的组件都补 `[hidden]{display:none}`；`.page` 用 `display:none` + `:not([hidden])` 两条显式规则。
- **出处**：`references/shells/admin.md` 第 3 节；`prototypes/shared/tokens.css.mjs` 全局规则。

### 2.3 选择器撞名

- **症状**：分页条被当成页面容器，切页时被写 `hidden` 且永不摘掉。
- **根因**：脚本用 `document.querySelectorAll('[data-page]')`，而分页条的当前页码也叫 `data-page`。
- **正确做法**：页面容器用类名限定 `.page[data-page-id]`；分页条当前页码刻意叫 `data-page-no`。
- **出处**：`references/implementation.md` 第 4、5 节。

### 2.4 抽屉写在 `.page` 内

- **症状**：切到别的页再切回来，抽屉按钮点了没反应。
- **根因**：`.page{display:none}` 把抽屉一起藏了。
- **正确做法**：页面返回 `{ html, overlay }`，构建把 overlay 挂 `<body>` 末尾。
- **出处**：`references/core/output-format.md` 第 1、3 节。

### 2.5 多视图脚本用全局选择器

- **症状**：某页的视图切换把别的页面板也藏了。
- **根因**：脚本用 `document.querySelectorAll('[data-view-panel]')`，全站只有一个这类面板时看不出问题，新页一加就串。
- **正确做法**：以本页 `.page[data-page-id="..."]` 为根再查询。
- **出处**：`references/implementation.md` 第 4 节。

## 三、数据与令牌

### 3.1 页面里写死色值

- **症状**：新页面写 `background:#e8f5e9`。
- **根因**：觉得颜色「差不多就行」，或从别处复制样式连色值一起带过来。
- **正确做法**：只取 `var(--wx-*)`；验收脚本 S3 与构建期 `[取值越界]` 现场从 `tokens.css.mjs` 收集白名单。
- **出处**：`references/implementation.md` 第 2 节。

### 3.2 `StatusTag` 传了未定义色型

- **症状**：状态胶囊落成灰底灰字，或直接让构建失败。
- **根因**：`ui.mjs` 只定义 `disabled` / `enabled` / `info` / `pending` / `rejected` 五种，页面传了 `ok` / `out` / `low`。
- **正确做法**：成功用 `enabled`、危险用 `rejected`、警告用 `pending`；中文名取 `references/core/glossary.md` 第 3 节。
- **出处**：`references/implementation.md` 第 3 节；构建期 `[色型]`。

### 3.3 往数据文件里塞派生字段

- **症状**：为了显示「下层容器数」，往任务 JSON 里加 `childCount`。
- **根因**：把展示逻辑固化进源数据。
- **正确做法**：派生列写成页面模块里的纯函数，构建期算，不新增数据字段。
- **出处**：`references/core/output-format.md` 3.2。

### 3.4 图表引外部库

- **症状**：产物 `<script src="https://.../chart.js">`，断网即空白。
- **根因**：为了画得快，忽略「单文件自包含」。
- **正确做法**：内联 SVG 或纯 CSS 横条，用令牌上色；构建期 `[自包含]` 会拦任何 `http(s)://` 引用。
- **出处**：`references/core/output-format.md` 第 1 节。

### 3.5 在页面里补一个「差不多」的间距

- **症状**：页面 CSS 写 `margin:10px`、`font-size:18px`、`border-radius:10px`。
- **根因**：令牌没有这一档，就地凑一个。
- **正确做法**：只用 4/8/12/16/24/32 与 12/13/14/16/20/24 与 6/8/999 三组档位；确实需要新档，走 `references/implementation.md` 2.2 的流程先补令牌。
- **出处**：`references/implementation.md` 第 2 节。

## 四、模块化与装配

### 4.1 模块 A 的页面 import 模块 B

- **症状**：`pages/asn-list.mjs` 里 `import ... from '../../outbound/pages/...'`。
- **根因**：想复用一个函数，忽略「模块即源组织单元」。
- **正确做法**：共用的东西上提到 `prototypes/shared/`，`dependsOn` 只写 `shared`；模块单独交付时不许缺件。
- **出处**：`references/registry.md` 第 6 节；构建期 `[模块边界]`、验收 S1。

### 4.2 按端建目录

- **症状**：`prototypes/owner-app/pages/`、`prototypes/pda-app/pages/`，同一个模块的页面被拆到两个目录。
- **根因**：把「端」当成目录，忽略端只是构建期按 `pages[].app` 聚合出来的。
- **正确做法**：源永远按模块放；端增减只改注册表的 `apps` 与 `pages[].app`。
- **出处**：`references/registry.md` 2.1。

### 4.3 产物里放跨端 HTML 链接

- **症状**：侧栏条目指向 `../商城端.html`，单独交付后 404。
- **根因**：把集成视图的思路套进单端产物。
- **正确做法**：侧栏只列本端页面，页头页签只列本模块页面；不生成跨端链接。
- **出处**：`references/core/output-format.md` 第 1 节、`references/shells/admin.md` 第 3 节；验收 B11。

### 4.4 画出 SaaS 界面

- **症状**：顶栏有租户切换器、套餐条、试用到期提示、平台运营后台入口。
- **根因**：照搬 SaaS 后台的观感，忽略产品是可独立部署的软件。
- **正确做法**：单实例单主体，顶栏只放产品名、端名副标题、全局搜索、工具与只读用户块；货主下拉放页头且只在该响应的页面出现；构建期 `[非SaaS]` 拦红线词。
- **出处**：`references/core/glossary.md` 第 7 节、`references/shells/admin.md` 第 3 节。

### 4.5 把货主当租户

- **症状**：界面写「租户 A / 账号空间」，或做「跨主体库存汇总」。
- **根因**：把 3PL 多货主业务维度误读成多租户隔离。
- **正确做法**：货主是同一套部署内的业务数据，用「货主」字段、筛选与 `data-owner` 表达；报表口径写「本部署主体」。
- **出处**：`references/core/glossary.md` 第 7 节、`references/shells/admin.md` 第 3 节。

### 4.6 改了共享层只重建自己那一个端

- **症状**：令牌改了，只有一个端产物变新，其它端 `--check` 全报 drift。
- **根因**：把共享层当成私有文件。
- **正确做法**：改 `prototypes/shared/` 后重建全部端产物，跑全量验收。
- **出处**：`references/registry.md` 第 6 节、`references/core/output-format.md` 第 5 节。

## 五、外壳与视觉

### 5.1 商城端套后台外壳

- **症状**：商城顶栏左边多出一列侧栏，或商品页出现页头页签。
- **根因**：照后台习惯搭骨架，忽略 `apps[].shell`。
- **正确做法**：`shell = "mall"` 走 `wx-shop-app`，导航只有页面 + 类目；`shop` 页只归商城端。
- **出处**：`references/shells/mall.md` 第 3 节；构建期 `[商城]`、`[装配清单]`。

### 5.2 后台端塞商品卡片

- **症状**：仓网管理端首页摆一排 `ProductCard`，或把商城运营总览做成商品橱窗。
- **根因**：把「商城管理」当成「商城」。
- **正确做法**：商城管理是后台模块（`mall-admin`，归仓网管理端），用 `list` / `report` 骨架；商品卡片只出现在 `shop` 页。
- **出处**：`references/registry.md` 第 4 节、`references/shells/mall.md` 开篇。

### 5.3 堆装饰性卡片墙

- **症状**：列表页上方一排卡片，每张带图标、大数字、彩色底、趋势箭头。
- **根因**：把「有设计感」等同于「有卡片」。
- **正确做法**：计数进页签或工具条；只有 `report` 页摆指标卡，且指标卡不带装饰图形。
- **出处**：`references/shells/admin.md` 第 5、7 节；验收 B17。

### 5.4 层级只靠字号

- **症状**：页面标题 24、分区标题 20、正文 14，字重与留白全是默认值。
- **根因**：只想到「大字更醒目」，没建立层级手段的组合。
- **正确做法**：页级 / 块级 / 行级三级，每级在字号、字重、留白里至少用两种；同层级间距同档。
- **出处**：`references/shells/admin.md` 第 5 节；验收 B17。

### 5.5 强调色超预算

- **症状**：一屏里主按钮蓝、信息胶囊靛、状态标签绿黄红、类目高亮橙，颜色比内容还多。
- **根因**：每种语义各配一个强调色，缺少预算概念。
- **正确做法**：一屏一处主色强调；状态色只出现在状态位；商城端只用 `--wx-mall-*`，后台只用 `--wx-primary-*`。
- **出处**：`references/shells/admin.md` 第 6 节、`references/shells/mall.md` 第 6 节；验收 B18。

### 5.6 键盘焦点丢失

- **症状**：Tab 走一遍，焦点框不出现，或只在部分控件上出现。
- **根因**：写 `outline:none` 图干净，又没有 `:focus-visible` 替代。
- **正确做法**：所有可聚焦元素给可见焦点环；输入框可把焦点态画在容器上（`:focus-within`）。当前实现层尚无焦点令牌，属已登记缺口。
- **出处**：`references/implementation.md` 2.1、`references/core/acceptance.md` 第 4 节；验收 B19。

### 5.7 PDA 屏里铺步骤表

- **症状**：扫码页把「扫描 → 校验 → 上架」画成横向步骤条，一屏露三个输入。
- **根因**：把系统的校验序列当成人的操作步骤。
- **正确做法**：只露当前一个输入，对象摘要与数量进度上下排布，底部两键常驻。
- **出处**：`references/shells/pda.md` 第 4 节；验收 B8。

### 5.8 商城卡片堆标记

- **症状**：一张商品卡同时挂包邮、现货、新品、爆款四个角标。
- **根因**：把运营话术全往卡片上塞。
- **正确做法**：每卡最多一个状态标记，其余信息进商品标题或详情；强调色只给价格与主按钮。
- **出处**：`references/shells/mall.md` 第 5、7 节。

## 六、流程

### 6.1 手改产物

- **症状**：直接编辑 `dist/货主端.html` 改一个文案。
- **根因**：觉得重建慢。
- **正确做法**：改源再构建。产物不入库，手改会在下次构建时被覆盖。
- **出处**：`references/core/output-format.md` 第 5 节。

### 6.2 在别人的改动上重建

- **症状**：自己只改一个页面，产物里却多出自己没写过的变化。
- **根因**：没先跑 `--check` 记基线，多人并行。
- **正确做法**：开工 `--check` 记 `data-build`；与记录不一致先停下确认。
- **出处**：`references/registry.md` 第 7 节。

### 6.3 模板占位符没替换

- **症状**：产物里出现 `__MODULE_ID__` / `__PAGE_NAME__`，或构建报页面 key 不匹配。
- **根因**：手工复制了 `templates/` 下的文件但没替换占位符，或直接在 skill 目录里 import 模板。
- **正确做法**：用 `init-module.mjs` 生成，或照 `references/core/output-format.md` 3.3 逐项替换；`../../shared/ui.mjs` 的相对路径是相对 `prototypes/<id>/pages/` 算的。
- **出处**：`references/core/output-format.md` 3.3。

### 6.4 跑 `--fast` 就交付

- **症状**：验收输出「全部通过」，但产物其实是上一次构建的。
- **根因**：`--fast` 跳过产物漂移检查，A7 未验证。
- **正确做法**：交付前不带 `--fast` 跑全量，再逐条过 `references/core/acceptance.md` B 组。
- **出处**：`references/core/acceptance.md` 第 1、5 节。
