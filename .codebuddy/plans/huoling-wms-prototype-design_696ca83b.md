---
name: huoling-wms-prototype-design
overview: 编制一份面向后续原型改动的货灵 WMS 产品原型设计方案，统一 WMS/WES/WCS 与外部设备集成的功能边界、菜单结构、页面清单、交互与数据链路，并对齐当前七端装配与既有原型规范。
design:
  architecture:
    framework: html
  styleKeywords:
    - 仓储运营控制台
    - 高密度数据表格
    - 双栏常驻导航
    - 状态驱动作业
    - 设备监控
    - 克制动效
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 16px
      weight: 600
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#2563EB"
      - "#1D4ED8"
      - "#4F46E5"
    background:
      - "#F8FAFC"
      - "#FFFFFF"
      - "#F1F5F9"
    text:
      - "#0F172A"
      - "#334155"
      - "#64748B"
      - "#FFFFFF"
    functional:
      - "#16A34A"
      - "#D97706"
      - "#E5484D"
      - "#4F46E5"
todos:
  - id: audit-wms-baseline
    content: 使用 [subagent:code-explorer] 核对当前 WMS 导航、51 页页面、模块归属和既有 WMS/WES/WCS 文档证据
    status: completed
  - id: define-product-boundaries
    content: 使用 [skill:huoling-proto] 收敛 WMS、WES、WCS、设备集成的边界与跨端责任
    status: completed
    dependencies:
      - audit-wms-baseline
  - id: design-information-architecture
    content: 编制目标菜单、业务领域、页面职责、关键字段、状态模型和数据链路
    status: completed
    dependencies:
      - define-product-boundaries
  - id: specify-ui-interactions
    content: 使用 [skill:dashboard-design] 与 [skill:ui-ux-pro-max] 完善看板、列表、抽屉、扫码和设备监控规范
    status: completed
    dependencies:
      - design-information-architecture
  - id: write-and-validate-document
    content: 新增设计方案并更新 docs/index.md、docs/log.md，执行文档与数据字典校验
    status: completed
    dependencies:
      - specify-ui-interactions
---

## User Requirements

编制一份用于指导后续货灵 WMS 原型改动的产品原型设计方案，明确 WMS、WES、WCS 三类能力及外部设备服务厂商接口的产品边界、菜单结构、业务领域、页面职责、关键字段、状态流转、交互方式和跨端联动关系。

## Product Overview

货灵 WMS 作为仓内作业管理端，覆盖入库、出库、库内作业、库存、人员、任务、自动化设备和仓内配置。WMS 负责业务单据与库存事实，WES 负责任务拆分、波次、派工、资源调度和作业重排，WCS 负责设备指令、执行反馈、设备状态和故障处置，外部接口负责 ERP、OMS、TMS、WCS 及设备厂商之间的数据交换与可靠性治理。

## Core Features

- 形成适配当前货灵 WMS 双栏后台外壳的菜单与业务域方案。
- 补齐入库、出库、库内、库存、任务、设备、异常、配置和报表领域。
- 明确 WMS、WES、WCS 的对象、数据边界和执行链路。
- 设计外部设备厂商接入、协议适配、指令回执、重试补偿和人工接管能力。
- 统一列表、报表、抽屉、扫码作业和设备监控等原型骨架。
- 明确单据状态、任务状态、设备状态和异常状态的分离规则。
- 给出当前页面的保留、改造、新增和暂不纳入清单，并标注后续原型落点。
- 视觉上保持高密度、可扫描、面向仓库主管和作业调度人员的运营控制台风格。

## Tech Stack Selection

- 文档载体：项目现有 `docs/` Markdown 文档体系。
- 原型实现依据：现有 Node 原生 ESM `.mjs` 页面模块、自包含 HTML 产物和共享装配注册表。
- 原型外壳：复用 `warehouse-app` 的 `admin` 双栏后台外壳，不引入新的前端框架或组件库。
- 页面骨架：沿用现有 `list`、`report`、`scan` 和抽屉详情/表单模式。
- 数据口径：复用 `prototypes/shared/modules.json`、共享主档、现有文案权威源和数据字典。
- 校验方式：使用 `node docs/check.mjs`、`node docs/数据字典/check.mjs`，后续原型实施阶段再执行构建与交付验收脚本。

