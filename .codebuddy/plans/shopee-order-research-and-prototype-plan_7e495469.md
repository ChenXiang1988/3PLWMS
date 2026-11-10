---
name: shopee-order-research-and-prototype-plan
overview: 完成 Shopee 订单、履约、物流与售后接口的字段级调研，并将结果落成货灵 ERP 的原型交互设计方案；先输出跨端联动与页面改造计划，确认后再修改原型。
design:
  architecture:
    framework: html
  styleKeywords:
    - 企业级 ERP
    - 高密度数据表格
    - 双栏导航
    - 右侧抽屉
    - 状态标签
    - 履约关系卡片
    - 事件时间线
    - 异常优先
    - 可追溯交互
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 16px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#1677FF"
      - "#0958D9"
      - "#E6F4FF"
    background:
      - "#F5F7FA"
      - "#FFFFFF"
      - "#F0F2F5"
    text:
      - "#1F2937"
      - "#4B5563"
      - "#9CA3AF"
    functional:
      - "#16A34A"
      - "#D97706"
      - "#DC2626"
      - "#7C3AED"
todos:
  - id: survey-official-api
    content: 使用 [skill:research-report] 固化 Shopee 官方订单、物流、取消与售后接口证据
    status: completed
  - id: verify-api-details
    content: 使用 [skill:agent-browser] 补采官方文档详情，区分已验证、未验证与待定字段
    status: completed
    dependencies:
      - survey-official-api
  - id: design-prototype-interactions
    content: 编写订单、履约、物流、售后和异常页面的原型交互设计方案
    status: completed
    dependencies:
      - verify-api-details
  - id: assess-cross-end-impact
    content: 使用 [subagent:code-explorer] 核对页面、共享层、WMS、PDA 与运营中台联动落点
    status: completed
    dependencies:
      - design-prototype-interactions
  - id: deliver-research-report
    content: 更新调研索引与日志，运行报告和文档校验，等待原型修改确认
    status: completed
    dependencies:
      - assess-cross-end-impact
---

## User Requirements

先完成 Shopee Open Platform 的订单接口调研，并同步覆盖订单履约、物流、取消、售后与退货逆向能力。调研不能停留在接口名称，必须整理请求与响应字段、状态、分页、时间窗、权限、错误与异常边界，并标注官方已验证、未验证和待定内容。

报告必须继续落到货灵 ERP 原型交互设计，覆盖页面入口、列表字段、筛选、批量操作、详情抽屉、履约分支、包裹物流、状态动作、异常处理、取消流程、售后逆向和跨端影响。

本阶段先输出调研报告与原型交互设计方案，不直接修改 `prototypes/`。原型修改前必须完成跨端联动评估并等待确认。

## Product Overview

形成一套从 Shopee 原始订单进入货灵 ERP，到标准业务订单、履约单、执行单、发货回传和售后逆向的完整设计方案。视觉上沿用现有 ERP 双栏导航，以数据列表、右侧详情抽屉、状态标签、履约关系卡片和时间线呈现复杂订单链路。

## Core Features

- Shopee 订单拉取、详情、拆单、包裹与状态同步
- 仓发货、自发货、外部委托履约分支
- 承运商、运单、面单、发货凭证与平台回传
- 卖家取消、买家取消、退货、争议和逆向物流
- 平台原始订单、标准业务订单、履约单和执行单关联
- 同步失败、重复单、SKU 未匹配、部分失败和人工补偿
- 原型页面字段、交互动作、状态矩阵和跨端落点

## Tech Stack Selection

- 调研报告：沿用项目现有自包含 HTML 报告规范，内联 CSS 和内联图形，不引入 CDN、Mermaid 或构建依赖。
- 文档与校验：沿用 Node 原生脚本、`research-report` 校验脚本和 `docs/check.mjs`。
- 原型设计依据：沿用现有 `prototypes/` 的 Node 原生 ESM、JSON 数据和共享 UI 层，不引入新的前端框架或组件库。
- 官方资料：优先使用 Shopee Open Platform OpenAPI 2.0 官方文档目录与详情；无法读取正文的字段标为未验证或待定。

## Implementation Approach

先固化 Shopee 官方接口目录和证据边界，再按“平台原始订单 → 标准业务订单 → 履约单 → 执行单”建立货灵业务映射。报告中分别记录订单、物流、取消、售后四条能力链，并把每条接口能力落到具体页面、字段和动作。

原型交互方案不新增平台专属页面，而是复用货灵 ERP 现有订单、履约、售后、同步任务和异常页面，通过 `platformCode`、订单类型、履约方式和能力矩阵承载 Shopee 差异。

## Implementation Notes

- Shopee 官方目录已确认订单模块 `module_id=94`、物流模块 `module_id=95`、售后模块 `module_id=103`。
- 订单接口重点覆盖 `get_order_list`、`get_order_detail`、`get_shipment_list`、包裹、拆单和取消接口。
- 物流接口重点覆盖发货参数、发货、运单、面单文件和回传接口。
- 售后接口重点覆盖退货列表、详情、确认、争议、方案、凭证和逆向追踪。
- 官方详细页面存在前端渲染和访问限制，不把目录名称推断成字段定义。
- 原型方案只描述交互，不在本阶段修改页面、数据或共享层。
- 现有 ERP 订单按登录货主限定，不增加货主筛选。
- 自发货和外部委托履约不进入 PDA 或本地 WMS 仓内作业；只有仓发货履约进入仓储执行链。
- 报告使用静态 HTML，字段表和流程内容规模线性增长，避免引入运行时请求和额外性能开销。

