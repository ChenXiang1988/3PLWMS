---
name: large-wms-prototype-upgrade
overview: 以日均 12,000 单、日均出库 1,000,000 件为目标，重构货灵原型的库存精确表达、高吞吐出库交互、WES 任务聚合与单仓/RCS 边界。先完成跨端联动后的原型源文件、演示数据、注册装配和验收基线调整，不涉及真实前端、后端或数据库实现。
design:
  architecture:
    framework: html
  styleKeywords:
    - 高密度运营控制台
    - 数据优先
    - 状态分层
    - 批量作业
    - 风险突出
    - 单仓上下文
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 16px
      weight: 600
    body:
      size: 13px
      weight: 400
  colorSystem:
    primary:
      - "#2563EB"
      - "#0F766E"
      - "#334155"
    background:
      - "#F5F7FA"
      - "#FFFFFF"
      - "#F8FAFC"
    text:
      - "#0F172A"
      - "#475569"
      - "#94A3B8"
    functional:
      - "#16A34A"
      - "#F59E0B"
      - "#DC2626"
      - "#7C3AED"
todos:
  - id: confirm-linkage-scope
    content: 使用 [skill:huoling-proto] 完成库存、出库、任务、PDA、资源自动化、共享层及仓网边界的跨端联动确认，确认前不修改任何源文件。
    status: completed
  - id: rebuild-inventory-model
    content: 使用 [skill:huoling-proto] 重塑库存总览、明细、流水、快照和调整页面，统一库存状态、数量分解与账实追溯字段。
    status: completed
    dependencies:
      - confirm-linkage-scope
  - id: upgrade-throughput-operations
    content: 使用 [skill:dashboard-design] 与 [skill:ui-ux-pro-max] 升级入库、出库、吞吐驾驶舱、订单聚合列表和波次释放控制台。
    status: completed
    dependencies:
      - rebuild-inventory-model
  - id: align-wes-rcs-boundary
    content: 重塑 WES 任务池和自动化接入页面，统一 RCS 任务关联、回执、重试、补偿与人工接管边界。
    status: completed
    dependencies:
      - upgrade-throughput-operations
  - id: sync-pda-and-registration
    content: 同步 PDA 作业字段、共享组件和 modules.json 注册关系，确保单仓上下文、批量操作和数量口径一致。
    status: completed
    dependencies:
      - align-wes-rcs-boundary
  - id: validate-prototype-delivery
    content: 运行原型构建、--check 与 verify-delivery 验收，核对 12,000 单和 1,000,000 件场景的页面交互，不进行真实性能宣称。
    status: completed
    dependencies:
      - sync-pda-and-registration
---

## User Requirements

### Product Overview

将现有货灵 WMS 原型升级为面向单仓大规模作业的业务原型，目标场景为日均至少 12,000 单、日均出库至少 1,000,000 件商品。原型需要体现高吞吐仓库的库存精度、作业节拍、批量操作和异常处理方式，不将原型性能等同于真实系统性能。

### Core Features

- 建立精确库存视图，区分实物、可用、承诺、分配、锁定、拣选中、复核中、待发运、冻结、质检、差异等状态。
- 增加库存总览、库存明细、库存流水、库存快照与库存调整之间的完整追溯关系。
- 将出库页面改为“吞吐驾驶舱、聚合批量作业、精确查单”三层交互，统一展示订单数、订单行数、商品件数、容器数和任务数。
- 支持筛选结果全选、批量分配、批量释放、加入波次、暂停、重排、重试和批量结果反馈。
- 将波次改为按容量、区域、设备影响、工作站负荷和承诺时间进行动态释放的控制台。
- 将任务中心改为按波次、区域、设备、工作站和异常原因聚合的 WES 任务池。
- 补充入库、出库、拣选、复核、打包、发运的吞吐节拍和积压表达。
- 固定货灵 WMS 的单仓部署上下文，多仓和跨仓业务归仓网端。
- 将自动化边界收敛为货灵 WMS/WES 对厂商 RCS 的业务任务接入、状态同步、重试和补偿，不设计货灵自有的车辆路径、路权、避让、充电和车队调度。

## Tech Stack

- 原型形式：继续使用现有 Node.js 原生 ESM 与 `.mjs` 页面源文件。
- 页面数据：继续使用模块内 JSON 演示数据与共享主档引用。
- 装配方式：继续使用 `prototypes/shared/modules.json` 注册页面和端归属。
- 共享能力：仅在现有 `prototypes/shared/ui.mjs` 组件契约不足时补充批量选择、汇总指标和批量结果反馈。
- 验收方式：使用现有 `node prototypes/build-app.mjs --check`、构建命令和 `verify-delivery.mjs`，不新增后端、数据库、真实接口或性能测试。

