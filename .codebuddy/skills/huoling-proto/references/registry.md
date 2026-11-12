# 装配索引（端、模块、页面归属）

**模块＝源组织单元，端＝交付单元**：源按模块目录存放，产物按端聚合，每个端产物可单独评审、单独打开、单独交付。本文件管「谁属于谁」，不管视觉与文案。

三处真值分工，不要互相复制：

| 事实 | 唯一出处 |
| --- | --- |
| 端有哪些、模块有哪些、页面归哪个端、页面类型 | `prototypes/shared/modules.json` |
| 端名、模块名、页面名、列名、按钮、状态中文 | `references/core/glossary.md` |
| 边界规则、目录结构、依赖方向、交付判据 | 本文件 |

## 1. 注册表是唯一装配权威源

`prototypes/shared/modules.json`（模板 `templates/modules.json`）决定产品由哪些端、哪些模块、哪些页面组成。业务域首栏、导航面板、端构建装配、验收脚本全部读它。

| 字段 | 含义 | 约束 |
| --- | --- | --- |
| `product` / `subject` / `edition` | 产品名与装配元数据 | `edition` 固定「独立部署版」；`subject` 只作首栏用户块与会话面板的只读名称，不上首栏与面板表头；两者都不写 SaaS 字样 |
| `owners` | 货主筛选取值域 | 首项必须是「全部」；这是业务货主，不是租户。端不设货主下拉，货主维度由列表的「货主」筛选条件承担 |
| `apps[].id` | 端 id | 小写字母与连字符，统一带 `-app` 后缀，与模块 ID 不同名 |
| `apps[].name` | 端名 | 逐字取 `references/core/glossary.md` 第 2 节 |
| `apps[].shell` | 外壳类型 | `admin`（后台）/ `mall`（商城前台）/ `pda`（终端壳层） |
| `apps[].nav` | 端导航段（可选） | 配了就按 `nav[].pages` 的 `<模块ID>/<页key>` 分段，段名逐字取 `glossary.md`；不配则按模块分组。本端每个页面须恰好落在一段内 |
| `apps[].rail` | 端业务域（后台三端必填） | 数组项 `{ id, name, mark, navs }`：`name` 是首栏域名，`mark` 是首栏方块里的单字字标，`navs` 引用本端 `nav[].id`。域顺序即首栏顺序，每段恰好归属一个域，全部段须被覆盖；域名与字标逐字取 `glossary.md` |
| `modules[].id` | 模块 ID，同时是源目录名 | 小写字母、数字、连字符；全局唯一 |
| `modules[].name` | 模块名 | 逐字取 `references/core/glossary.md` 第 2 节 |
| `modules[].prefix` | 页面自定义 CSS 类前缀 | 形如 `ib-`，全局唯一 |
| `modules[].tier` | `core` 核心 / `ext` 扩展 | 扩展模块可整块不部署 |
| `modules[].deployed` | 是否进入本次装配 | `false` 的模块页面不进任何端产物 |
| `modules[].owner` | 模块负责人 | 多人协作时必填，写进 `module.json` |
| `modules[].scope` | 交付范围一句话 | 由脚手架写进 `module.json`，两处不各写一份 |
| `modules[].pages[]` | 页面清单 | `key` / `name` / `type` / `file` / `ownerScoped` / `app` |
| `pages[].type` | 页面类型 | `list` / `detail` / `report` / `scan` / `shop`，决定骨架，见第 3 节 |
| `pages[].ownerScoped` | 是否按货主筛选 | 仅 `list` 页可设；页面需自带「货主」筛选条件，行写 `data-owner` |
| `pages[].app` | 页面所属端 | 取 `apps[].id`；不填表示不进任何端产物 |
| `pages[].file` | 页面源路径 | 相对模块目录且以 `pages/` 开头；未分配 `app` 时是预留路径 |

**页面清单只在这里维护**。`module.json` 是源交付清单，不复制页面列表；端构建按 `app` 过滤，不另存一份页面清单。

预留条目不等于源文件：`deployed: false` 的模块，以及 `deployed: true` 但未分配 `app` 的页面，都只是清单里的预留项。构建的文件存在性断言只对**已分配 `app`** 的页面生效，预留项不生成 `pages/` 与 `data/` 文件。

## 2. 端清单

