# 正面范例：三套仓储系统源码调研

> 本文是八节骨架的 Markdown 摘要，只用来对照厚度与论据写法；实际交付按 `assets/report-template.html` 填写。材料为某项目 2026-11-08 的真实调研，结论随项目不同，不要照抄。

---

# 三套仓储系统源码调研

- **日期**：2026-11-08
- **作者**：产品组
- **状态**：草案
- **版本**：v1.0
- **报告对象**：JeeWMS、OpenWES、OpenWCS 三套开源仓储系统
- **一句话结论**：三套系统分别补齐单据与计费、工作站交互、设备调度三段能力，其中计费四段链与两级容器可直接借鉴，多租户与退货链不跟随。

## 1. 背景

2026-11 起两条业务线同时要求跨仓调拨与在线对账，现有运营中台 40 页中计费只有「软件服务费」1 页，`billing` 模块的 `rate-list` / `bill-list` 两页未分配端，服务商侧无法出账，只能线下用表格汇总后发邮件确认。

同期 WMS 侧 32 页覆盖单据与账实，任务层只有只读看板，设备层只有设备档案与执行单元，缺少任务下发、状态回传与告警处置，仓内遇到设备故障只能电话通知。

本次结论用于决定 Q1 是否补计费闭环与设备调度层，预算与排期已预留；不用于评价商业版功能。

## 2. 目标

本次调研要回答的问题：

1. 三套系统是否都覆盖「任务池—派工—回传」链路？各覆盖到哪一步？
2. 计费从规则到发票共几段？是否都有结算单与发票两级？
3. 出入库单据的字段口径能否直接落到数据字典？
4. 设备层的最小可用集合是什么（契约、监控、告警、驱动）？

本次不回答：

- 不评价各系统的商业版能力与定价。
- 不做性能压测与部署验证。
- 不覆盖移动端与 PDA 运行时。

## 3. 方法

| 项 | 内容 |
| --- | --- |
| 采集方式 | GitHub Search API 定位仓库；contents / git/trees 逐层枚举目录；raw 读取 README 与文档原文；逐页读 9 个 Vue 源码文件 |
| 覆盖范围 | JeeWMS 云端版前端 118 个可见 `.vue`（逐页读 9 个）、计费 16 页目录、系统管理 26 页目录；OpenWES 23 篇文档（全文读 3 篇）；OpenWCS `settings.gradle` 19 个 include 与 README 服务表 |
| 未覆盖 | JeeWMS `DOC/` 下 3 份 .doc/.pptx/.pdf 与 1 份 .pdm 未解包；4 张界面截图未逐张打开；OpenWES 无业务源码可读；OpenWCS 服务源码未读 |
| 访问条件 | 未登录任何运行实例，无账号；全部为公开仓库只读 GET；未注册账号、未绕过权限、未批量抓取；未执行任何写操作 |
| 工具与版本 | GitHub REST API v3、Gitee API v5；GitHub 匿名配额 60 次/小时触发限流后改走 Gitee 镜像 |
| 限制 | 静态源码无法确认默认排序、分页大小、空态与角色差异；材料有时效性，产品改版后需复核 |

## 4. 数据来源

| 编号 | 来源 | 地址或路径 | 访问日期 | 证据级别 | 可复核性 |
| --- | --- | --- | --- | --- | --- |
| S1 | JeeWMS 仓库元数据 | `github.com/erzhongxmu/JeeWMS` | 2026-11-08 | C | 可复核 |
| S2 | JeeWMS 云端版 README | `jeewms-cloud/README.md` | 2026-11-08 | B | 可复核 |
| S3 | JeeWMS 前端目录与 9 页源码 | `web/baseWeb/src/views/wms/{jee,bms}` | 2026-11-08 | B | 可复核（Gitee 镜像） |
| S4 | OpenWES 侧栏与功能清单 | `sidebars.ts`、`docs/concepts/features-overview.md` | 2026-11-08 | B | 可复核 |
| S5 | OpenWES 收货与拣货流程 | `docs/concepts/workflow.md` | 2026-11-08 | B | 可复核 |
| S6 | OpenWCS 模块清单 | `settings.gradle` | 2026-11-08 | B | 可复核 |
| S7 | OpenWCS 服务表与设备契约 | `README.md` | 2026-11-08 | B | 可复核 |
| S8 | 本项目基线 | `prototypes/shared/modules.json`、`build-app.mjs --check` | 2026-11-08 | A | 可复核（本机执行） |

