---
name: wms-p1-prototype-upgrade
overview: 在已完成 P0 的基础上，落地 WMS P1 自动化与接口治理原型：补齐连接器、设备能力矩阵、自动化拓扑、接口对账、发运回执补偿，并贯通告警、任务重排、人工接管和库存过账拦截。先按跨端联动确认统一字段与页面承载，再修改原型源、重建七端并完成验收与文档登记。
design:
  architecture:
    framework: html
  styleKeywords:
    - 企业级后台
    - 高密度列表
    - 二维自动化拓扑
    - 状态驱动
    - 问题优先
    - 低装饰
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 14px
      weight: 600
    body:
      size: 13px
      weight: 400
  colorSystem:
    background:
      - "#FFFFFF"
      - "#F7F8FA"
    text:
      - "#1F2329"
      - "#646A73"
      - "#FFFFFF"
    functional:
      - "#1677FF"
      - "#52C41A"
      - "#FAAD14"
      - "#FF4D4F"
todos:
  - id: p1-impact-review
    content: 使用 [subagent:code-explorer] 复核 P1 页面落点、字段复用、跨端联动和注册表覆盖
    status: completed
  - id: p1-contracts
    content: 使用 [skill:huoling-proto] 更新文案真值、页面注册、导航归属和四个模块版本
    status: completed
    dependencies:
      - p1-impact-review
  - id: p1-resource-pages
    content: 实现连接器、设备能力矩阵和自动化拓扑页面及演示数据
    status: completed
    dependencies:
      - p1-contracts
  - id: p1-reconcile-shipping
    content: 实现接口对账、发运回执补偿和状态重同步交互
    status: completed
    dependencies:
      - p1-resource-pages
  - id: p1-closed-loop
    content: 贯通告警、任务重排、人工接管和库存过账拦截演示链路
    status: completed
    dependencies:
      - p1-reconcile-shipping
  - id: p1-build-acceptance
    content: 使用 [skill:huoling-proto] 重建七端并执行构建、交付、文档和数据字典验收
    status: completed
    dependencies:
      - p1-closed-loop
---

## User Requirements

在已完成 P0 的货灵 WMS 原型基础上，制定 P1 自动化与接口治理改造方案。方案只描述可执行的页面、字段、状态、交互、数据和跨端联动，不立即修改原型源文件。

## Product Overview

P1 补齐设备服务接入、设备能力约束、自动化拓扑、接口状态对账和发运回执补偿，使仓内任务能够从设备连接、能力匹配、执行回执一直追溯到任务重排和库存过账拦截。

## Core Features

- 连接器与协议治理：端点、协议版本、心跳、连接状态、凭证脱敏、状态码和错误码映射。
- 设备能力矩阵：设备类型、作业能力、负载与容器能力、替代资源和生效版本。
- 自动化拓扑：库区、工位、设备、节点、路径、连接状态、故障节点和替代路径。
- 接口对账：WMS、WES、WCS、厂商之间的业务任务、设备任务、指令和回执状态核对。
- 发运回执补偿：承运商回执、超时、部分失败、重复回执、补发和状态重同步。
- 故障影响闭环：告警关联任务，支持重排、换设备、人工接管、接口补发和库存过账拦截。
- 保持现有六域十一段导航，不新增 WES、WCS 或集成治理一级菜单。
- 不实现真实厂商接口、真实密钥管理、WES 求解器、三维孪生和 P2 预测分析。

## Tech Stack Selection

- 原型运行环境：Node.js 原生 ESM 与 `.mjs` 页面源。
- 页面交付：沿用当前构建器生成七个自包含 HTML 产物。
- 数据方式：沿用页面对应 JSON 演示数据，正式主档和字段继续遵循现有共享数据与数据字典。
- UI 实现：复用现有 `ListPage`、`ReportHero`、`DrawerDetail`、`FormDrawer`、`StatusTag`、`ProgressCell`，不引入新的前端框架或组件库。
- 装配方式：通过 `prototypes/shared/modules.json` 注册页面、模块和 WMS 导航归属。