## Architecture Design

### 调研结构

官方接口目录与详情证据 → Shopee 能力分类 → 字段与状态清单 → 货灵业务实体映射 → 原型页面交互方案 → 跨端联动评估。

### 业务结构

- 平台原始订单：保存 Shopee 原始字段、原始状态、同步任务和幂等证据。
- 标准业务订单：承载货灵统一状态、审单、SKU 配对、收货快照和履约决策。
- 履约单：承载一次实际发货责任，支持拆单、部分发货、多包裹和补发。
- 执行单：根据履约方式落到出库计划单、自发货单或外部委托履约单。
- 平台售后单：独立记录退货、退款、争议、逆向物流和回传结果。
- 同步任务与异常：记录拉单、发货回传、售后同步、失败原因和重试结果。

### 跨端边界

- 货灵 ERP：订单、履约、物流、售后、同步和异常交互主入口。
- 运营中台：平台适配器、状态映射版本、授权和同步健康管理。
- 货灵 WMS：只处理仓发货的计划单和仓内执行。
- PDA：只处理本地仓拣货、复核、打包和交接。
- 商城端：本轮只保留联动评估，不默认改动。

## Directory Structure Summary

本阶段新增一份 Shopee 调研报告，补充调研索引和顶层日志；原型与数据字典只作为交互映射依据，不直接修改。

```text
/Users/martin/Documents/Martincode/3plwms/
├── docs/
│   ├── 调研/
│   │   ├── Shopee订单接口能力调研-2026-11-10.html
│   │   │   # [NEW] 自包含 Shopee 订单接口调研报告。
│   │   │   # 包含八节报告结构、官方证据、接口字段、状态矩阵、
│   │   │   # 货灵 ERP 原型交互设计、跨端落点、缺项与截图索引。
│   │   ├── Shopee订单接口能力调研-2026-11-10.assets/
│   │   │   # [NEW] 报告证据资产目录；无法获取官方页面截图时记录无截图原因。
│   │   └── index.md
│   │       # [MODIFY] 登记 Shopee 调研报告、调研窗口、对象、结论和状态。
│   └── log.md
│       # [MODIFY] 记录报告新增、索引同步和校验结果。
├── docs/数据字典/
│   ├── 平台订单.md
│   │   # [AFFECTED / NO CHANGE] 作为平台原始订单和标准订单映射依据。
│   ├── 履约决策.md
│   │   # [AFFECTED / NO CHANGE] 作为履约方式、仓库、承运商和拆分交互依据。
│   ├── 自发货单.md
│   │   # [AFFECTED / NO CHANGE] 作为自发货字段和状态动作依据。
│   └── 委托单.md
│       # [AFFECTED / NO CHANGE] 用于区分仓储委托视图与外部委托履约。
└── prototypes/
    ├── owner/
    │   # [AFFECTED / NO CHANGE] 交互方案落点包括订单中心、平台订单、
    │   # 履约单、自发货、平台售后、同步任务和异常对账。
    └── shared/
        # [AFFECTED / NO CHANGE] 评估状态标签、时间线、关系卡片和示例数据复用。
```

沿用现有货灵 ERP 双栏常驻导航，不新增 Shopee 专属菜单。页面采用“列表工作区 + 右侧详情抽屉 + 关系卡片 + 时间线”的信息架构：列表负责批量处理，抽屉负责单据上下文和动作，时间线负责同步、履约、物流与售后留痕。

页面重点强化平台原始状态与货灵统一状态的区分，使用状态标签、异常提示和动作禁用状态表达可操作边界。仓发货、自发货和外部委托履约使用同一履约详情框架，通过履约方式切换字段和动作，不拆成三套页面。

## Agent Extensions

### Skill: research-report

- Purpose：按项目八节结构整理 Shopee 接口调研，补齐字段表、证据分级、结论落点、缺项和校验。
- Expected outcome：生成可双击打开的自包含 HTML 报告，并通过 `check-report.mjs`。

### Skill: agent-browser

- Purpose：渲染 Shopee 官方 JavaScript 文档，补充静态请求无法取得的接口详情、字段和页面证据。
- Expected outcome：明确哪些字段已从官方正文验证，哪些字段只能保留为未验证或待定。

### Skill: huoling-proto

- Purpose：依据现有货灵原型结构制定页面 key、字段、交互动作和跨端联动方案，并在后续确认后执行原型修改。
- Expected outcome：交互设计与现有双栏导航、模块装配、共享 UI 和验收规则保持一致，不引入孤立页面或冲突状态。

### SubAgent: code-explorer

- Purpose：核对 `prototypes/owner/`、`prototypes/shared/` 和各端装配关系，确认页面、数据和共享组件的真实影响面。
- Expected outcome：形成精确的跨端联动清单，避免遗漏受影响文件或误改无关端。