## Implementation Approach

先冻结库存状态、数量口径、单仓边界和 RCS 边界，再按“库存基础模型、出库吞吐、任务调度、自动化收敛、跨端验收”的顺序修改原型。大数据量页面不渲染 12,000 条静态明细，而使用聚合行、总量字段、筛选结果计数和代表性详情表达规模。

静态演示数据的聚合计算保持 O(n)，通过有限代表行和汇总字段控制原型输出规模；所有页面明确区分订单、订单行、件数、容器和任务，避免重复统计。原型只验证交互和信息架构，不宣称真实系统吞吐能力。

## Architecture Design

- **库存域**：库存总览 → 库存明细 → 库存流水 → 快照差异/调整。
- **出库域**：吞吐驾驶舱 → 聚合订单与波次 → 批量作业结果 → 单订单全链路抽屉。
- **任务域**：WMS 作业需求 → WES 执行任务 → RCS 业务任务关联 → 执行回执、重试和人工接管。
- **自动化域**：货灵仅维护 RCS 接入配置、状态映射、接口健康和业务影响；厂商 RCS 负责车辆、路径、交通和充电。
- **部署域**：WMS 固定当前部署仓；跨仓计划和调拨来源由 `network-app` 表达，WMS 只展示本仓执行结果。

## Cross-end Linkage

- **货灵 WMS：必须同改**。库存、订单、波次、任务、资源入口和单仓上下文是本次核心落点。
- **PDA 作业端：必须同步字段口径，必要时同改页面**。拣选、上架、盘点、移库、复核等页面需要使用新的库存状态、任务状态和数量口径。
- **任务/WES：必须同改**。聚合任务、批量接管、RCS 任务关联和异常结果需要与 WMS 出库链路一致。
- **资源/自动化：必须同改**。收敛 AGV 策略、设备驱动和自动化拓扑的职责边界，改为 RCS 接入与业务影响展示。
- **共享层：按需同改**。若批量选择、筛选结果全选、汇总栏和结果反馈不能由页面局部实现，再修改 `shared/ui.mjs`；修改后需重建全部端。
- **仓网端：无需修改页面，但需保持边界一致**。跨仓计划继续由 `network-app` 负责。
- **ERP、商城管理端：无需同改页面**。仅核对订单状态、库存查询和货主范围，不在本阶段扩展其交互。
- **跨端联动结论**：以上清单经确认后，才允许修改任一原型源文件、共享层或 `modules.json`。

## Directory Structure