## Implementation Approach

P1 采用“复用现有页面承载主链，新增少量独立页面表达新对象”的策略。连接器与协议复用 `device-driver`，发运回执复用 `handover-list`，故障影响继续贯通 `device-alarm`、`task-pool` 和 `stock-snapshot`；只有设备能力矩阵、自动化拓扑、接口对账新增独立页面。

页面状态必须分离连接状态、设备状态、任务状态、接口状态、回执状态和异常状态。危险动作保留原因、影响范围、操作人、前后状态和可逆性。连接器凭证只展示脱敏值，原始厂商状态与统一状态分别展示。

原型数据量较小，列表渲染按页面行数线性处理，复杂度为 O(n)，不引入运行时轮询、重复数据复制或跨模块读取。拓扑只呈现静态二维关系和演示状态，避免引入图编辑器、三维渲染和额外运行时依赖。

## Architecture Design

- **装配层**：注册三个新增 WMS 页面，并放入现有「设备与容器」导航段。
- **资源治理层**：连接器、协议、能力矩阵、拓扑和设备状态。
- **执行治理层**：接口对账、回执补发、状态重同步、错误码映射。
- **业务闭环层**：告警影响任务，任务重排或人工接管，库存快照记录过账拦截。
- **发运协同层**：交接单承接承运商回执和补偿，ERP 物流跟踪保持只读展示。
- **跨端契约层**：WMS、PDA、ERP、运营中台共享任务号、设备任务号、回执号、异常号和状态口径。

### 跨端联动结论

| 端 | 落点 | 联动内容 | 结论 |
| --- | --- | --- | --- |
| 货灵 WMS | `resource`、`outbound`、`task`、`inventory` | 页面、字段、状态、导航、设备任务和库存拦截 | 必须同改 |
| 作业 APP | 拣货、上架、盘点和设备接入上下文 | 任务号、设备、执行单元、异常码和接管结果 | 必须同改 |
| 货灵 ERP | 物流跟踪、订单对账和履约结果 | 运单回执、异常单号和发运结果口径 | 必须同改 |
| 运营中台管理端 | 设备档案、告警汇总和仓网资源 | 仓库范围、设备状态和告警级别口径 | 必须同改 |
| 货灵商城、独立站 Web、独立站 APP | 订单与品牌展示 | 不引用 WMS 设备和接口状态 | 无需改 |
| 共享层与数据字典 | 注册表、文案、字段、枚举和关联 | 页面装配与字段真值 | 必须同改 |


## Implementation Notes

- 修改 `prototypes/` 前先执行 `node prototypes/build-app.mjs --check`，记录七端基线。
- 先更新 `glossary.md` 和注册表，再新增页面源与演示数据。
- 页面模块只从 `../../shared/ui.mjs` 导入，不跨模块 import。
- 连接器和接口页面禁止展示真实密钥、完整请求凭证或敏感响应内容。
- 发运补偿只处理接口重试和状态同步，不直接修改库存余额或回退已发运状态。
- 修改 `shared/modules.json` 后必须重建七端，而不是只构建 WMS。
- 既有 `docs/check.mjs` 和数据字典检查存在历史问题时，记录为基线问题，不将其伪装为本次通过。

## Directory Structure

### 目录结构概览

本次新增三个 WMS 页面，改造四个已有模块页面，更新注册、文案、模块版本和相关字段文档。