## 5. 核心发现

### 5.1 三套系统的定位不同，可借的部分不重叠

| 维度 | JeeWMS | OpenWES | OpenWCS |
| --- | --- | --- | --- |
| 定位 | 单据与计费齐全的 WMS | 文档先行的 WES 设计方案 | WES + WCS 合体工程 |
| 可读材料 | 118 个可见页面 + 9 页逐页实读 | 23 篇文档，公开代码仅 mock | 19 个模块 + README 服务表 |
| 主要贡献 | 单据字段、计费四段链 | 工作站交互、任务编排分类 | 设备统一契约、状态分离 |
| 工程特征 | 大量列与动作整段注释 | 文档投入重于代码 | 契约优先、txlog 唯一真相源 |

来源：S1、S3、S4、S6

结论性差异：想补字段与计费看 JeeWMS；想补工作站与任务分类看 OpenWES；想补设备层与告警看 OpenWCS。三者不可互相替代。

### 5.2 计费是完整四段链，本项目缺三段

JeeWMS `views/wms/bms` 共 16 页，读源确认四段：

| 段 | 页面 | 关键字段 |
| --- | --- | --- |
| 配置 | 费用类型、费用来源、计费规则（含批量）、费用项目 | `contNo` 合同、`costMin` / `costMax`、`costPeriod`、`costValidBegin` / `costValidEnd` |
| 计费 | 费用明细 | `costObjType` / `costObjNo` / `costObjName` |
| 出账 | 账单主表、账单配置、客户费用头/明细 | `billNo`、`billType`、`billPeriod`、`billSum`、`costHb` |
| 结算 | 结算类型、财务主体、收付款、发票 | `costSoNo` 来源、`costSl` 税率、`costCoBhsj` / `costCoYhsj` |

账单主页签为「未开票 / 已开票」且各带计数；行内动作按审核 → 发送 → 确认 → 完成四步排列，对应 `shenhebillById`、`sendbillById`、`querenbillById`、`wanchengbillById`。

来源：S3

本项目对比如下（S8）：中台仅「软件服务费」1 页，`billing` 四页中两页归货灵ERP、两页未分配端，四段链缺三段。

### 5.3 任务与设备层：状态分离是共同做法

| 系统 | 证据 | 双状态 |
| --- | --- | --- |
| JeeWMS | `WmToMoveGoodsList.vue` | `moveSta`（计划中…）与隐藏的 `runSta`（执行状态）并存；仅「计划中」可批量转移 |
| OpenWCS | `settings.gradle`、README | `flow-orchestrator` 派发设备任务，`txlog` 记执行结果；告警独立于任务 |
| OpenWES | `features-overview.md` | 任务编排 6 项：动态建单、优先级与 SLA、资源分配、负载均衡、进度监控、绩效分析 |

来源：S3、S4、S6、S7

同一份源码里，`WmToMoveGoodsList` 还保留原始单据三元组 `orderTypeCode` / `orderId` / `orderIdI`，说明改账必须能回指来源单据。

### 5.4 单据字段：可直接进字典，但需换命名

| JeeWMS 字段 | 含义 | 本项目对应 |
| --- | --- | --- |
| `imCusCode` | 装箱单号 / 货主单号（随页面变化） | `docNo` |
| `goodsBatch` | 子 PO 号 | `sourceNo` 的明细维度 |
| `firstRq` / `secondRq` | 一次下架容器 / 分拣容器 | `firstContainerNo` / `secondContainerNo` |
| `goodsWqmCount` | 验收数量，必填 | `acceptedQty` |
| `moveSta` / `runSta` | 状态 / 执行状态 | `taskStatus` / `deviceStatus` |

来源：S3

一处需记录的纠错：`WmReturnAcceptList.vue` 文件名像退货验收，实读组件为 `WmImNoticeIList`、接口 `wmImNoticeI/ysList`、对象是到货通知单明细，实为**收货验收**。据此把 JeeWMS 退货链从「7 页」更正为「`WmReturn*` 6 个文件、退货专属 5 页」。

## 6. 结论与建议

### 6.1 结论