截至 2026-11-12，注册表七端、19 个模块全部 `deployed: true`、242 页已分配端、0 页预留。**端数以 `apps[]` 现场值为准**，本表只是当前快照。

| 端 id | 端名 | 外壳 | 页面量级 | 视觉法 |
| --- | --- | --- | --- | --- |
| `erp-app` | 货灵ERP | `admin` | 95 | `references/shells/admin.md` |
| `network-app` | 货灵运营中台管理端 | `admin` | 54 | `references/shells/admin.md` |
| `warehouse-app` | 货灵WMS | `admin` | 58 | `references/shells/admin.md` |
| `mall-app` | 货灵商城 | `mall` | 6 | `references/shells/mall.md` |
| `pda-app` | 作业 APP | `pda` | 21 | `references/shells/pda.md` |
| `site-app` | 货主独立站 | `site` | 5 | `references/shells/site.md` |
| `site-mobile-app` | 独立站 APP | `mobile` | 5 | `references/shells/mobile.md` |

后台三端同壳同法，差异只在业务域与段、登录身份。货主维度统一走列表筛选，各端都不设货主下拉。货灵商城是前台外壳，没有侧栏与页头页签，顶部六个入口（首页 / 商品搜索 / 商品详情 / 进货单 / 确认订单 / 我的订单）由 `apps[].nav` 驱动。作业 APP 是手机外壳，屏内只有状态条、导航、内容、分组 tab 与按键区，两个分组（作业 / 我的）由 `apps[].nav` 驱动；扫码页不占 tab，从任务详情进入；终端页并入「我的」，组内页面从首页卡、任务卡、任务详情与我的入口进入。**除货灵ERP面板表头「前往商城」一个入口外，都不生成跨端链接**，产物集中在一个目录。该入口用 `target="_blank"` 指向同目录的货灵商城产物并带 `owner` 参数，是全库唯一跨端链接，链接目标按 `apps[]` 里 `shell = "mall"` 的端名拼出，不写死文件名；货灵商城只读该参数作为买家货主预选，不摆货主选择器。单独拷贝单个端 HTML 到空目录时该入口不可用，本端页面仍可完整浏览。三个后台端都在注册表配了 `nav`：货灵WMS十三段，按系统职责（看板 / 客户域 / WMS / WES / WCS / 其他）组织为十三个面板段（看板 / 客户主数据 / 客户单据 / 入库管理 / 出库与发运 / 库内与异常 / 库存管理 / 仓储基础 / 任务执行 / 执行编排 / 设备接入 / 自动化与接口 / 公共资源），客户同步原单与仓内工序单据分属不同段；货灵ERP 二十一段，按信息线索（工作台 / 订单 / 履约 / 售后 / 仓储委托 / 异常与对账 / 库存 / 商品 / 商城店铺 / 独立站 / 站点运营 / 微信小店 / 京东 / 淘宝 / Lazada / Amazon / Temu / TikTok Shop / 速卖通 / 账单与服务 / 报表与设置），其中外部平台侧的店铺、平台适配器、同步、平台订单、平台备货单、平台售后单按平台拆成八个独立段，每个平台段只装本平台的店铺、适配配置、同步与平台侧单据，各 6 页，报表与设置段因报表与账号两类配置放宽到 6 页；货灵运营中台管理端十二段，按运营方业务动线（总览 / 服务关系 / 仓网档案 / 仓网调度 / 库存 / 商品 / 作业资源 / 商城 / ERP 运营 / 账号与权限 / 计费结算 / 服务与设置）。货灵ERP 的「独立站」域下有两段：`nav-site` 独立站（独立站总览、独立站列表、站点配置、域名与证书）与 `nav-site-ops` 站点运营（站点内容、站点商品、站点订单、多端发布、成员与权限），独立站与商城店铺并列、互不复用。三端同时配了 `rail`，把段归并成业务域：货灵ERP 9 域（工作台 / 交易 / 商品 / 国内电商 / 跨境电商 / 分销平台 / 仓储 / 独立站 / 财务与设置）、货灵运营中台管理端 5 域（总览 / 仓网 / 库存与商品 / 商城 / 平台与系统）、货灵WMS 8 域（任务中心 / 入库 / 出库与发货 / 库内作业 / 库存 / 设备与容器 / 人员与班次 / 作业配置）。面板同一时刻只显示当前域，段在面板内全部展开。改页面归属时必须同步该端 `nav`，改段归属时必须同步 `rail`，漏页在面板就没有入口。

