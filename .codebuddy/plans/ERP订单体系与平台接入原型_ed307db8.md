---
name: ERP订单体系与平台接入原型
overview: 为货灵ERP补齐多平台多店铺订单体系与平台接入原型：平台店铺授权、同步任务、订单中心、一对多履约单、平台备货单、自发货单、平台售后单，并完成文案、字典、注册表与五端构建验收。
design:
  architecture:
    framework: html
  styleKeywords:
    - 工具型后台
    - 密度优先
    - 弱装饰
    - 状态色型
    - 单一强调色
  fontSystem:
    fontFamily: system-ui
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 14px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#2563EB"
      - "#1D4ED8"
      - "#EFF6FF"
    background:
      - "#F8FAFC"
      - "#FFFFFF"
    text:
      - "#0F172A"
      - "#64748B"
    functional:
      - "#16A34A"
      - "#D97706"
      - "#E5484D"
      - "#4F46E5"
todos:
  - id: docs-copy
    content: 补问答记录、订单体系方案、六份新字典与五份改字段，登记 glossary、registry、索引与日志，跑两套 check。
    status: completed
  - id: platform-access
    content: Use [skill:3pl-wms-proto] 落平台店铺、同步任务与 platform-shops 主档，改 build-app 与平台接入导航。
    status: completed
    dependencies:
      - docs-copy
  - id: order-fulfillment
    content: Use [skill:3pl-wms-proto] 落订单中心、履约单，改造平台订单页，演示一单多履约与部分发货。
    status: completed
    dependencies:
      - platform-access
  - id: dispatch-execution
    content: Use [skill:3pl-wms-proto] 落平台备货单、自发货单，改出库计划单、物流跟踪、工作台与单仓详情。
    status: completed
    dependencies:
      - order-fulfillment
  - id: aftersale
    content: Use [skill:3pl-wms-proto] 落平台售后单，接通售后入库计划单回指与工作台售后待办。
    status: completed
    dependencies:
      - dispatch-execution
  - id: build-verify
    content: 五端重建与全量验收，过 A/B 清单，递增 module.json，回填文档日志。
    status: completed
    dependencies:
      - aftersale
---

## User Requirements

- 货灵ERP 要支持货主自己发货，并因此建立自己的订单体系。
- 订单主入口是从平台店铺拉回，需支持多平台、多店铺同步。
- 平台与订单类型不同，Amazon FBA/FBM、速卖通全托管/半托管/自营、Temu 全托管/半托管等差异要走配置，不按平台建实体。
- 需要补齐店铺授权、订单拉单、售后同步三条接入链路。
- 交付物是自包含 HTML 原型，不是生产系统。只做页面、状态、演示数据与页内交互，不实现真实 OAuth、API、队列、限流、资金对账。

## Product Overview

在现有货灵ERP后台外壳内新增「平台接入」「订单中心」「履约单」「平台备货单」「自发货单」「平台售后单」等页面，形成从平台店铺授权、拉单、订单履约到售后的完整演示链路。视觉保持现有 admin 外壳：密度优先、弱装饰、状态色型、单一强调色。

## Core Features

- 平台店铺授权状态、凭证到期、同步任务、失败原因与重试。
- 订单中心聚合多平台多店铺订单，展示订单类型、履约方式、履约状态。
- 一单多履约：同一订单可拆多次发货，支持部分发货、补发、多包裹。
- 三类履约：3PL 仓发货、自发货、平台备货。平台备货含箱唛、装箱单、入仓预约、发到平台仓。
- 平台售后单同步与处理：同意、拒绝、确认收货、退款；仓发货生成售后入库计划单，自发货 ERP 内闭环。
- 工作台待办覆盖授权到期、拉单失败、待下发、待发货、待预约、待处理售后。

## Tech Stack

- 原型形态：Node 原生 ESM 构建为五份自包含 HTML，无后端、无数据库、无真实平台 API。
- 渲染层：`prototypes/shared/ui.mjs` 的 `ListPage`、`FormDrawer`、`DrawerDetail`、`StatusTag`、`ReportHero`、`StatRow`、`Block`。
- 样式：`prototypes/shared/tokens.css.mjs` 是唯一取值来源，页面只写 `var(--wx-*)`，不写 hex。
- 数据：页面 `data/*.json` 加共享主档 `shared/data/platform-shops.json`，构建期用 `ref` 还原。
- 交互：`data-*` 属性加 `live` 加 `sessionStorage`，页面模块不写 `script`，不新增骨架类型。