- `prototypes/inventory/pages/stock-list.mjs` — [MODIFY] 重塑库存总览，增加库存状态分解、数量口径和汇总信息。
- `prototypes/inventory/pages/stock-by-location.mjs` — [MODIFY] 增加容器、库存状态、库区位置、作业占用和可用性。
- `prototypes/inventory/pages/ledger-list.mjs` — [MODIFY] 对齐库存状态变更、来源链路、过账和冲销字段。
- `prototypes/inventory/pages/stock-snapshot.mjs` — [MODIFY] 强化账实快照、差异聚合、核验、过账拦截和补偿入口。
- `prototypes/inventory/pages/stock-adjustment.mjs` — [MODIFY] 对齐库存调整与审批、过账、冲销及审计信息。
- `prototypes/inventory/pages/stock-overview.mjs` — [NEW] 提供按货主、SKU、批次聚合的库存驾驶视图。
- `prototypes/inventory/data/stock-list.json` — [MODIFY] 增加状态分解、承诺链路、代表性大仓量级和汇总字段。
- `prototypes/inventory/data/stock-by-location.json` — [MODIFY] 增加容器、区域、库位状态和作业占用数据。
- `prototypes/inventory/data/ledger-list.json` — [MODIFY] 增加状态变更、过账、冲销、幂等和来源关联示例。
- `prototypes/inventory/data/stock-snapshot.json` — [MODIFY] 增加差异聚合和核验处置示例。
- `prototypes/outbound/pages/out-plan-list.mjs` — [MODIFY] 改为聚合订单列表，增加筛选结果全选、批量作业和批量结果反馈。
- `prototypes/outbound/pages/wave-list.mjs` — [MODIFY] 改为波次释放与容量控制台，增加单量、行数、件数、容器和资源负荷。
- `prototypes/outbound/pages/picking-order.mjs` — [MODIFY] 对齐拣选节拍、任务量、件数和异常聚合。
- `prototypes/outbound/pages/sort-task.mjs` — [MODIFY] 对齐分播/复核前后的容器、件数和工作站积压。
- `prototypes/outbound/pages/throughput-dashboard.mjs` — [NEW] 展示日目标、小时节拍、全链路积压、瓶颈和预计完成时间。
- `prototypes/outbound/data/out-plan-list.json` — [MODIFY] 使用聚合订单组和代表性订单详情表达 12,000 单规模。
- `prototypes/outbound/data/wave-list.json` — [MODIFY] 增加高吞吐波次、释放窗口、区域负荷和容量风险。
- `prototypes/task/pages/task-pool.mjs` — [MODIFY] 增加按波次、区域、设备、工作站和异常原因聚合的任务池。
- `prototypes/task/pages/task-list.mjs` — [MODIFY] 对齐 WMS 任务、WES 任务、RCS 任务号和执行实例关系。
- `prototypes/task/data/task-pool.json` — [MODIFY] 增加聚合统计、批量操作结果和人工接管场景。
- `prototypes/task/data/task-list.json` — [MODIFY] 增加多步骤任务、RCS 回执、重试和补偿示例。
- `prototypes/resource/pages/agv-strategy.mjs` — [MODIFY] 收敛为 RCS 接入策略和业务任务释放规则，删除货灵自有路径、避让、充电配置。
- `prototypes/resource/pages/device-driver.mjs` — [MODIFY] 改为 RCS 接口适配、状态码映射、回执和连接健康管理。
- `prototypes/resource/pages/automation-topology.mjs` — [MODIFY] 只展示自动化区域、业务节点和故障影响，不提供车辆路径控制。
- `prototypes/resource/data/agv-strategy.json` — [MODIFY] 改为厂商 RCS 接入及任务释放示例。
- `prototypes/resource/data/interface-reconciliation.json` — [MODIFY] 统一 RCS 合作方、业务任务号、RCS 任务号、指令、回执、重试和补偿字段。
- `prototypes/resource/data/device-driver.json` — [MODIFY] 调整为 RCS 连接器和状态映射数据。
- `prototypes/resource/data/automation-topology.json` — [MODIFY] 调整为单仓自动化区域和业务影响数据。
- `prototypes/inbound/pages/in-plan-list.mjs` — [MODIFY] 补充入库订单、到货件数、收货节拍、待上架量和异常量。
- `prototypes/inbound/data/in-plan-list.json` — [MODIFY] 增加与出库同口径的订单、行、件、容器和任务示例。
- `prototypes/shared/ui.mjs` — [CONDITIONAL MODIFY] 仅在页面无法复用现有组件时，补充批量选择、结果反馈、汇总栏和大列表交互。
- `prototypes/shared/modules.json` — [MODIFY] 注册新增页面、调整页面导航和确认端归属。
- `prototypes/shared/data/warehouses.json` — [MODIFY] 保留共享仓库主档，但明确 WMS 当前部署仓，避免形成 WMS 内多仓操作入口。

采用面向仓库调度员和库存主管的高密度运营控制台风格。首页和出库页优先呈现目标、实时节拍、积压和风险；库存页以数量分解和状态链路为核心；列表默认显示聚合结果，只有进入详情时才展开订单、容器或任务明细。保留现有双栏常驻导航和桌面端宽表布局，不增加无必要的说明文字。批量操作使用明确的选择范围、动作确认、处理中状态、成功失败结果和失败清单入口。

## Agent Extensions

- **huoling-proto**
- Purpose：按货灵原型的五层规范、装配规则、跨端联动流程和交付验收流程执行改动。
- Expected outcome：所有原型页面、数据、共享层和注册关系符合现有项目约束，并通过构建与交付验收。

- **dashboard-design**
- Purpose：设计高吞吐仓库的吞吐驾驶舱、KPI、节拍、积压、热区和异常状态表达。
- Expected outcome：形成适合 12,000 单和 1,000,000 件目标的运营看板结构，避免只展示低规模订单列表。

- **ui-ux-pro-max**
- Purpose：评估大数据量列表、批量选择、状态反馈、信息层级和桌面端高密度交互。
- Expected outcome：为库存、订单、波次和任务页面提供可执行的高吞吐交互方案，并覆盖空状态、异常状态和批量结果状态。