### 2.1 端与模块不正交

这是本仓库最容易误判的一处，排页面归属前先认这三条事实：

- **一个端的页面来自多个模块**：作业 APP 的扫码页源在 `inbound` / `outbound` / `warehouse`，作业列表源在 `task`；商城管理七页归 `network-app`。
- **一个模块的页面可以分属两个端**：`task` 的作业看板归 `warehouse-app`，同模块的 `pda-*` 页归 `pda-app`。
- **模块目录 ≠ 端产物**：目录里没有端的概念，端是构建期按 `pages[].app` 聚合出来的。

所以「按端建目录」是错的：端一旦增减，源就要搬家。源永远按模块放，归属只改注册表。

## 3. 页面类型与外壳

类型由 `pages[].type` 声明，决定用哪套骨架，**不允许混搭**。

| 类型 | 组件 | 允许的外壳 | 细则 |
| --- | --- | --- | --- |
| `list` | `ListPage` | `admin`、`pda` | `references/shells/admin.md` 4.1；PDA 内走 `bare` + `card` |
| `detail`（仅抽屉内容） | `DrawerDetail` → `DetailPage` | `admin` | 不注册独立页面；见 `references/shells/admin.md` 第 4 节 |
| `report` | `ReportHero` + `StatRow` + `Block` | `admin`、`pda` | `references/shells/admin.md` 4；PDA 内压缩指标数 |
| `scan` | `ScanPage` | `pda` | `references/shells/pda.md` 4 |
| `shop` | `ShopPage` | `mall` | `references/shells/mall.md` 4 |

判据是「这页属于哪一类」，不是「组件能不能用」。后台三端不得使用 `shop` 与 `scan`；货灵商城不得使用 `list` / `detail` / `report` / `scan`。

## 4. 模块清单

19 个模块按业务分工，页面明细读注册表与 `references/core/glossary.md`：

| ID | 名称 | 前缀 | 层级 | 交付范围 |
| --- | --- | --- | --- | --- |
| `base` | 基础资料 | `base-` | core | 货主、仓库、商品、承运商主档与效期批次策略 |
| `inbound` | 入库管理 | `ib-` | core | 入库通知单、收货单、上架单、收货验收作业 |
| `outbound` | 出库管理 | `ob-` | core | 出库订单、拣货单、复核单、交接单、拣货作业 |
| `warehouse` | 仓储管理 | `wh-` | core | 库位、移库、盘点计划、盘点单、补货 |
| `inventory` | 库存中心 | `iv-` | core | 实物账、流水、批次效期、总览与多端视图 |
| `billing` | 计费结算 | `bl-` | ext | 3PL 仓租与作业费，按交付范围启用 |
| `task` | 任务中心 | `tk-` | ext | 跨模块任务聚合视图与 PDA 作业入口，仅为视图不持有业务源 |
| `system` | 系统设置 | `sy-` | ext | 货灵运营中台管理端运营方与仓内账号、角色、权限、操作日志与字典 |
| `mall` | 商城 | `ml-` | core | 商城首页、搜索、详情、进货单、确认订单、我的订单 |
| `mall-shop` | 商城店铺 | `ms-` | core | 我的店铺、店铺商品、店铺价格、店铺订单、企业资质认证，归货灵ERP独立一级菜单 |
| `mall-admin` | 商城管理 | `ma-` | core | 店铺、商城商品、价格可见性、商城订单、货源楼层与认证审批，归货灵运营中台管理端 |
| `pda` | 终端壳层 | `pd-` | core | 登录、人脸、设备接入与版本更新等终端壳层页，归 作业 APP |
| `network` | 仓网管理 | `nw-` | core | 仓网总览与跨仓调拨 |
| `resource` | 作业资源 | `rs-` | core | 设备、容器、执行单元、班组、人员、排班与作业配置 |
| `workbench` | 货主工作台 | `wb-` | core | 货灵ERP待办单据与状态汇总 |
| `owner` | 货主业务 | `ow-` | core | 货灵ERP订单中心与订单360、原单处理流水线、平台适配器、履约单、平台备货单、自发货单、平台售后单、平台店铺、同步任务、商品查询、委托、调拨退货、差异异常、物流跟踪、报表与子账号，全部归货灵ERP |
| `erp-ops` | ERP 运营 | `eo-` | ext | 货主开通、模块与版本、平台应用、同步健康与全局审计，归货灵运营中台管理端 |
| `site` | 独立站 | `st-` | core | 站点总览、站点列表、配置、域名证书、内容、商品、订单、多端发布、成员权限，归货灵ERP |
| `site-front` | 独立站前台 | `sf-` | core | 品牌站首页、商品、商品详情、品牌故事、门店网点，分属货主独立站与独立站 APP |

