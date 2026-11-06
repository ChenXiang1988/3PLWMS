# 模块清单与端装配规范

本文件是 [SKILL.md](../SKILL.md) 第 1 节与第 0、2 步的展开。**模块＝源组织单元，端＝交付单元**：源按模块目录存放，产物按端聚合，每个端产物可单独评审、单独打开、单独交付。

## 1. 注册表是唯一装配权威源

`prototypes/01 shared/modules.json`（模板 [../templates/modules.json](../templates/modules.json)）决定产品由哪些端、哪些模块、哪些页面组成。侧栏、模块条、端构建装配、验收脚本全部读它。

| 字段 | 含义 | 约束 |
| --- | --- | --- |
| `product` / `subject` / `edition` | 产品名与装配元数据 | `edition` 固定为「独立部署版」；`subject` 只作内部端顶栏用户块的只读名称，两者都不写 SaaS 字样 |
| `owners` | 货主下拉选项 | 首项必须是「全部」；这是业务货主，不是租户 |
| `apps[]` | 端清单 | 每项给 `id` / `name` / `shell`；`id` 小写字母与连字符，`name` 逐字取 [glossary.md](glossary.md) 第 2 节，`shell` 取 `admin`（后台外壳）或 `mall`（商城前台外壳） |
| `modules[].id` | 模块 ID，同时是源目录名 | 小写字母、数字、连字符；全局唯一 |
| `modules[].name` | 模块名 | 逐字取 [glossary.md](glossary.md) 第 2 节 |
| `modules[].prefix` | 页面自定义 CSS 类前缀 | 形如 `ib-`，全局唯一 |
| `modules[].tier` | `core` 核心 / `ext` 扩展 | 扩展模块可整块不部署 |
| `modules[].deployed` | 是否进入本次装配 | `false` 的模块页面不进任何端产物 |
| `modules[].owner` | 模块负责人 | 多人协作时必填，写进 `module.json` |
| `modules[].scope` | 交付范围一句话 | 由脚手架写进 `module.json` 的 `scope`，两处不各写一份 |
| `modules[].pages[]` | 页面清单 | `key` / `name` / `type` / `file` / `ownerScoped` / `app` |
| `pages[].type` | `list` / `detail` / `report` / `scan` | 决定用哪套骨架，见 [design-spec.md](design-spec.md) 第 4 节 |
| `pages[].ownerScoped` | 是否响应顶栏货主下拉 | 仅 `list` 页可设；行需写 `data-owner` |
| `pages[].app` | 页面所属端 | 取 `apps[].id`；不填表示不进任何端产物 |

**页面清单只在这里维护**。各模块的 `module.json` 是源交付清单，不复制页面列表；端构建按 `app` 过滤，不另存一份页面清单。

## 2. 模块清单

核心 6 个模块默认 `deployed: true`，覆盖 3PL 云仓主干业务与商城前台；扩展 3 个默认 `false`，可按客户交付范围整块启用。

| ID | 名称 | 前缀 | 层级 | 页面（key · 名称 · 类型） | 交付范围 |
| --- | --- | --- | --- | --- | --- |
| `base` | 基础资料 | `base-` | core | `owner-list` 货主档案 list<br>`warehouse-list` 仓库档案 list<br>`sku-list` 商品档案 list<br>`carrier-list` 承运商档案 list<br>`sku-apply-list` 商品资料变更申请 list<br>`sku-audit-list` 商品主档审核 list<br>`sku-policy-detail` 效期批次策略 detail<br>`sku-warehouse-list` 本仓商品查询 list | 货主、仓库、商品、承运商主档与效期批次策略 |
| `inbound` | 入库管理 | `ib-` | core | `asn-list` 入库通知单 list<br>`asn-detail` 入库通知单详情 detail<br>`receiving-scan` 收货验收 scan<br>`putaway-task` 上架任务 list | 通知、收货验收、上架 |
| `outbound` | 出库管理 | `ob-` | core | `so-list` 出库订单 list<br>`wave-list` 波次计划 list<br>`picking-scan` 拣货作业 scan<br>`handover-list` 发货交接 list | 订单、波次、拣货、交接 |
| `warehouse` | 仓储管理 | `wh-` | core | `location-list` 库区库位 list<br>`move-task` 移库任务 list<br>`count-task` 盘点任务 list<br>`count-scan` 盘点作业 scan | 库位、移库、盘点 |
| `inventory` | 库存中心 | `iv-` | core | `stock-list` 库存查询 list<br>`ledger-list` 库存台账 list<br>`stock-report` 库存总览 report<br>`batch-list` 批次效期 list<br>`batch-owner-list` 批次效期查询 list<br>`batch-network-report` 批次效期总览 report | 实物账、流水、批次效期、总览与三端批次效期视图 |
| `billing` | 计费结算 | `bl-` | ext | `rate-list` 费用规则 list<br>`bill-list` 费用账单 list | 3PL 仓租与作业费，按交付范围启用 |
| `task` | 任务中心 | `tk-` | ext | `task-list` 作业任务 list<br>`task-report` 作业看板 report | 跨模块任务聚合视图，仅为视图不持有业务源 |
| `system` | 系统设置 | `sy-` | ext | `user-list` 账号管理 list<br>`role-list` 角色权限 list | 本部署实例内的账号与权限 |
| `mall` | 商城 | `ml-` | core | `home` 商城首页 shop<br>`search` 商品搜索 shop<br>`product-detail` 商品详情 shop<br>`cart` 进货单 shop<br>`checkout` 确认订单 shop<br>`orders` 我的订单 shop | 商城首页、商品搜索、商品详情、进货单、确认订单、我的订单 |
| `network` | 仓网管理 | `nw-` | core | `network-overview` 仓网总览 report<br>`transfer-order` 跨仓调拨 list | 仓网总览与跨仓调拨 |
| `resource` | 作业资源 | `rs-` | core | `hardware-archive` 设备档案 list<br>`hardware-transfer` 设备调拨 list<br>`container-archive` 容器档案 list | 设备、容器、执行单元、班组、人员、排班与作业配置 |