| 编号 | 判定 | 结论 | 落点 |
| --- | --- | --- | --- |
| C1 | 可借鉴 | 计费按四段链补齐，配置→计费→出账→结算，缺一段则账单无法追溯到来源单据 | `billing/settlement-list`、`billing/invoice-list` |
| C2 | 可借鉴 | 账单页签即开票状态且带计数；结算状态取「待审核 / 已发送 / 已确认 / 已完成 / 已驳回」，替换自拟六态 | `settlement-list` 的 `invoiceStatus`、`status` |
| C3 | 可借鉴 | 验收时同录验收数量（必填）、生产日期、批次、计划库位、托盘，否则上架无落位依据 | `inbound/qc-order` 的 `acceptedQty`、`plannedLocationCode`、`palletNo` |
| C4 | 可借鉴 | 理货是收货与上架之间的独立环节，独立成页而非并入收货 | `inbound/tally-task` |
| C5 | 可借鉴 | 分播用两级容器（一次下架容器 → 分拣容器），只画一层格口会丢来料容器 | `outbound/sort-task` 的 `firstContainerNo`、`secondContainerNo` |
| C6 | 可借鉴 | 任务态与设备态分列，合并成一个「状态」列后无法派工 | `task/task-pool` 的 `taskStatus`、`deviceStatus` |
| C7 | 不跟随 | 多租户与 SaaS 部署形态：JeeWMS 有 `TenantList`，OpenWES 有 Multi-Tenant Architecture，均与单实例单主体冲突 | 不落端与字段 |
| C8 | 不跟随 | 退货链五页不并入 WMS：源头在 ERP 退货申请单与售后入库计划单，仓内只落一张入库通知单 | 入库通知单（来源=售后） |

### 6.2 建议

| 编号 | 动作 | 负责人 | 前置 | 判据 |
| --- | --- | --- | --- | --- |
| R1 | 先在 glossary 与数据字典登记 31 个页名、约 55 个列名、19 组枚举，再改注册表 | 产品组 | 方案确认 | `build-app.mjs` 通过且侧栏出现新段 |
| R2 | 按链路分四批落页：中台计费 → WMS 单据账实 → WMS 任务设备 → 收尾验收 | 产品组 | R1 | 每批全量验收零违规 |
| R3 | 三个待定参数页先留骨架与占位，不写死阈值 | 产品组 + 设备侧 | 设备参数确认 | 参数确认后 2 日内补齐，且有来源编号 |
| R4 | 报告与方案文档统一证据分级口径，避免同一结论两套等级 | 产品组 | 本报告评审通过 | 两文档分级定义一致 |

## 7. 附录

### 7.1 缺项与未验证

| 项 | 原因 | 影响 |
| --- | --- | --- |
| 数据库 DDL 与字段精度 | 仓库只有 `.nb3` Navicat 二进制备份，未解包 | 字段长度、小数位、唯一约束无法确认，影响 C2 与 3 个字段 |
| 真实菜单标题与排序 | 菜单存于数据库，未解包 `.pdm` | 只能给视图目录树，不能给菜单树 |
| 角色差异 | 无账号、未登录运行实例 | 管理员与受限角色的菜单、字段、按钮差异未验证 |
| 空数据默认行为 | 静态源码无法确认 | 默认排序、分页大小、空态文案均标「未验证」 |
| OpenWES 业务源码 | 公开仓库仅文档与 mock | 其能力结论停在文档级 |
| OpenWCS 服务源码与 UI | 只读 README 与 settings.gradle | 服务表为自述级证据，UI 视觉未核 |

### 7.2 术语对照

| 原生叫法 | 本项目叫法 | 差异 |
| --- | --- | --- |
| 货主编码 `cusCode` | 货主 `ownerCode` | JeeWMS 用「客户」，本项目统一「货主」 |
| 仓位 `binId` / `kuWeiBianMa` | 库位 `locationCode` | 同一仓库两套词并存，本项目只用一个 |
| 下架 `WmOmQmI` | 拣货 / 下架任务 | 沿用现有「拣货单」，不引入「下架」 |
| 计费对象 `costObjNo` | 结算对象 `ownerCode` | 本项目结算对象只取货主 |

### 7.3 变更记录

| 日期 | 版本 | 变更 | 原因 |
| --- | --- | --- | --- |
| 2026-11-08 | v0.1 | 建立报告，完成三套系统源定位 | 需求提出 |
| 2026-11-08 | v1.0 | 补 9 页逐页字段、计费四段链、两处纠错 | 源码实读完成 |