分工边界：`base` 管主档、`warehouse` 管库位与库内作业、`inventory` 管账与流水，三者不重叠。`task` 只是聚合视图，不复制其它模块的任务源数据。`mall` 只做商城前台展示与下单演示，商品与库存取自货主主档；成交后的履约在 `outbound` 的出库计划单与工序单里，不在商城模块重复建模。工序单是单仓基于计划单生成的作业批，计划单不被改写。

商城按业务角色分视角，不按角色分端：店主侧自助维护（店铺、上架、定价、本店订单、企业资质认证）单建 `mall-shop` 模块归 `erp-app`，模块名即一级菜单名「商城店铺」；买家侧六页仍归 `mall-app`；`mall-admin` 保留运营方审核与全局视图并新增认证审批页，归 `network-app`。同一货主可以既是店主又是买家，两个角色共用一套账号与货主主档，不另建账号体系；店主角色的有无由该货主是否开通店铺派生，不落成主档字段。一个货主当前只能开一个店铺，店主侧是单店铺视图，不做店铺列表与切换。口径见 `docs/产品需求/商城双身份设计方案.md`。

独立站按站点归属分：`site` 管货主本人名下多个站点的档案、配置、内容、商品、订单、多端发布与成员权限，归 `erp-app`；`site-front` 只做品牌站前台展示，分属 `site-app` 与 `site-mobile-app`。独立站与 `mall-shop` 并列，不复用页面、导航段与单店铺视图；商品、订单与履约复用 `base` 主档、`owner` 订单中心与 `outbound` 履约。采销站交易页在 `site` 内，品牌站可关闭交易、商品仅展示。

## 5. 目录结构

```
prototypes/
├── build-app.mjs       脚手架生成，端构建唯一入口
├── dist/               构建时创建，产物不入库
│   ├── 货灵ERP.html
│   ├── 货灵运营中台管理端.html
│   ├── 货灵WMS.html
│   ├── 货灵商城.html
│   ├── 作业 APP.html
│   ├── 货主独立站.html
│   └── 独立站 APP.html
├── shared/             脚手架生成
│   ├── modules.json    注册表（唯一装配权威源）
│   ├── tokens.css.mjs  实现层取值
│   ├── ui.mjs          实现层组件与五套外壳
│   └── data/           共享演示主档（唯一事实源）
└── <模块ID>/           每个模块跑一次脚手架
    ├── module.json     本模块源交付清单
    ├── pages/<页key>.mjs
    └── data/<页key>.json
```

目录不用手建：`shared/`、`build-app.mjs` 与模块骨架由 `init-module.mjs` 生成，`dist/` 由首次构建创建。模块目录内不出现其它模块的文件名或路径，跨模块共享的东西一律上提到 `shared/`。

### 5.1 `module.json` 字段

| 字段 | 含义 | 约束 |
| --- | --- | --- |
| `id` / `name` | 模块 ID 与模块名 | 必须等于目录名与注册表 `name` |
| `version` | 本次交付版本 | 形如 `0.1.0`，每次交付递增 |
| `owner` | 负责人 | 多人协作必填 |
| `tier` / `deployed` | 层级与部署开关 | 与注册表一致 |
| `dependsOn` | 依赖声明 | **只允许 `["shared"]`** |
| `scope` | 交付范围一句话 | 取注册表 `scope`，不另写 |
| `deliverables` | 源交付清单 | 至少含 `pages/`、`data/`；模块不产出 HTML |
| `status` | `draft` / `review` / `delivered` | 通过验收后才置 `delivered` |
| `note` | 本次交付说明 | 不放实现注解、不放设计理由 |

### 5.2 交付判据

- **可单独装配**：页面源放在本模块目录，改本模块不影响其它模块目录。
- **可单独打开**：双击端产物即可浏览该端全部页面，无外链、无 404、无页面内死链；货灵ERP顶栏「前往商城」是唯一例外，需与货灵商城产物同目录才能跳转，单独拷贝时不影响本端页面浏览。
- **可单独评审**：`module.json` 给出版本、负责人、范围、状态；端产物给出本端全部页面。
- **产物集中**：只有 `prototypes/dist/` 下有 HTML。