分工边界：`base` 管主档、`warehouse` 管库位与库内作业、`inventory` 管账与流水，三者不重叠。`task` 只是聚合视图，不复制其它模块的任务源数据。`mall` 只做商城前台展示与下单演示，商品与库存取自货主主档，不另建一份商品真相；成交后的履约在 `outbound` 的出库订单里，不在商城模块重复建模。

### 端与产物

`apps` 定义四个端，`pages[].app` 决定页面归哪个端。**一个端一个产物** `prototypes/00 dist/<端名>.html`：后台三端顶栏以端名作品牌副标题，侧栏按模块分组列本端页面，页头页签按模块成组；商城端用前台外壳，顶栏是商城导航、搜索与进货单入口，没有侧栏和页头页签。都不生成跨端链接，产物集中在一个目录。

| 端 id | 端名 | 外壳 | 本次归属页面 |
| --- | --- | --- | --- |
| `owner` | 货主端 | `admin` | `base/sku-apply-list`、`inventory/batch-owner-list` |
| `network` | 仓网管理端 | `admin` | `base/owner-list`、`base/warehouse-list`、`base/sku-list`、`base/sku-audit-list`、`base/sku-policy-detail`、`inventory/batch-network-report`、`network/network-overview`、`network/transfer-order`、`resource/hardware-archive`、`resource/hardware-transfer`、`resource/container-archive` |
| `warehouse` | 单仓端 | `admin` | `base/sku-warehouse-list`、`inventory/batch-list` |
| `mall` | 商城端 | `mall` | `mall/home`、`mall/search`、`mall/product-detail`、`mall/cart`、`mall/checkout`、`mall/orders` |

源仍按模块目录存放（`prototypes/<模块ID>/pages/` 与 `data/`），端构建 `prototypes/build-app.mjs` 按注册表聚合页面。页面模块本身只读 `../../01 shared/ui.mjs`，不跨模块 import。未分配 `app` 的页面不进端产物，源保留供后续启用。

## 3. 目录结构

```
prototypes/
├── build-app.mjs       脚手架生成，端构建唯一入口
├── 00 dist/            构建时创建，产物不入库
│   ├── 货主端.html
│   ├── 仓网管理端.html
│   ├── 单仓端.html
│   └── 商城端.html
├── 01 shared/          脚手架生成
│   ├── modules.json    注册表（唯一装配权威源）
│   ├── tokens.css.mjs  实现层取值
│   └── ui.mjs          实现层组件与基础样式
└── <模块ID>/           每个模块跑一次脚手架
    ├── module.json     本模块源交付清单
    ├── pages/<页key>.mjs   页面模块
    └── data/<页key>.json   本模块演示数据
```

目录不用手建：`01 shared/`、`build-app.mjs` 和各模块骨架由 `init-module.mjs` 生成，`00 dist/` 由 `build-app.mjs` 首次构建时创建。生成顺序见 SKILL.md「目录怎么生成」。模块目录内不出现其它模块的文件名或路径，跨模块共享的东西一律上提到 `01 shared/`。