## Implementation Approach

先将现有 WMS 51 页、11 个导航段与已有 WMS/WES/WCS 设计资料整理为“现状、必须改造、建议新增、暂不纳入”四类，再建立目标菜单、领域边界、对象模型和页面落点。方案只写入产品设计文档，不直接修改 `prototypes/`，待方案确认后再按跨端联动规则实施原型变更。

关键决策：

- 保留现有“任务中心 / 入库 / 出库与发货 / 库内作业 / 库存与资源 / 人员与配置”六个首栏业务域，避免因 WMS/WES/WCS 理论分层破坏仓内操作动线。
- 将 WES 能力落在任务中心、波次、策略、工序、资源和作业看板中。
- 将 WCS 能力落在设备、执行单元、设备任务、驱动协议、监控告警和 AGV 策略中。
- 将外部设备厂商接口作为独立的集成能力设计，避免入库、出库页面直接依赖厂商字段。
- 继续采用“业务单据 → 工序单 → 作业任务 → 设备任务 → 库存账”的链路。
- 明确单据状态、任务状态、设备状态和异常状态独立表达，避免使用一个通用状态字段承载不同生命周期。
- 对新能力标注建议新增模块或导航段，但不提前修改注册表，控制本阶段变更范围。

性能与可靠性约束：

- 任务池、设备监控和告警列表按状态、仓库区域、货主、执行单元和时间范围筛选，避免在原型数据中无界展示。
- 设备指令必须具备业务单号、任务号、指令号和幂等键，支持重复回执识别。
- 设计中明确超时、重试、死信、补发、人工接管和状态对账路径。
- 设备厂商适配器与 WMS 业务对象解耦，后续替换厂商时不改写库存和出入库主流程。
- 本阶段不改共享层、不改页面源、不新增真实接口，避免影响现有七端产物。

## Architecture Design

产品架构按四层描述：

1. **WMS 业务层**：入库通知单、出库订单、收货、上架、拣货、复核、打包、发运、移库、补货、盘点和库存账。
2. **WES 执行编排层**：任务池、波次、工序 DAG、任务拆分、优先级、派工、资源负荷、SLA、阻塞和任务重排。
3. **WCS 设备执行层**：设备档案、设备能力、执行单元、设备任务、路由、指令、回执、状态、告警和故障恢复。
4. **集成治理层**：外部系统、设备厂商连接器、协议适配、字段映射、消息流水、重试补偿、对账和审计。

设计文档需明确以下关系：

- WMS 产生业务作业需求。
- WES 将业务需求拆分为可执行任务并分配资源。
- WCS 将设备任务转换为厂商协议并接收执行结果。
- 设备执行结果回写 WCS、WES、工序单、业务单据和库存账。
- 异常中心承接业务差异、任务阻塞、设备故障和接口失败，但不复制各业务模块的主数据。

## Directory Structure