## Implementation Approach

- 先文档后原型：问答记录 → 方案文档 → 数据字典 → glossary 与 registry → 页面 → 构建验收。
- 订单中心与履约单按视图实现，不新建订单表或履约表。三类执行单仍是出库计划单、自发货单、平台备货单。
- 一对多只在履约单页表达。订单详情抽屉不塞第二张表，避免改 `DrawerDetail`。
- `live` 只能改已有行状态，不能新增行。演示数据预置每种动作的起始行，动作只驱动状态流转。
- 平台差异用数据字段与能力配置表达，不在页面里写 Amazon、速卖通、Temu 分支。
- 性能：静态 HTML，客户端筛选与分页；每页 20 行；共享主档一次 hydrate，无额外请求。

## Architecture Design

- 渠道单层：平台订单、商城店铺订单、代发采购单。
- 履约视图层：订单中心、履约单，按来源单号聚合。
- 执行单据层：出库计划单对应仓发货，自发货单对应自发货，平台备货单对应平台仓备货。
- 接入层：平台店铺、店铺授权、同步任务、平台售后单。
- 状态聚合：订单中心按履约单聚合为未下发、待发货、部分发货、已发货、已签收、售后中。
- 方案文档含两张流程图：订单履约主链、售后逆向链，覆盖授权过期、拉单失败、部分发货、取消、退货入库、回传失败。

## Directory Structure

```
docs/
├── 问答记录/需求问答.md                    # [MODIFY] 补第 9 轮及以后，记录订单体系、平台类型、授权、拉单、售后、网关、调度、适配器、备货、1:N、售后处理结论；写明推翻 Q1-1 的 1:1
├── 产品需求/ERP订单体系与平台接入方案.md    # [NEW] 分层、三类履约、订单类型与能力矩阵、授权/拉单/售后链路、状态映射、取消与逆向、页面映射
├── 产品需求/商城订单状态流转.md             # [MODIFY] 商城订单 obNo 改一对多后的状态映射与部分发货
├── 数据字典/平台店铺.md                     # [NEW] 外部平台店铺主档，与商城店铺分开
├── 数据字典/店铺授权.md                     # [NEW] 授权状态、范围、凭证到期、最近同步
├── 数据字典/同步任务.md                     # [NEW] 任务号、店铺、类型、触发、时间窗、成功失败数
├── 数据字典/平台备货单.md                   # [NEW] 箱唛、装箱单、预约号、平台仓、状态
├── 数据字典/自发货单.md                     # [NEW] 来源订单、收货方、承运商、运单、包裹
├── 数据字典/平台售后单.md                   # [NEW] 售后类型、金额、退货物流、时限、处理结果
├── 数据字典/平台订单.md                     # [MODIFY] 加订单类型、平台状态、履约状态、1:N 履约关联、店铺授权外键
├── 数据字典/物流运单.md                     # [MODIFY] planNo 可空，加来源单据类型与单号
├── 数据字典/出库计划单.md                   # [MODIFY] 加收货信息、平台备货出库类型
├── 数据字典/出库订单.md                     # [MODIFY] 加收货信息、预约号与箱唛展示
├── 数据字典/入库计划单.md                   # [MODIFY] 加平台售后单来源回指
├── 数据字典/商城订单.md                     # [MODIFY] obNo 改一对多，补部分发货状态
├── index.md、log.md                         # [MODIFY] 登记与留痕
└── 数据字典/index.md、数据字典/log.md       # [MODIFY] 登记与留痕

.codebuddy/skills/3pl-wms-proto/references/
├── core/glossary.md                        # [MODIFY] 页面名、列名、按钮、授权/同步/订单类型/履约/备货/售后状态
└── registry.md                             # [MODIFY] 7 个页面归属、ERP 页数与导航段

prototypes/
├── shared/modules.json                     # [MODIFY] 7 个 page 条目、erp-app nav 新增售后与平台接入
├── shared/data/platform-shops.json         # [NEW] 平台店铺共享主档
├── build-app.mjs                           # [MODIFY] MASTER_FILES 与 FK_OF 增加 platformShops
├── owner/pages/platform-shop-list.mjs      # [NEW] 平台店铺列表
├── owner/pages/sync-task-list.mjs          # [NEW] 同步任务列表
├── owner/pages/order-center.mjs            # [NEW] 订单中心
├── owner/pages/fulfillment-list.mjs        # [NEW] 履约单
├── owner/pages/platform-replenish-list.mjs # [NEW] 平台备货单
├── owner/pages/selfship-list.mjs           # [NEW] 自发货单
├── owner/pages/platform-aftersale-list.mjs # [NEW] 平台售后单
├── owner/data/                             # [NEW] 对应 7 份演示数据
├── owner/pages/platform-order-list.mjs     # [MODIFY] 加订单类型、履约方式、履约状态、履约单号与三种下发动作
├── owner/pages/tracking-list.mjs           # [MODIFY] 加来源单据类型与单号
├── outbound/pages/out-plan-owner-list.mjs  # [MODIFY] 加平台备货出库类型与收货方详情
├── outbound/pages/out-plan-list.mjs        # [MODIFY] 单仓详情补收货方、预约号、箱唛
├── workbench/pages/workbench.mjs           # [MODIFY] 加授权、拉单、待下发、待发货、待预约、待售后待办
└── owner/module.json、outbound/module.json、workbench/module.json  # [MODIFY] 递增版本与交付字段
```