```text
prototypes/
├── shared/
│   └── modules.json                                      # [MODIFY] 注册新增页面并更新 WMS 设备与容器导航段
├── resource/
│   ├── module.json                                       # [MODIFY] 递增资源模块版本和交付说明
│   ├── pages/
│   │   ├── device-driver.mjs                             # [MODIFY] 扩展为连接器与协议治理列表及抽屉
│   │   ├── device-alarm.mjs                              # [MODIFY] 增加统一错误码、接口对账和故障影响链路
│   │   ├── device-capability.mjs                         # [NEW] 设备能力矩阵列表、版本和替代资源
│   │   └── automation-topology.mjs                       # [NEW] 自动化拓扑二维报表与节点详情
│   └── data/
│       ├── device-driver.json                            # [MODIFY] 增加协议版本、映射、健康和失败样例
│       ├── device-alarm.json                             # [MODIFY] 增加拓扑节点、对账号和影响任务
│       ├── device-capability.json                        # [NEW] 能力矩阵演示数据
│       └── automation-topology.json                      # [NEW] 节点、边和故障路径演示数据
├── outbound/
│   ├── module.json                                        # [MODIFY] 递增出库模块版本和交付说明
│   ├── pages/handover-list.mjs                            # [MODIFY] 增加发运回执、补发和补偿动作
│   └── data/handover-list.json                            # [MODIFY] 增加超时、部分失败、重复回执样例
├── task/
│   ├── module.json                                        # [MODIFY] 递增任务模块版本和交付说明
│   ├── pages/task-pool.mjs                                # [MODIFY] 增加故障来源、替代资源和重排结果
│   └── data/task-pool.json                                # [MODIFY] 增加接口失败、替代设备和人工接管样例
├── inventory/
│   ├── module.json                                        # [MODIFY] 递增库存模块版本和交付说明
│   ├── pages/stock-snapshot.mjs                            # [MODIFY] 增加过账拦截、重同步和核验链路
│   └── data/stock-snapshot.json                            # [MODIFY] 增加设备完成但库存未过账样例
└── prototypes/
    └── resource/
        ├── pages/interface-reconciliation.mjs             # [NEW] WMS 接口对账列表与状态时间轴
        └── data/interface-reconciliation.json             # [NEW] WMS/WES/WCS/厂商对账演示数据
```

补充修改文件：

- `.codebuddy/skills/huoling-proto/references/core/glossary.md`：登记新增页面名、列名、状态和动作文案。
- `docs/产品需求/货灵WMS P1原型改造清单.md`：补充实施状态、实际文件和验收结果。
- `docs/index.md`：保持 P1 清单索引与最近更新时间。
- `docs/log.md`：登记 P1 原型实施。
- `docs/数据字典/设备驱动.md`：补充连接器版本、映射和健康字段。
- `docs/数据字典/设备档案.md`：补充能力和拓扑关联字段。
- `docs/数据字典/设备告警.md`、`docs/数据字典/故障工单.md`：补充统一错误码、影响任务和恢复结果。
- `docs/数据字典/物流运单.md`、`docs/数据字典/装车单.md`：补充回执、同步和补偿字段。

## Design Approach

沿用货灵 WMS 现有 `admin` 双栏后台和高密度列表骨架。新增页面不使用装饰性大图表：设备能力矩阵和接口对账使用列表加详情抽屉，自动化拓扑使用二维节点关系和问题节点下钻。所有页面保持“状态页签 → 筛选 → 工具条 → 表格或报表主体 → 分页”的结构。

连接器、设备、任务、接口和异常使用不同状态胶囊；故障节点、对账不一致和过账拦截只在问题位置使用风险色。拓扑页以节点状态、连线方向和任务数量传达信息，避免把拓扑做成三维孪生或厂商控制台。

抽屉固定为抬头、明细、轨迹、动作四段。动作条优先提供查看、重试、同步、补发、转异常和人工接管；不可逆动作显示影响对象和是否可撤销。

## Agent Extensions

### Skill: huoling-proto

- **Purpose**：遵循货灵原型的模块装配、双栏外壳、组件、文案、构建和交付验收规范。
- **Expected outcome**：新增页面能够正确注册到 WMS，使用现有页面骨架和令牌，七端产物构建及验收通过。

### SubAgent: code-explorer

- **Purpose**：复核 P1 页面落点、跨模块引用、同名字段复用和注册表覆盖。
- **Expected outcome**：形成准确的修改文件清单，避免重复建模、漏改导航或产生跨模块依赖。