```text
/Users/martin/Documents/Martincode/3plwms/
├── docs/
│   ├── 产品需求/
│   │   └── 货灵WMS原型设计方案.md
│   │       # [NEW] WMS 原型总体设计方案。
│   │       # 记录目标菜单、领域边界、页面清单、字段、状态、流程、交互骨架、
│   │       # WMS/WES/WCS 分层、设备集成方案、跨端影响和分批实施计划。
│   ├── index.md
│   │   # [MODIFY] 登记新增设计方案及最近更新时间。
│   └── log.md
│       # [MODIFY] 记录设计方案新增及后续修订。
├── prototypes/
│   ├── shared/modules.json
│   │   # [REFER] 当前端、导航、模块和页面归属的装配真值源。
│   ├── task/
│   │   # [REFER] WES 任务中心、作业看板、任务池与派工页面。
│   ├── inbound/
│   │   # [REFER] 入库业务与收货、上架页面。
│   ├── outbound/
│   │   # [REFER] 出库、波次、拣货、复核、打包和发运页面。
│   ├── warehouse/
│   │   # [REFER] 库位、移库、补货、盘点、加工和冻结页面。
│   ├── inventory/
│   │   # [REFER] 库存、批次、序列号、库存快照和调整页面。
│   ├── resource/
│   │   # [REFER] 设备、容器、执行单元、人员、策略和协议页面。
│   └── base/
│       # [REFER] 本仓商品和仓库基础资料页面。
└── .codebuddy/
    └── skills/huoling-proto/references/
        # [REFER] 原型外壳、页面骨架、文案、装配和验收规范。
```

本阶段不修改 `prototypes/`、`modules.json`、共享层或数据字典；这些文件作为后续原型实施的明确落点和影响面记录在设计方案中。

## Document Sections

设计文档按以下章节编排：

1. 现状基线与设计范围
2. WMS/WES/WCS 产品边界
3. 目标信息架构与 WMS 菜单
4. 各业务领域的页面职责与关键字段
5. 单据、任务、设备和库存数据链路
6. 状态模型、异常模型与逆向流程
7. 外部设备服务厂商接入与接口治理
8. 页面骨架、抽屉、扫码和设备监控交互规范
9. 当前页面保留、改造、新增和暂不纳入清单
10. 跨端联动评估
11. 分批原型实施计划
12. 原型验收清单与后续决策项

## Design Approach

沿用货灵 WMS 现有 `admin` 后台外壳和双栏常驻导航，不重做视觉系统。首栏承载业务域，面板承载导航段和页面，主区域使用高密度表格、状态页签、筛选条、批量动作、抽屉详情和作业看板，适合仓库主管、调度人员和设备运维人员长时间操作。

关键页面模板控制在五类：

- **运营总览**：指标、作业进度、异常和设备状态集中展示，支持进入明细。
- **业务列表**：状态页签、筛选、批量动作、表格、分页，突出当前可执行动作。
- **详情抽屉**：抬头、明细、任务轨迹、设备轨迹和底部动作区。
- **任务调度页**：任务池、资源负荷、阻塞任务和派工动作并列呈现。
- **设备监控页**：设备状态、当前任务、告警、连接和人工接管动作分区展示。

所有页面以数据和操作自解释，不增加宣传性副标题、教学段落或常显说明；危险动作保留影响范围、原因和是否可逆的后果提示。

## Agent Extensions

### SubAgent

- **code-explorer**
- **Purpose**：核对当前 `modules.json`、WMS 页面源、模块边界和已有文档，识别现状与设计方案之间的差异。
- **Expected outcome**：输出可追溯的当前 WMS 页面清单、导航归属、复用落点和潜在冲突，避免方案脱离现场代码。

### Skill

- **huoling-proto**
- **Purpose**：依据原型五层规范、双栏后台外壳、页面类型、文案真值和跨端联动规则编制实施方案。
- **Expected outcome**：设计方案中的菜单、页面类型、文件归属、交互骨架和后续验收要求与现有原型约束一致。

- **dashboard-design**
- **Purpose**：设计 WMS 运营总览、作业看板、设备利用率和资源负荷等数据密集型页面的信息层级与展示方式。
- **Expected outcome**：形成可执行的指标、筛选、分组、异常强调和空态设计规范，避免看板仅停留在装饰性统计卡片。

- **ui-ux-pro-max**
- **Purpose**：校验后台导航、表格、抽屉、告警、扫码作业和设备监控的可用性、可访问性与交互反馈。
- **Expected outcome**：补齐键盘操作、状态反馈、危险动作提示、触控尺寸、颜色对比和低动效策略，形成可用于后续原型验收的 UX 条目。