### 3.2 `module.json` 字段

模板 [../templates/module.json](../templates/module.json)。

| 字段 | 含义 | 约束 |
| --- | --- | --- |
| `id` | 模块 ID | 必须等于目录名，且存在于注册表 |
| `name` | 模块名 | 必须逐字等于注册表里的 `name` |
| `version` | 本次交付版本 | 形如 `0.1.0`，每次交付递增 |
| `owner` | 负责人 | 多人协作必填 |
| `tier` | `core` / `ext` | 与注册表一致 |
| `deployed` | 是否进入本次装配 | 与注册表一致 |
| `dependsOn` | 依赖声明 | **只允许 `["shared"]`**；这是逻辑依赖标识，不随共享层目录名 `01 shared` 变化 |
| `scope` | 交付范围一句话 | 取本文件第 2 节的交付范围表述 |
| `deliverables` | 源交付清单 | 至少含 `pages/`、`data/`；模块不再单独产出 HTML |
| `status` | `draft` / `review` / `delivered` | 通过验收后才置 `delivered` |
| `note` | 本次交付说明 | 不放实现注解、不放设计理由 |

### 3.3 交付判据

- **可单独装配**：页面源放在本模块目录，改本模块不影响其它模块目录。
- **可单独打开**：双击端产物即可浏览该端全部页面，无外链、无 404、无死链。
- **可单独评审**：`module.json` 给出版本、负责人、范围、状态；端产物给出本端全部页面。
- **产物集中**：只有 `prototypes/00 dist/` 下有 HTML，模块目录下不产出 HTML。

## 4. 依赖边界与可插拔

| 允许的引用 | 禁止的引用 |
| --- | --- |
| `pages/*.mjs` → `../../01 shared/ui.mjs` | `pages/*.mjs` → `../<其它模块ID>/...` |
| `build-app.mjs` → `01 shared/modules.json` 与各模块 `pages/`、`data/` | 页面模块里跨模块 import |
| `module.json` → `dependsOn: ["shared"]` | `dependsOn` 写任何模块 ID |

- 端构建按注册表读取多个模块目录的页面源，这是**装配行为**，不是页面模块之间的引用；页面模块自身仍只认 `01 shared/`。
- 侧栏按模块分组渲染，页头页签只列本端页面，**不生成跨模块或跨端链接**。理由：端产物单独交付时目标文件不在包里，链接必然是死链。
- `deployed: false` 的模块不进入任何端产物。
- 改过 `prototypes/01 shared/` 任一文件 → 所有端产物重建并重新验收。

## 5. 多人协作分工

| 场景 | 做法 |
| --- | --- |
| 模块归属 | 一个模块一个 owner，写进注册表 `owner` 与 `module.json`；只改自己模块的 `pages/`、`data/`、`module.json` |
| 端归属 | 一个页面一个 `app`，由注册表裁定；改归属等于改注册表，需所有相关模块知悉 |
| 并行开工 | 各自跑 `node prototypes/build-app.mjs --check` 记 `data-build`；指纹变了先确认是不是别的会话在改 |
| 共享层改动 | 需所有人知悉：先改 `references/` 规范，再改 `01 shared/`，最后全量重建；禁止「顺手统一一下」 |
| 新增页面 | 先登记注册表、`glossary.md` 与 `app` 归属，再用 `init-module.mjs` 或复制模板生成页面文件 |
| 风格争议 | 以 [design-spec.md](design-spec.md) 与 [glossary.md](glossary.md) 裁决 |

## 6. 新增端 / 模块 / 调整装配范围

1. 在 [glossary.md](glossary.md) 登记端名、模块名、页面名、列名、按钮、状态文案（**先有文案，再画页面**）。
2. 在 `prototypes/01 shared/modules.json` 追加条目，给出唯一 `id`、`app`、`prefix`、`tier`、`deployed` 与页面清单。新增端还要写 `apps[].shell`：`admin` 走后台外壳，`mall` 走商城前台外壳；`shop` 页只能归属 `shell = "mall"` 的端。
3. 跑 `node .codebuddy/skills/3pl-wms-proto/scripts/init-module.mjs <新模块ID>` 生成目录与页面骨架。
4. 按 [output-format.md](output-format.md) 第 3 节填页面模块与 `data/*.json`。
5. 跑 `node prototypes/build-app.mjs`，再跑全量验收与第 6 步交付自查，最后把 `module.json` 的 `status` 置 `delivered`。

调整装配范围只改注册表的 `deployed` 与 `pages[].app`，随后**所有端产物重建**。