### 5.3 预留路径与共享主档

- **预留路径**：注册表 `pages[].file` 对未分配 `app` 的页面只是预留，不落地文件；`deployed: false` 的扩展模块同理。
- **补页面的做法**：先在 `references/core/glossary.md` 登记文案、在注册表分配 `app`，再从 `templates/page-*.mjs` 复制并替换占位符、补 `data/<页key>.json`。禁止删模块目录重跑脚手架。
- **共享主档**：`shared/data/` 下 `owners.json`、`skus.json`、`warehouses.json`、`batches.json`、`applies.json`、`platformShops.json`、`sites.json` 是货主、商品、仓库、批次、申请单、平台店铺与独立站演示数据的唯一事实源。各页 `data/<页key>.json` 可写 `{ "ref": "skus", "keys": [...] }` 引用，构建期补齐；页面模块拿到的仍是完整 `rows`。平台店铺主档的外键为 `shopCode`，独立站主档的外键为 `siteCode`。
- **一致性断言**：构建期校验 `ref` 目标存在、键可解析、主档编码不重复、`owners.scope` 与注册表 `owners` 一致；主档纳入 `--check` 指纹。

## 6. 依赖边界

| 允许的引用 | 禁止的引用 |
| --- | --- |
| `pages/*.mjs` → `../../shared/ui.mjs` | `pages/*.mjs` → `../<其它模块ID>/...` |
| `build-app.mjs` → `shared/modules.json` 与各模块 `pages/`、`data/` | 页面模块里跨模块 import |
| `build-app.mjs` → `shared/data/*.json` | 页面模块直接读其它模块的 `data/` |
| `module.json` → `dependsOn: ["shared"]` | `dependsOn` 写任何模块 ID |

端构建按注册表读取多个模块目录的页面源，这是**装配行为**，不是页面模块之间的引用。改过 `prototypes/shared/` 任一文件 → 所有端产物重建并重新验收。

## 7. 多人协作

| 场景 | 做法 |
| --- | --- |
| 模块归属 | 一个模块一个 owner，写进注册表与 `module.json`；只改自己模块的 `pages/`、`data/`、`module.json` |
| 端归属 | 一个页面一个 `app`，由注册表裁定；改归属等于改注册表，需所有相关模块知悉 |
| 并行开工 | 各自跑 `node prototypes/build-app.mjs --check` 记 `data-build`；指纹变了先确认是不是别的会话在改 |
| 共享层改动 | 先改 `references/` 规范，再改 `shared/`，最后全量重建；禁止「顺手统一一下」 |
| 新增页面 | 先登记注册表、`references/core/glossary.md` 与 `app` 归属，再生成页面文件 |
| 风格争议 | 以 `references/shells/` 对应卷与 `references/core/glossary.md` 裁决，不以个人审美裁决 |

## 8. 新增端 / 模块 / 调整装配范围

1. 在 `references/core/glossary.md` 登记端名、模块名、页面名、列名、按钮、状态文案（**先有文案，再画页面**）。
2. 在注册表追加条目：新增端给唯一 `id`（带 `-app`）、`name`、`shell`（`admin` / `mall` / `pda`）；`shell = "admin"` 的端还必须配 `rail`（业务域），域内 `navs` 引用本端 `nav[].id`，每段恰好归属一个域。新增模块给 `id`、`prefix`、`tier`、`deployed` 与页面清单。新端的外壳若与现有三套都不同，先补 `references/shells/<外壳>.md` 与实现层外壳，再落页面。
3. 跑 `node .codebuddy/skills/huoling-proto/scripts/init-module.mjs <新模块ID>` 生成目录与骨架。
4. 按 `references/core/output-format.md` 第 3 节填页面模块与 `data/*.json`。
5. 构建 → 全量验收 → 逐条过 `references/core/acceptance.md` → 把 `module.json` 的 `status` 置 `delivered`。

调整装配范围只改注册表的 `deployed` 与 `pages[].app`；改 `apps[].nav` 或 `apps[].rail` 只影响该端的导航面板与首栏，但同属共享层改动，随后**所有端产物重建**。