## State Enums

- 授权状态：待授权、已授权、即将过期、已过期、已撤销、授权失败。
- 同步状态：待执行、执行中、成功、部分失败、失败。
- 履约状态：未下发、待发货、部分发货、已发货、已签收、售后中。
- 履约单状态：待发货、已发货、已签收、已取消、异常。
- 备货单状态：待备货、待预约、已预约、已发货、平台收货、已完成、已取消。
- 自发货状态：待发货、已发货、已签收、已取消。
- 售后状态：待处理、待买家退货、待收货、退款中、已完成、已关闭、平台介入。

## Implementation Notes

- 跨端评估已做：货灵ERP 新增 7 页改 5 页，单仓端只改出库订单详情；仓网端、商城端、PDA 端不改页面。共享层与 `modules.json` 改动后五端全建。
- `glossary.md` 与数据字典是硬门槛，未登记文案或缺字段会被构建与验收拦下。
- 不要复用 `docs/数据字典/店铺.md`。那是货源商城店铺，外部平台店铺必须新建「平台店铺」。
- 货灵ERP 不摆货主下拉与货主筛选。新页行数据带 `owner` 与 `data-owner`，沿用两套演示身份。
- 页面不写 hex、不写 `script`、不新增骨架；列表页不摆 KPI 卡，一屏只留一个主按钮。
- `platform-shops` 是共享主档，改 `build-app.mjs` 会触发五端全建，每批结束都跑构建与验收。
- 构建：`node prototypes/build-app.mjs`；漂移检查：`node prototypes/build-app.mjs --check`；全量验收：`node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs`。
- 文档自检：`node docs/check.mjs` 与 `node docs/数据字典/check.mjs` 零错误。
- 验收重点：A2 文案一致、A10 页签真筛、A11 货主隔离、A17 状态动作真改数据；B1、B5、B6、B23。

## Design Style

沿用现有 admin 后台外壳，不另起视觉语言。新增「售后」「平台接入」两个导航段，页面仍为工具型列表：状态页签、筛选条、工具条、表格、分页。平台店铺、同步任务、订单中心、履约单、平台备货单、自发货单、平台售后单全部用 `list` 骨架，不摆 KPI 卡、不做页内大标题。详情与表单用抽屉，状态用 `StatusTag` 五色型，一屏只留一个主按钮。交互只用 hover、focus、抽屉、toast，不加渐变、插画、装饰图标。1440、1024、768 三档检查横向溢出，表格容器横向滚动。

## Agent Extensions

### Skill

- **3pl-wms-proto**
- Purpose: 按五层规范落页面、做跨端联动核对、构建五端产物并执行交付验收。
- Expected outcome: 新增与改造页面符合 admin 外壳、文案真值、`data-*` 契约与验收 A/B 两组，五端重建后无违规。