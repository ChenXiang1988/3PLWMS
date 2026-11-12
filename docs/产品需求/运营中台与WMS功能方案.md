# 货灵运营中台管理端与货灵WMS参考框架（设计理念 · 界面结构 · 字段）

**目标读者**：产品、原型维护人、评审人。
**核心目的**：把两端的功能设计收成一份可对照的三层框架——设计理念定判据，界面结构定骨架，字段清单定取值；三层互相指认，落页时按同一份文件核。
**前提**：单实例单主体，不做多租户；货主是业务维度，走筛选不走租户切换；一个端一个交付产物，WMS 是 WMS/WES/WCS 三层合一的一个端。
**与既有文档的关系**：能力边界看 [三端核心功能清单.md](三端核心功能清单.md)；字段真值源在 `docs/数据字典/`，本文件是设计期清单，与字典冲突以字典为准；外壳与组件契约看 `.codebuddy/skills/huoling-proto/references/shells/admin.md` 与 `implementation.md`。

**三层的读法**：先读第 2 节知道「为什么这样设计」，再读第 3 节知道「界面长什么样」，最后读第 4 节知道「每个字段从哪来、到哪去」。三层不自洽时以第 2 节的原则裁决，再改另两层。

> 实施状态（2026-11-09）：中台 12 新增 + 2 启用、WMS 19 新增已按 [各端原型优化方案.md](各端原型优化方案.md) 落地；中台 54 页 / 12 段，WMS 51 页 / 11 段。本文的页面清单与字段仍作设计依据，装配以 `prototypes/shared/modules.json` 为准。

## 1. 对标源与证据边界

### 1.1 四套源

| 系统 | 公开仓库 | 规模 | 本次读到的内容 | 不取 |
| --- | --- | --- | --- | --- |
| JeeWMS | `erzhongxmu/JeeWMS` | 153★，GPL-3.0，Java + Spring Cloud + Vue + uni-app | `jeewms-cloud/README.md` 的流程原句；`web/baseWeb/src/views/` 下 `wms/jee` 87+ 页、`wms/bms` 16 页、`system` 26 页、`erp/baseInfo` 3 页、`activiti`、`bi`、`dashboard` | 租户管理（`TenantList.vue`）、公有云/混合云部署形态 |
| OpenWES | `jingsewu/openwes-docs`、`jingsewu/mock` | 3★ / 2★，Apache-2.0，Java | `sidebars.ts` 的 20 节文档结构；`concepts/features-overview.md` 功能清单；`concepts/workflow.md` 收货与拣货逐步操作 | 多租户（`Multi-Tenant Architecture`）、SaaS 部署选项 |
| OpenWCS | `brettljausn-ai/openwcs` | 9★，AGPL-3.0，Java + Go | `settings.gradle` 的 19 个模块；`README.md` 的服务职责表、统一设备契约、适配器清单、UI 五大分区与 3D 孪生 | Keycloak 认证、K8s 部署、AI 助手 |

`jeewsms` 为 JeeWMS 笔误（用户 2026-11-08 确认），两端对标源统一为 JeeWMS。

### 1.2 证据清单

**A 级：读到仓库文件原文**

| 来源 | 路径 | 证明了什么 |
| --- | --- | --- |
| JeeWMS | `jeewms-cloud/README.md` | 业务代码在 `base-cloud-module/base-cloud-busin`；流程原句「入库、理货、上架、下单、库存、波次、拣货、复核、称重、发货」；库存与理货任务在报表模块 |
| JeeWMS | `web/baseWeb/src/views/wms/jee/` | 51 个 `Ba*` 基础资料页（`BaKwList` 库位、`BaStoreList` 仓库、`BaStoreAreaList` 库区、`BaSnroList` 序列号、`BaPronutMethodList` 加工方式、`BaQmQaList` 质检、`BaUnitList` 单位、`BaCostRule*`）、`MdCusList` 客户、`MdSupList` 供应商、`MdGoodsList` 商品、`WmImClientHList` 入库通知、`WmImAcceptIList` 验收、`WmCartonNumberList` 箱号、`WaveToDownList` 波次下发、`PositionsFigure` 库位图、`Statement` 对账单、`WmCreditManagementList` 信用、`WmDayCost*` 日费用、`TmsYwCarList` / `TmsYwWindList` 车辆与装车 |
| JeeWMS | `web/baseWeb/src/views/wms/bms/` | 16 页构成完整计费链：费用类型、费用来源、计费规则（含批量）、费用项目、费用明细 → 账单、账单配置、客户费用头/明细 → 结算类型、财务主体、收付款、发票 |
| JeeWMS | `web/baseWeb/src/views/system/` | 26 页：用户、部门、部门用户、角色、角色授权、岗位、权限、数据权限规则、字典、字典项、分类字典、系统日志、数据变更日志、定时任务、多数据源、网关路由、租户、通告 |
| JeeWMS | `web/baseWeb/src/views/erp/baseInfo/` | 工艺 `BaseCraftList`、组织 `BaseOrganizationList`、价格 `BasePriceList` 三页 |
| JeeWMS | `web/baseWeb/src/views/wms/jee/`（完整目录） | Gitee `contents` 响应在 `WmPlatIoList.vue` 处截断，可见 118 个 `.vue`（`Ba*` 51、`Wm*` 46、`Md*` 8、`Tms*` 7、`Bi*` 1、其他 5）；`git/trees` 全表在其后另列 `WmPlatIoMList`、`WmReturn*` 6、上下架与移库 7、`WmTruckReCheck*` 2、`WmWeigh`、`WmWendu`、`WmTuopan`、`Wms*` 5 等 24 个文件，故 `Wm*` 46 不是总数；全表 `Wm*` 65 + `Wms*` 5 = 70。分组互斥且合计 70：入库/验收 13、出库/下架 21、退货 6、上下架与移库 7、装车复核 2、费用与历史库存 11（含箱号）、托盘/称重/温控 3、平台出入库 2、`Wms*` 5 |
| JeeWMS | `wms/jee/WmOmClientHList.vue` | 出库通知单实读：列 `omNoticeId` 出库通知单、`imCusCode` 货主单号、`cusCode` 货主、`delvData` 要求交货时间、`orderTypeCode` 订单类型（19 其他出库 / 其余货主出库）、`createName`、`createTime`；隐藏列含 `delvMember` 收货人、`reMember` 承运人、`reCarno` 车号、`omPlatNo` 发货月台、`omSta` 状态、`piClass` 对接单据类型、`piMaster` 账套 |
| JeeWMS | `wms/jee/WmOmQmIList.vue` | 下架任务实读：列 `imCusCode` 装箱单号、`goodsBatch` 子PO号、`goodsId` / `goodsName`、`binId` 库位、`tinId` 托盘、`baseGoodscount` 出货数量、`goodsUnit`、`proData` 生产日期、`omNoticeId` 出库单号；动作为批量下架、批量改托盘与数量、批量打印标签；接口 `/jeewms/wmOmQmI/dotodown1` |
| JeeWMS | `wms/jee/WmToUpList.vue` | 上架任务实读：列仅 托盘码 `binId`、库位编码 `kuWeiBianMa`、作业类型 `actTypeCode`、货主 `cusCode` 加审计列（创建人/日期、更新人/日期、所属部门、所属公司）；无查询条件；动作添加/导入/导出/批量删除/编辑/删除；接口 `/jeewms/wmToUp/list` |
| JeeWMS | `wms/jee/WmToMoveGoodsList.vue` | 库存转移实读：查询含源库位 `binFrom`、到库位 `binTo`、源托盘 `tinFrom`、到托盘 `tinId`、状态 `moveSta`（默认「计划中」）；列含 `goodsQua` 数量、`goodsProData` 生产日期、`moveSta` 状态、`updateTime` 操作时间、`updateBy` 操作人；仅「计划中」可做批量转移/批量保存/取消/删除；隐藏列还有原始单据三元组 `orderTypeCode`/`orderId`/`orderIdI`、执行状态 `runSta`、批次 `goodsbatch`、转移客户 `toCusCode`；接口 `/jeewms/wmToMoveGoods/editBatch` |
| JeeWMS | `wms/jee/WaveToDownList.vue` | 波次下发实读：查询含波次号 `waveId`、仓位 `binId`、一次下架容器 `firstRq`；列含单号 `imCusCode`、仓位、托盘 `tinId`、数量 `baseGoodscount`、**一次下架容器 `firstRq` / 分拣容器 `secondRq`**、批次 `goodsBatch`、商品条码 `shpTiaoMa`、出库备注 `omBeiZhu`；打印拣货单含订单总数、总拣数量、仓位、商品条码、应检数量；接口 `/jeewms/waveToDown/queryWaveList` |
| JeeWMS | `wms/jee/WmReturnAcceptList.vue` | **实读后更正**：文件名似退货验收，实际组件 `WmImNoticeIList`、描述「商品管理页面」、接口 `/jeewms/wmImNoticeI/ysList`，是到货通知单明细的收货验收。列为到货通知单号 `imNoticeId`、商品编码/名称、数量 `goodsCount`、生产日期 `goodsPrdData`、批次 `goodsBatch`、收货登记数量 `goodsQmCount`；验收弹窗必填「验收数量 `goodsWqmCount`」，另有计划库位 `binPlan`、托盘 `tinId`；动作批量验收/批量保存/批量取消验收/行内验收；写入 `/jeewms/wmInQmI/batchAdd` |
| JeeWMS | `wms/bms/BmsCostRuleHList.vue` | 计费规则主表实读：合同编号/名称 `contNo`/`contName`、规则编号/名称、费用编号/名称、来源类型编号/名称、**计费对象类型 `costObjType`、计费对象编号/名称、最低收费 `costMin`、最高收费 `costMax`、计费周期 `costPeriod`、有效开始/结束时间 `costValidBegin`/`costValidEnd`**；展开行内嵌计费规则子表；接口 `/bms/bmsCostRuleH/list` |
| JeeWMS | `wms/bms/BmsBillHList.vue` | 账单主表实读：账单编号 `billNo`、账单类型 `billType`、期间 `billPeriod`、计费对象类型/编号/名称、账单金额 `billSum`、货币 `costHb`、备注、状态 `status`、附件 `attr1`；**页签「未开票 / 已开票」带计数**；行内动作审核/发送/确认/完成/账单调整/详情，对应 `shenhebillById`、`sendbillById`、`querenbillById`、`wanchengbillById`；展开行内嵌账单详情子表 |
| JeeWMS | `wms/bms/subTables/BmsBillISubTable.vue` | 账单明细子表实读：账单编号 `billNo`、**来源编号 `costSoNo`、来源名称/日期**、计费税率 `costSl`、货币 `costHb`、计费不含税价 `costCoBhsj`、计费原含税价 `costCoYhsj`；接口 `/bms/bmsBillH/queryBmsBillIByMainId` |
| OpenWES | `docs/concepts/features-overview.md` | 入库 6 项（ASN、收货、越库、上架优化、质检、异常分流）、出库 7 项（订单、波次、拣选路径、多拣选策略、Pick-to-Light、打包、发运）、库存 6 项（实时、批次序列号、循环盘点与 ABC、调整、补货、FEFO/FIFO）、任务编排 6 项、人力 6 项、设备集成 6 项 |
| OpenWES | `docs/concepts/workflow.md` | 收货六步与拣货六步的界面级操作：选工作站 → 扫 LPN → 校验客户与存储类型 → 扫 SKU 与数量 → 扫库位 → Full Box；拣货为绑周转箱到播种墙格口，格口白/绿/蓝三态，扫 SKU 点击确认，最后熄灯 |
| OpenWCS | `settings.gradle` | 19 个模块：`master-data`、`inventory`、`allocation`、`slotting`、`gtp`、`process-engine`、`order-management`、`counting`、`flow-orchestrator`、`process-designer`、`txlog`、`iam`、`notification`、`assistant`、`integration-*` |
| OpenWCS | `README.md` | 服务职责表；统一设备契约 `POST /tasks`、`/healthz`、`/readyz`；适配器 `conveyor`、`asrs`、`amr-geekplus`、`autostore`、`ptl`、`equipment-emulator`；UI 五大分区含 Operations 的 3D 硬件孪生与 andon 安灯墙；告警 `/alerts` 与 `/alerts/{id}/ack` |

**B 级：README 自述、未读到实现**

- JeeWMS：多货主看板、仓位使用率、效期预警、AGV 调度模拟、动态计费引擎（README 配图与文字）。
- OpenWES：`Pick-to-Light Integration`、`Packing Optimization`、`Weighing Systems` 等条目名（清单级，无界面细节）。

**C 级：仅凭目录名或服务名推断，落页前需再核**

- 设备利用率、维保计划、AGV 调度策略的具体字段（三套仓库均无对应页面或参数表）。
- 库位容量字段（`BaKwList` 存在，但容积/承重字段名未读到）。

### 1.3 调研修正了原方案的十一处

1. **补「理货任务」**。JeeWMS 把理货列为收货与上架之间的独立步骤，原 30 页漏了这一环，本轮补为第 31 页；「称重」折进打包单的重量字段，不单开页；「下单」由计划单承担，WMS 不重复建单。
2. **OpenWCS 不是纯 WCS**。它的服务里有 `allocation`、`slotting`、`gtp`、`counting`、`order-management`，实际是 WES + WCS 合体。原方案把 WES 层能力全归给 OpenWES 是错的，WES 层应对照 OpenWCS 的服务划分。
3. **工作站交互按 OpenWES 原文重写**。原写「站台队列 / 拣选位 / 播种格」三段是泛泛描述；原文是「绑周转箱到格口 → 扫 SKU → 格口变色 → 点击确认 → 熄灯」，且有明确的三色状态。第 6.2 节已改。
4. **审批流从「扩展推断」升为依据**。JeeWMS 有 `views/activiti` 工作流目录与 `PermissionDataRuleList` 数据权限规则页；但它用的是 Activiti 引擎与流程模型管理，不是「审批节点配置」，我们画的仍是简化版，标 B 级迁移。
5. **退货不单开页**。JeeWMS 有 `WmReturnNoticeH/I`、`WmReturnClientH/I`、`WmReturnPutaway` 五页退货链（另有 `WmReturnAcceptList` 实为收货验收页，不计入）。货灵不跟随：退货源头在货灵ERP 的退货申请单与售后入库计划单，仓内落成一张入库通知单（来源=售后），再走收货、质检、上架。这是设计选择，不是缺口，理由见第 10 节。
6. **称重、温控、托盘不单开页**。JeeWMS 有 `WmWeigh`、`WmWenduList`、`WmTuopanList` 三个独立页；称重并入打包单的重量字段，托盘并入容器档案，温控因冷链业务前提未定暂不纳入。
7. **字段对齐的是语义，不是命名**。JeeWMS 的 `imCusCode`、`goodsBatch`、`tinId`、`binId`、`omPlatNo`、`reCarno`、`piMaster` 已用来核对第 4 节有没有漏掉语义，货灵仍沿用自有的 `obNo`、`planNo`、`packingNo` 命名，不照搬前缀。
8. **上一轮把 `WmReturnAcceptList.vue` 当「退货验收」是错的**。实读后它是到货通知单明细的**收货验收**页（组件 `WmImNoticeIList`，接口 `ysList`），验收弹窗必填验收数量，另录计划库位、批次、生产日期、托盘。这不改变「不单开退货页」的结论，但把 JeeWMS 的退货链从 7 页更正为 6 页，且为我们的质检单补了「验收数量 + 计划库位 + 托盘」字段（第 4.3 节）。
9. **计费链路缺了三组字段**。实读 `BmsCostRuleHList` 与 `BmsBillHList` / `BmsBillISubTable` 后，发现原清单缺：合同编号、最低/最高收费、计费周期与规则有效期；账单的货币与税率、含税/不含税价、来源编号；账单「未开票 / 已开票」页签与审核→发送→确认→完成动作链。已回填到第 4.3 节「服务目录与报价」「结算单」「发票与收款」与第 6.4 节。
10. **分播是两级容器，不是一层格口**。`WaveToDownList` 有 `firstRq` 一次下架容器与 `secondRq` 分拣容器；OpenWES 的播种墙是格口绑定周转箱。两者拼起来是「一次下架容器 → 分拣容器/格口」两级，原「分播播种」只有一层 `gridCode`，已补 `firstContainerNo` 与 `secondContainerNo`。
11. **移库是状态双轨，印证 P3**。`WmToMoveGoodsList` 同时有 `moveSta`（计划中…）与隐藏的 `runSta`（执行状态），且只有「计划中」允许批量转移；原始单据三元组 `orderTypeCode` / `orderId` / `orderIdI` 印证 P4 的 `sourceNo`。这两条把 P3、P4 从设计主张变成有源码依据的做法。

同时明确两条不取的：JeeWMS 的 `TenantList` 租户管理与 OpenWES 的 `Multi-Tenant Architecture` 都与单实例单主体冲突，不进原型。

## 2. 设计理念

### 2.1 设计目标

1. **一个端回答一个问题**。运营中台回答「仓网今天怎么样、谁该付多少钱」，WMS 回答「这批货现在在哪一步、谁在执行」。不属于这个问题的数据不画。
2. **结构自解释**。使用者每天开八小时，判据是一屏能读多少行、误操作有多少。层级、分组、主操作自己说明结构，不靠副标题与引导句补。
3. **同名同义**。同一个业务对象在三个后台端用同一套字段名与状态枚举；跨端不一致视为缺陷，不是风格差异。

### 2.2 七条核心原则

每条原则都同时约束字段与结构；只约束一层的不是原则，是偏好。

| # | 原则 | 为什么 | 对字段的约束 | 对结构的约束 |
| --- | --- | --- | --- | --- |
| P1 | 数据优于解说 | 解说会过期，数据不会 | 每个字段必须有明确用途；没有界面出口的字段不进页面 | 列表页不加副标题、不加引导句、不铺 KPI 卡 |
| P2 | 一段一问题 | 导航是动线，不是分类树 | 字段按它回答的问题归段；跨问题的字段不塞进同一段 | 段即导航，首栏按业务域归并段，面板按段列页 |
| P3 | 状态分离 | 任务、设备、单据的推进节奏不同，合并后无法派工 | 三种状态独立成字段：`taskStatus` / `deviceStatus` / `docStatus` | 列表并按列展示或按页签分开筛，不做单一「状态」列 |
| P4 | 单一改账入口 | 库存只能经确定的单据变更，否则账实无法追溯 | 每次库存变化带 `sourceNo` 与 `changeType`；调整类字段必带原因 | 改账三页（盘点差异、异常处置、库存调整）都有审批动作区 |
| P5 | 列表即工作台 | 仓内是操作岗，不是查阅岗 | 每个列表至少一个动作字段 | 批量动作进工具条，单据动作进行内，下钻进行首列 |
| P6 | 抽屉承载细节 | 详情占独立页面会打断动线 | 字段分组对应抽屉分区：抬头 / 主档 / 明细 / 轨迹 | 层级只有三级：端 → 段与页 → 抽屉 |
| P7 | 危险动作留痕 | 冻结、作废、强制完成、改账不可逆 | 必带 `reason`、`operator`、`actedAt` | 动作旁给后果提示位，不用二次弹窗替代说明 |

### 2.3 理念如何指导前两层

| 原则 | 在界面结构上的落点 | 在字段上的落点 |
| --- | --- | --- |
| P1 | 页头只有页名与页签；一屏一主体 | 字段表只列有出口的字段；派生字段用纯函数，不落数据 |
| P2 | 中台 12 段、WMS 11 段，单段 2~7 页 | 段内页面字段不跨域取数，跨域只取编码不取明细 |
| P3 | 任务池三列并排；设备监控状态列独立于任务列 | 三套状态枚举分表登记 |
| P4 | 改账三页的抽屉底部固定「提交审批」 | `sourceNo`、`changeType`、`reason` 必填 |
| P5 | 工具条只放批量动作；行首列是下钻 | 每页动作字段与动作文案一一对应 |
| P6 | 只注册 `list` 与 `report`；`detail`、`form` 都是抽屉 | 抽屉四分区对应字段四组，不做扁平长表单 |
| P7 | 危险动作集中在抽屉底部 | `reason`、`operator`、`actedAt` 进字段清单 |

## 3. 界面结构

### 3.1 层级关系

四级，不多不少：

```text
端产物（一个 HTML）
└ 业务域首栏（rail，点域切面板）
  └ 段与页（面板按段分组列页，段内全部展开）
    └ 抽屉（详情 / 表单 / 编排，覆盖在页面上）
```

不设三级菜单，不设页内页签嵌套，不设跨端跳转（唯一例外是货灵ERP面板表头「前往商城」）。

### 3.2 后台外壳骨架

```text
.wx-app（100vh）
└ .wx-shell
   ├ .wx-rail    76px：品牌字标 / 业务域 / 帮助、通知、当前用户
   ├ .wx-panel  256px（可收起为 0）：端名 + 产品名 + 本域搜索 / 段与页 / 收起按钮
   └ .wx-main
      └ .wx-page-body    唯一滚动容器
         ├ 筛选条（filters）
         ├ 工具条（批量动作）
         ├ 主体（表格 / 指标区）
         └ 分页
抽屉与提示挂 body 末尾
```

| 区域 | 放什么 | 不放什么 |
| --- | --- | --- |
| 首栏 | 品牌字标、各业务域（字标 + 域名）、帮助、通知、当前用户 | 别的端的页面、部署形态、主体切换器、套餐与配额 |
| 面板 | 端名、产品名、本域搜索、段名（分组标签）、页名（直接切页）、收起按钮 | 副标题、页面概述、装配元信息 |
| 筛选条 | `filters` 声明：文本、下拉、日期、日期区间 | 自绘筛选栏、把筛选塞进面板表头 |
| 工具条 | 批量动作、导出 | 与主体争视觉重心的主按钮组 |
| 主体 | 列表页是表格；报表页是指标卡加分节 | 列表页铺 KPI 卡、页内大标题 |
| 抽屉 | 抬头字段 → 明细 → 轨迹 → 动作条 | 独立页面、状态页签、分页 |

### 3.3 四类页面骨架的区域划分

| 类型 | 区域序列 | 内容约束 |
| --- | --- | --- |
| `list` | 状态页签 → 筛选条 → 工具条 → 表格 → 分页 | 一页一张表；计数进页签或口径行；列序为「标识 → 对象或来源 → 状态 → 数量或金额 → 时间 → 操作」 |
| `report` | 页头（时间范围、口径、数据截止）→ 指标卡 → 分节 | 唯一允许摆指标的骨架；指标值由数据算 |
| `detail`（抽屉） | 抬头字段网格 → 明细表 → 操作轨迹 → 底部动作条 | 抬头只读；不套页签与分页 |
| `form`（抽屉） | 抬头 → 分组字段 → 底部动作条 | 必填标记随字段声明；危险动作带后果提示 |

### 3.4 31 页的结构归属

| 页 | 类型 | 主区域要点 | 抽屉或表单内容 |
| --- | --- | --- | --- |
| 结算单 | list | 页签「未开票 / 已开票」带计数；工具条「生成结算单」；行内/抽屉审核 / 发送 / 确认 / 完成 / 账单调整 | 抬头 + 账单明细子表 + 审批轨迹 |
| 发票与收款 | list | 页签按收款状态；行内/抽屉「登记收款」 | 发票信息 + 收款记录 + 附件名 |
| 服务目录与报价 | list | 按服务类别筛；行内「改价」 | 报价表单：合同、单位、标准价、最低/最高收费、计费周期、税率、版本、生效起止、适用范围 |
| 货主仓授权 | list | 页签按授权状态；行内「停用」 | 抬头 + 服务范围勾选 + 关联协议 |
| 告警中心 | list | 页签按级别；行内「转工单」「豁免」 | 告警详情 + 对象快照 + 处置记录 |
| 运营日报 | report | 指标卡 5 个 + 按仓对比分节 | 无 |
| 月台预约计划 | list | 页签按预约状态；行内「确认」「取消」 | 预约表单：单据、方向、月台、时段、车牌 |
| 仓容与产能规划 | report | 指标卡 4 个 + 仓维度分节 | 无 |
| 组织架构 | list | 树形缩进列 + 页签按启停 | 组织表单：类型、上级、所属仓、负责人 |
| 审批流配置 | list | 一流程一行，展开看节点 | 编排抽屉：节点序、审批角色、超时转交 |
| 设备利用率 | report | 指标卡 + 设备类型分节 | 无 |
| 维保计划 | list | 页签按到期状态；行内「完成」 | 维保表单：类型、周期、维保方、下次到期 |
| 费用规则 | list | 只读展示计费对象、取数来源、计费单位、计费周期与参考价；行内「查看报价」 | 规则信息 + 报价项目 + 生效期 + 优先级 |
| 费用账单 | list | 页签按账单状态；列含开票状态、差异金额、生成时间；行内「查看」 | 账单头 + 账单明细 + 来源单据 + 规则版本 + 确认/申诉处理/账单调整 |
| 到货预约与月台 | list | 页签按到车状态；行内「确认到车」 | 预约表单：通知单、月台、时段、托盘数 |
| 质检单 | list | 页签按质检结论；行内「验收」「录入结果」 | 验收弹窗：验收数量（必填）、生产日期、批次、计划库位、托盘；质检表单另录抽检数、合格数、缺陷类型、结论 |
| 理货任务 | list | 页签按理货状态；行内「开始」「完成」 | 理货表单：集货位、托盘、理货数量、差异转异常 |
| 越库直发 | list | 页签按配对状态；工具条「配对出库单」 | 配对表单：通知单 + 出库单 + 数量 |
| 打包单 | list | 页签按打包状态；行内「装箱」「称重」 | 装箱表单：箱号、箱型、箱数、重量、体积 |
| 分播播种 | list | 页签按播种状态；行内「结格」 | 两级容器（一次下架容器 → 分拣容器）+ 格口明细 + 差异转异常 |
| 装车发运 | list | 页签按发运状态；行内「装车完成」 | 装车表单：承运商、车牌、件数、重量 |
| 库位容量与 ABC | list | 页签按库位状态；占用率列带色型 | 库位表单：容积、承重、ABC |
| 组套与库内加工 | list | 页签按任务状态；行内「开始」「完成」 | 加工表单：类型、来源商品、产出商品、数量 |
| 冻结与解冻 | list | 页签按冻结状态；行内「申请解冻」 | 冻结表单：范围、数量、原因；解冻走审批 |
| 序列号追踪 | list | 页签按序列号状态；行内「轨迹」 | 轨迹抽屉：入库、移位、出库三段 |
| 盘点差异审批 | list | 页签按审批状态；行内「通过」「驳回」 | 差异明细 + 调整单预览 |
| 任务池与派工 | list | 三态分列；工具条「批量派工」「重派」 | 任务详情 + 设备指令轨迹 |
| 人效与准确率 | report | 指标卡 5 个 + 按班组分节 | 无 |
| 设备监控 | list | 页签按运行状态；状态列独立于任务列 | 设备详情 + 当前任务 + 告警列表 |
| 告警与故障工单 | list | 页签按处理状态；行内「转工单」「恢复」 | 工单表单：故障现象、停机分钟、复盘人 |
| 驱动与协议 | list | 页签按连接状态；行内「测试连接」 | 驱动表单：协议、地址、心跳间隔 |
| AGV 调度策略 | list | 页签按启停；行内「启用」「停用」 | 策略表单：优先级规则、充电阈值、避让区 |
| 异常登记与处置 | list | 页签按处理状态；行内「归责」「审批」 | 异常详情 + 归责 + 处置结论 |

## 4. 字段

### 4.1 命名与数据类型

命名约定：编码类 `xxxNo` / `xxxCode`，状态类 `xxxStatus`，时间类 `xxxAt`，数量 `qty`，金额 `amount`，原因 `reason`；声明为枚举的字段取值必须登记 `references/core/glossary.md`。

| 类型 | 含义 | 示例 |
| --- | --- | --- |
| `string` | 短文本，≤64 字 | 结算单号 `JS20261108001` |
| `text` | 长文本，≤500 字 | 冻结原因、复盘结论 |
| `number` | 数值，展示带单位 | 120（件）、3200.00（元） |
| `enum` | 枚举，取值集中登记 | `taskStatus` = 执行中 |
| `date` | 日期 | 2026-11-08 |
| `datetime` | 日期时间 | 2026-11-08 14:30 |
| `boolean` | 是 / 否 | 是否需审批 |
| `ref` | 外键，指向另一实体编码 | `ownerCode` → 货主主档 |
| `array` | 明细行，指向子表 | 服务范围、账单明细 |

### 4.2 共用字段

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `ownerCode` | 货主，筛选与归属 | ref → 货主主档 | 取值域由注册表 `owners` 给出 |
| `ownerName` | 展示用货主名 | string | 派生自货主主档 |
| `warehouseCode` | 仓，跨仓视图的收窄维度 | ref → 仓库主档 | 单仓端固定本仓，不做筛选 |
| `docNo` | 来源单据号 | string | 悬停显示单据类型 |
| `docType` | 单据类型 | enum | 入库通知单 / 出库订单 / 调拨单 / 盘点单 / 加工单 |
| `status` | 单据状态 | enum | 按单据各自登记，不跨单据共用一套 |
| `sourceNo` | 改账来源单据 | string | P4：库存变化必填 |
| `changeType` | 变动类型 | enum | 收货 / 上架 / 拣货 / 盘点盈亏 / 调整 / 加工耗用 |
| `reason` | 动作原因 | text | P7：冻结、作废、强制完成、改账必填 |
| `operator` | 操作人 | string | 取登录账号 |
| `actedAt` | 动作时间 | datetime | 系统写入 |
| `priority` | 优先级 | enum | 紧急 / 高 / 普通 |

### 4.3 按页字段清单

#### 运营中台管理端

**结算单** `billing/settlement-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `settlementNo` | 结算单号，行标识 | string | 主键，`JS` + 日期 + 序 |
| `ownerCode` | 结算对象 | ref → 货主主档 | 必填 |
| `billType` | 账单类型 | enum | 仓租 / 作业费 / 增值服务 / 混合 |
| `billPeriod` | 计费期间 | string | 年月或日期区间，展示用 |
| `periodStart` / `periodEnd` | 账期起止 | date | 必填，同货主不重叠 |
| `billCount` | 纳入账单张数 | number | 派生自账单明细 |
| `sourceNo` | 费用来源编号 | ref → 作业单据 | 明细逐行回指，对齐 JeeWMS `costSoNo` |
| `currency` | 货币 | enum | 人民币 / 美元；对齐 `costHb` |
| `taxRate` | 税率 | number | 百分数；对齐 `costSl` |
| `amountBeforeTax` | 不含税金额 | number | `amountWithTax / (1 + 税率)`，对齐 `costCoBhsj` |
| `amountWithTax` | 含税金额 | number | 对齐 `costCoYhsj` |
| `amount` | 应收金额 | number | 两位小数，等于明细含税价合计 |
| `invoiceStatus` | 开票状态 | enum | 未开票 / 已开票；页签依据 |
| `settlementStatus` | 结算状态 | enum | 待审核 / 已发送 / 已确认 / 已完成 / 已驳回 |
| `approver` | 当前审批人 | string | 取审批流节点 |
| `createdAt` | 生成时间 | datetime | 系统写入 |

**发票与收款** `billing/invoice-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `invoiceNo` | 发票号 | string | 主键 |
| `settlementNo` | 关联结算单 | ref → 结算单 | 必填 |
| `ownerCode` | 开票对象 | ref → 货主主档 | 必填 |
| `invoiceType` | 发票类型 | enum | 增值税专票 / 普票 / 数电票 |
| `currency` | 货币 | enum | 与结算单一致，不另选 |
| `taxRate` | 税率 | number | 与结算单一致 |
| `amount` | 开票金额 | number | 不超过结算单含税金额 |
| `attachmentName` | 发票附件 | string | 只存文件名与下载入口，对齐 `attr1` |
| `invoicedAt` | 开票日期 | date | 必填 |
| `receivedAmount` | 已收金额 | number | 累加登记，不覆盖 |
| `receiveStatus` | 收款状态 | enum | 待收款 / 部分收款 / 已收款 / 逾期 |
| `dueDate` | 到期日 | date | 逾期判定依据 |

收款记录子表：`receiveNo`、`invoiceNo`、`receiveDate`、`receiveAmount`、`receiveMethod`、`voucherNo`、`operator`；只追加，不退改。

**服务目录与报价** `network/service-catalog`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `itemCode` | 服务项编码 | string | 主键 |
| `itemName` | 服务项名称 | string | 取服务目录项目名称，不另设枚举 |
| `contractNo` | 合同编号 | ref → 仓储服务协议 | 对齐 JeeWMS `contNo`，报价挂在合同下 |
| `category` | 服务类别 | enum | 仓储 / 搬运 / 包装 / 质检 / 加工 / 运输 |
| `unit` | 计费单位 | enum | 件 / 托 / 公斤 / 立方米 / 平方米 / 单 |
| `currency` | 货币 | enum | 人民币 / 美元，对齐 `costHb` |
| `price` | 标准价 | number | 两位小数，价格唯一来源 |
| `minCharge` | 最低收费 | number | 对齐 `costMin`，0 表示不设下限 |
| `maxCharge` | 最高收费 | number | 对齐 `costMax`，0 表示不设上限 |
| `cycle` | 计费周期 | enum | 自然月 / 按天 / 按单 / 按票，对齐 `costPeriod` |
| `taxRate` | 税率 | number | 百分数，出账时快照到账单明细 |
| `owner` | 适用货主 | ref → 货主主档 | 可空，空为通用价 |
| `warehouse` | 适用仓 | ref → 仓库主档 | 可空，空为全网价 |
| `version` | 报价版本 | string | 改价递增，不覆盖 |
| `effectiveFrom` / `validTo` | 有效期 | date | 对齐 `costValidBegin` / `costValidEnd`，只影响下一账期 |
| `itemStatus` | 状态 | enum | 启用 / 停用 |

**货主仓授权** `network/owner-warehouse-auth`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `authNo` | 授权编号 | string | 主键 |
| `ownerCode` | 被授权货主 | ref → 货主主档 | 必填 |
| `warehouseCode` | 授权仓 | ref → 仓库主档 | 必填 |
| `serviceScope` | 可用服务范围 | array | 存储 / 收货 / 发货 / 增值，至少一项 |
| `agreementNo` | 关联服务协议 | ref → 仓储服务协议 | 必填，未签约不授权 |
| `effectiveFrom` / `effectiveTo` | 有效期 | date | 过期自动停用 |
| `status` | 授权状态 | enum | 待生效 / 生效 / 已停用 |

**告警中心** `network/alert-center`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `alertNo` | 告警号 | string | 主键 |
| `alertType` | 告警类型 | enum | 库存 / 时效 / 设备 / SLA |
| `level` | 告警级别 | enum | 紧急 / 重要 / 提示 |
| `warehouseCode` | 发生仓 | ref → 仓库主档 | 必填 |
| `objectRef` | 告警对象 | string | 单据号、设备号或库位号 |
| `raisedAt` | 触发时间 | datetime | 系统写入 |
| `handleStatus` | 处置状态 | enum | 待处理 / 处理中 / 已关闭 / 已豁免 |
| `workOrderNo` | 关联工单 | ref → 故障工单 | 转工单后回填 |

**运营日报** `network/ops-daily`（report）

| 字段 | 用途 | 类型 | 口径 |
| --- | --- | --- | --- |
| `statDate` | 统计日 | date | 页头时间范围的单日 |
| `inboundQty` / `outboundQty` | 出入库量 | number | 按完成单据统计 |
| `stockQty` | 在库量 | number | 日终快照 |
| `exceptionCount` | 未关闭异常 | number | 取差异异常单 |
| `staffEfficiency` | 人均任务量 | number | 任务量 ÷ 出勤人数 |
| `capacityUsage` | 库容利用率 | number | 已用 ÷ 总容量 |

**月台预约计划** `network/dock-schedule`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `appointmentNo` | 预约号 | string | 主键 |
| `warehouseCode` | 预约仓 | ref → 仓库主档 | 必填 |
| `dockCode` | 月台号 | string | 同仓同时段不可重复 |
| `docNo` | 关联单据 | ref → 计划单 | 必填 |
| `direction` | 方向 | enum | 入库 / 出库 |
| `plateNo` | 车牌号 | string | 可空，自送时填 |
| `plannedAt` | 预约到车时间 | datetime | 必填 |
| `arrivedAt` | 实际到车时间 | datetime | 到车登记写入 |
| `status` | 预约状态 | enum | 待确认 / 已确认 / 已到车 / 超时未到 / 已取消 |

**仓容与产能规划** `network/capacity-plan`（report）

| 字段 | 用途 | 类型 | 口径 |
| --- | --- | --- | --- |
| `warehouseCode` | 仓 | ref → 仓库主档 | 一仓一行 |
| `capacityTotal` | 库容总量 | number | 托，取仓库主档 |
| `capacityUsed` | 已用库容 | number | 在库托数 |
| `usageRate` | 利用率 | number | 派生 |
| `dailyInboundAvg` / `dailyOutboundAvg` | 日均出入库 | number | 近 30 日 |
| `peakQty` | 峰值处理量 | number | 近 30 日单日最大 |
| `availableCapacity` | 可用产能 | number | 峰值处理量 − 实际处理量 |

**组织架构** `system/org-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `orgCode` | 组织编码 | string | 主键 |
| `orgName` | 组织名称 | string | 必填 |
| `orgType` | 组织类型 | enum | 运营方 / 仓 |
| `parentCode` | 上级组织 | ref → 本实体 | 根节点为空 |
| `warehouseCode` | 所属仓 | ref → 仓库主档 | 仓级必填 |
| `leader` | 负责人 | string | 关联人员档案 |
| `staffCount` | 人数 | number | 派生 |
| `status` | 状态 | enum | 启用 / 停用 |

**审批流配置** `system/approval-flow`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `flowCode` | 流程编码 | string | 主键 |
| `docType` | 适用单据 | enum | 调拨 / 费用调整 / 盘点盈亏 / 结算 |
| `nodeSeq` | 节点序号 | number | 同流程内唯一，升序 |
| `nodeName` | 节点名称 | string | 必填 |
| `approverRole` | 审批角色 | ref → 角色 | 必填 |
| `timeoutHours` | 超时时限 | number | 超时触发转交 |
| `escalateTo` | 超时转交对象 | ref → 角色 | 可空 |
| `status` | 发布状态 | enum | 草稿 / 已发布 / 已停用 |
| `version` | 版本 | string | 发布递增 |

**设备利用率** `resource/device-utilization`（report）

| 字段 | 用途 | 类型 | 口径 |
| --- | --- | --- | --- |
| `deviceType` | 设备类型 | enum | AGV / 输送线 / 分拣机 / 堆垛机 / 打包机 |
| `warehouseCode` | 仓 | ref → 仓库主档 | 一仓一组 |
| `runHours` | 运行时长 | number | 状态为运行累计 |
| `taskCount` | 任务量 | number | 取任务池 |
| `faultHours` | 故障时长 | number | 取设备告警 |
| `utilizationRate` | 利用率 | number | 运行 ÷ 可运行时长 |

**维保计划** `resource/maintenance-plan`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `planNo` | 维保计划号 | string | 主键 |
| `deviceCode` | 设备 | ref → 设备档案 | 必填 |
| `maintenanceType` | 维保类型 | enum | 例保 / 一级保养 / 维修 / 校准 |
| `cycleDays` | 周期天数 | number | 必填 |
| `nextDueAt` | 下次到期 | datetime | 上次完成 + 周期 |
| `lastDoneAt` | 上次完成 | datetime | 完成动作写入 |
| `vendor` | 维保方 | string | 内修 / 外委 |
| `status` | 状态 | enum | 待执行 / 执行中 / 已完成 / 已逾期 |

**费用规则** / **费用账单**：已启用页，字段取 `docs/数据字典/费用账单.md`。落页时按实读结果补三处：账单主页签「未开票 / 已开票」带计数、行内四步状态链、账单明细带 `sourceNo` 与含税口径；账单状态枚举与货灵ERP 的 `bill-owner-list` 逐字一致。已启用的两页不新增字段文档，改动记在 `费用账单.md` 的字段表。

#### 货灵WMS

**到货预约与月台** `inbound/appointment-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `appointmentNo` | 预约号 | string | 主键，与中台月台预约同一套编码 |
| `inPlanNo` | 关联入库通知单 | ref → 入库通知单 | 必填 |
| `ownerCode` | 货主 | ref → 货主主档 | 必填 |
| `dockCode` | 月台号 | string | 本仓月台，不跨仓 |
| `plateNo` | 车牌号 | string | 可空 |
| `plannedAt` | 预约到货时间 | datetime | 必填 |
| `arrivedAt` | 实际到货时间 | datetime | 到车登记写入 |
| `palletCount` | 托盘数 | number | 用于月台占用估算 |
| `status` | 预约状态 | enum | 待确认 / 已确认 / 已到车 / 超时未到 / 已取消 |

**质检单** `inbound/qc-order`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `qcNo` | 质检单号 | string | 主键 |
| `receivingNo` | 关联收货单 | ref → 收货单 | 必填 |
| `ownerCode` / `skuCode` / `batchNo` | 质检对象 | ref | 三项必填 |
| `receivedQty` | 收货登记数量 | number | 对齐 JeeWMS `goodsQmCount` |
| `acceptedQty` | 验收数量 | number | **必填**，对齐 `goodsWqmCount`；≤ 收货登记数量 |
| `sampleQty` | 抽检数量 | number | ≤ 验收数量 |
| `qualifiedQty` / `defectiveQty` | 合格与不合格数 | number | 之和等于抽检数 |
| `producedAt` | 生产日期 | date | 验收弹窗录入，对齐 `goodsPrdData` |
| `plannedLocationCode` | 计划库位 | ref → 库区库位 | 验收时录入，对齐 `binPlan` |
| `palletNo` | 托盘 | string | 验收时绑定，对齐 `tinId` |
| `defectType` | 缺陷类型 | enum | 外观 / 效期 / 包装 / 标签 / 其它 |
| `conclusion` | 质检结论 | enum | 合格 / 让步接收 / 拒收 / 待复检 |
| `inspector` / `inspectedAt` | 质检员与时间 | string / datetime | 系统写入 |

**理货任务** `inbound/tally-task`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `tallyNo` | 理货单号 | string | 主键 |
| `receivingNo` | 关联收货单 | ref → 收货单 | 必填 |
| `ownerCode` / `skuCode` / `batchNo` | 理货对象 | ref | 三项必填 |
| `stageLocationCode` | 集货位 | ref → 库区库位 | 理货暂存位 |
| `palletNo` | 托盘号 | string | 码盘后生成 |
| `tallyQty` | 理货数量 | number | 与收货数差异转异常 |
| `tallyStatus` | 理货状态 | enum | 待理货 / 理货中 / 已码盘 / 已转上架 |
| `operator` / `actedAt` | 操作人与时间 | string / datetime | 系统写入 |

**越库直发** `inbound/crossdock-task`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `crossdockNo` | 越库单号 | string | 主键 |
| `inPlanNo` / `outPlanNo` | 配对的两端单据 | ref | 两端货主与商品须一致 |
| `ownerCode` / `skuCode` | 直发对象 | ref | 必填 |
| `qty` | 直发数量 | number | ≤ min(入库数, 出库数) |
| `dockCode` | 越库月台 | string | 必填 |
| `status` | 状态 | enum | 待配对 / 已配对 / 执行中 / 已完成 / 已取消 |

**打包单** `outbound/packing-order`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `packingNo` | 打包单号 | string | 主键 |
| `obNo` | 出库订单 | ref → 出库订单 | 必填 |
| `cartonNo` | 箱号 | string | 对齐 JeeWMS `WmCartonNumber`，一单多箱时每箱一号 |
| `boxType` | 箱型 | enum | 小 / 中 / 大 / 异形 |
| `boxCount` | 箱数 | number | ≥1 |
| `weight` / `volume` | 称重重量与体积 | number | 装车配载依据 |
| `packer` / `packedAt` | 打包人与时间 | string / datetime | 系统写入 |
| `status` | 状态 | enum | 待打包 / 打包中 / 已完成 / 已作废 |

**分播播种** `outbound/sort-task`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `sortNo` | 播种任务号 | string | 主键 |
| `waveNo` | 波次 | ref → 波次计划 | 必填，对齐 `waveId` |
| `stationCode` | 工作站 | ref → 工作站 | 必填 |
| `firstContainerNo` | 一次下架容器 | string | 对齐 JeeWMS `firstRq`，波次拣货时的来料容器 |
| `secondContainerNo` | 分拣容器 | string | 对齐 `secondRq`，分播后落入的容器 |
| `gridCode` | 播种格口号 | string | 绑定周转箱后占用 |
| `containerNo` | 周转箱号 | string | 与格口一对一绑定 |
| `barcode` | 商品条码 | string | 对齐 `shpTiaoMa`，扫 SKU 校验用 |
| `orderCount` | 覆盖订单数 | number | 派生，波次拣货单的订单总数 |
| `pickedQty` | 已播数量 | number | 逐格累加，对齐总拣数量 |
| `status` | 状态 | enum | 待绑定 / 待拣 / 已拣待确认 / 已完成 / 有差异 |

**装车发运** `outbound/loading-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `loadingNo` | 装车单号 | string | 主键 |
| `carrierCode` | 承运商 | ref → 承运商主档 | 必填 |
| `plateNo` | 车牌号 | string | 必填 |
| `dockCode` | 装车月台 | string | 对齐 JeeWMS `omPlatNo`，同仓月台不重复占用 |
| `handoverNo` | 关联交接单 | ref → 交接单 | 装车完成才可交接 |
| `packageCount` / `weight` | 件数与重量 | number | 与打包单合计一致 |
| `loadedAt` | 发运时间 | datetime | 完成动作写入 |
| `status` | 状态 | enum | 待装车 / 装车中 / 已发运 / 已取消 |

**库位容量与 ABC** `warehouse/location-capacity`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `locationCode` | 库位编码 | ref → 库区库位 | 主键 |
| `maxVolume` / `maxWeight` | 容积与承重上限 | number | 上架校验依据 |
| `abcClass` | ABC 分类 | enum | A / B / C |
| `currentVolume` | 当前占用 | number | 派生自库存 |
| `usageRate` | 使用率 | number | 派生，超 90% 标警 |
| `status` | 库位状态 | enum | 可用 / 占用 / 锁定 / 禁用 |

**组套与库内加工** `warehouse/kitting-task`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `taskNo` | 加工任务号 | string | 主键 |
| `taskType` | 加工类型 | enum | 组套 / 拆套 / 换标 / 贴标 / 返工 |
| `ownerCode` | 货主 | ref → 货主主档 | 必填 |
| `srcSkuCode` / `destSkuCode` | 耗用与产出商品 | ref → 商品主档 | 拆套时产出可多行 |
| `qty` / `consumeQty` | 产出与耗用数量 | number | 按加工比例校验 |
| `teamCode` | 执行班组 | ref → 班组档案 | 必填 |
| `status` | 状态 | enum | 待执行 / 执行中 / 已完成 / 已取消 |

**冻结与解冻** `warehouse/freeze-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `freezeNo` | 冻结单号 | string | 主键 |
| `ownerCode` / `skuCode` / `batchNo` / `locationCode` | 冻结范围 | ref | 至少一项，范围越窄越优先 |
| `freezeQty` | 冻结数量 | number | 不超过可用库存 |
| `reasonType` | 冻结原因 | enum | 质检待定 / 客诉 / 盘点锁定 / 效期 / 其它 |
| `reason` | 原因说明 | text | P7：必填 |
| `status` | 状态 | enum | 冻结中 / 已解冻 / 已作废 |

**序列号追踪** `inventory/serial-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `sn` | 序列号 | string | 主键，全仓唯一 |
| `skuCode` / `ownerCode` / `batchNo` | 归属 | ref | 必填 |
| `locationCode` | 当前库位 | ref → 库区库位 | 在库时必填 |
| `status` | 状态 | enum | 在库 / 已出库 / 锁定 / 损坏 |
| `inDocNo` / `outDocNo` | 入库与出库来源 | ref | 至少一个非空 |
| `lastMoveAt` | 最近变动 | datetime | 系统写入 |

**盘点差异审批** `inventory/count-diff-audit`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `diffNo` | 差异号 | string | 主键 |
| `countNo` | 盘点单 | ref → 盘点单 | 必填 |
| `ownerCode` / `skuCode` / `batchNo` / `locationCode` | 差异对象 | ref | 必填 |
| `bookQty` / `actualQty` | 账面数与实盘数 | number | 必填 |
| `diffQty` | 差异数 | number | 派生，实盘 − 账面 |
| `diffType` | 差异类型 | enum | 盘盈 / 盘亏 / 串货 / 批次不符 |
| `approveStatus` | 审批状态 | enum | 待审批 / 已通过 / 已驳回 |
| `adjustNo` | 生成调整单 | ref → 库存调整任务 | 通过后回填，改账唯一出口 |

**任务池与派工** `task/task-pool`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `taskNo` | 任务号 | string | 主键 |
| `taskType` | 任务类型 | enum | 收货 / 理货 / 上架 / 拣货 / 复核 / 打包 / 装车 / 盘点 / 移库 / 加工 |
| `docNo` | 来源单据 | ref | 必填 |
| `taskStatus` | 任务态 | enum | 待派 / 已派 / 执行中 / 已完成 / 已取消 |
| `deviceStatus` | 设备态 | enum | 待下发 / 已下发 / 执行中 / 失败；人工任务为空 |
| `assignee` | 执行对象 | string | 人员或设备编号 |
| `priority` | 优先级 | enum | 紧急 / 高 / 普通 |
| `retryCount` | 重派次数 | number | 失败自动累加 |
| `plannedAt` / `startedAt` / `finishedAt` | 计划与实际时间 | datetime | 超时判定 |

**人效与准确率** `task/staff-performance`（report）

| 字段 | 用途 | 类型 | 口径 |
| --- | --- | --- | --- |
| `staffNo` / `teamCode` / `shiftCode` | 统计维度 | ref | 人、班组、班次 |
| `taskCount` | 完成任务量 | number | 取任务池已完成 |
| `avgMinutes` | 平均耗时 | number | 完成时间减开始时间 |
| `errorCount` | 差错数 | number | 取异常单归责本仓且关联该人 |
| `accuracyRate` | 准确率 | number | 1 − 差错 ÷ 任务量 |

**设备监控** `resource/device-monitor`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `deviceCode` | 设备编号 | ref → 设备档案 | 主键 |
| `deviceType` | 设备类型 | enum | AGV / 输送线 / 分拣机 / 堆垛机 / 打包机 |
| `runStatus` | 运行状态 | enum | 运行 / 空闲 / 故障 / 离线 |
| `currentTaskNo` | 当前任务 | ref → 任务池 | 空闲为空 |
| `batteryLevel` | 电量 | number | 仅 AGV，低于阈值标警 |
| `lastHeartbeatAt` | 最后心跳 | datetime | 超 60 秒判离线 |
| `alarmCount` | 未关闭告警 | number | 派生 |

**告警与故障工单** `resource/device-alarm`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `alarmNo` | 告警号 | string | 主键 |
| `deviceCode` | 设备 | ref → 设备档案 | 必填 |
| `alarmLevel` | 级别 | enum | 紧急 / 重要 / 提示 |
| `alarmCode` | 告警码 | string | 设备回传原文 |
| `raisedAt` | 触发时间 | datetime | 系统写入 |
| `handleStatus` | 处理状态 | enum | 待处理 / 处理中 / 已恢复 / 已转工单 |
| `downMinutes` | 停机分钟 | number | 恢复时计算 |
| `reviewer` / `reviewAt` | 复盘人与时间 | string / datetime | 紧急告警必填 |

**驱动与协议** `resource/device-driver`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `driverCode` | 驱动编号 | string | 主键 |
| `deviceType` | 适用设备类型 | enum | AGV / 输送线 / 分拣机 / 堆垛机 / 拣选灯 |
| `protocol` | 协议 | enum | HTTP / TCP / Modbus / OPC UA / MQTT |
| `endpoint` | 地址 | string | 服务地址 + 端口，对应统一设备契约 |
| `heartbeatSeconds` | 心跳间隔 | number | 10~300 秒 |
| `connectStatus` | 连接状态 | enum | 已连接 / 连接失败 / 未启用 |
| `lastTestAt` | 最近测试 | datetime | 测试动作写入 |

**AGV 调度策略** `resource/agv-strategy`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `strategyCode` | 策略编号 | string | 主键 |
| `warehouseCode` | 适用仓 | ref → 仓库主档 | 必填 |
| `priorityRule` | 任务优先级规则 | enum | 先到先做 / 紧急优先 / 就近分配 |
| `chargeThreshold` | 电量充电阈值 | number | 百分比，10~50 |
| `chargeIdleMinutes` | 空闲充电等待 | number | 分钟 |
| `avoidZone` | 避让区域 | string | 库区编码，多值逗号分隔 |
| `maxTaskPerRobot` | 单机并发任务数 | number | 1~3 |
| `status` | 状态 | enum | 启用 / 停用 |

**异常登记与处置** `warehouse/exception-list`

| 字段 | 用途 | 类型 | 取值 / 约束 |
| --- | --- | --- | --- |
| `exceptionNo` | 异常号 | string | 主键，复用差异异常单 |
| `exceptionType` | 异常类型 | enum | 短缺 / 破损 / 批次不符 / 任务阻塞 / 串货 |
| `sourceNo` | 来源单据 | ref | 必填 |
| `ownerCode` / `skuCode` | 涉及对象 | ref | 短缺类必填 |
| `qty` | 差异数量 | number | 任务阻塞类为空 |
| `responsibility` | 归责方 | enum | 货主 / 仓库 / 承运商 / 平台 |
| `handleStatus` | 处理状态 | enum | 待归责 / 待审批 / 已处置 / 已关闭 |
| `slaHours` | 处理时限 | number | 超时升级 |
| `handleResult` | 处置结论 | enum | 补货 / 赔付 / 调整库存 / 无责关闭 |

### 4.4 枚举清单

同一枚举跨页跨端只用一套取值，落页前登记 `references/core/glossary.md`。

| 枚举 | 取值 | 出现页 |
| --- | --- | --- |
| 任务态 `taskStatus` | 待派 / 已派 / 执行中 / 已完成 / 已取消 | 任务池、人效、设备监控 |
| 设备态 `deviceStatus` | 待下发 / 已下发 / 执行中 / 失败 | 任务池、设备监控 |
| 设备运行态 `runStatus` | 运行 / 空闲 / 故障 / 离线 | 设备利用率、设备监控 |
| 告警级别 `level` | 紧急 / 重要 / 提示 | 告警中心、告警与故障工单 |
| 异常类型 `exceptionType` | 短缺 / 破损 / 批次不符 / 任务阻塞 / 串货 | 异常登记、盘点差异 |
| 归责方 `responsibility` | 货主 / 仓库 / 承运商 / 平台 | 异常登记 |
| 结算状态 `status` | 待审核 / 已发送 / 已确认 / 已完成 / 已驳回 | 结算单、发票与收款（对齐 JeeWMS 账单审核→发送→确认→完成） |
| 开票状态 `invoiceStatus` | 未开票 / 已开票 | 结算单、发票与收款（对齐账单主页签，页签带计数） |
| 货币 `currency` | 人民币 / 美元 | 服务目录与报价、结算单、发票与收款 |
| 计费周期 `billingCycle` | 日 / 月 / 次 | 服务目录与报价、费用规则 |
| 账单类型 `billType` | 仓租 / 作业费 / 增值服务 / 混合 | 结算单、费用账单 |
| 收款状态 `receiveStatus` | 未收 / 部分收 / 已结清 / 逾期 | 发票与收款 |
| 质检结论 `conclusion` | 合格 / 让步接收 / 拒收 / 待复检 | 质检单 |
| 理货状态 `tallyStatus` | 待理货 / 理货中 / 已码盘 / 已转上架 | 理货任务 |
| 加工类型 `taskType` | 组套 / 拆套 / 换标 / 贴标 / 返工 | 组套与库内加工 |
| 冻结原因 `reasonType` | 质检待定 / 客诉 / 盘点锁定 / 效期 / 其它 | 冻结与解冻 |
| 预约状态 `status` | 待确认 / 已确认 / 已到车 / 超时未到 / 已取消 | 月台预约计划、到货预约 |
| 播种状态 `status` | 待绑定 / 待拣 / 已拣待确认 / 已完成 / 有差异 | 分播播种 |
| 协议 `protocol` | HTTP / TCP / Modbus / OPC UA / MQTT | 驱动与协议 |

### 4.5 与数据字典的关系

本文件是设计期清单，不替代字典。落页前按下列口径登记，冲突以字典为准。

- **直接复用已有实体**：入库通知单、出库订单、库区库位、设备档案、容器档案、执行单元档案、班组档案、人员档案、排班档案、费用账单、差异异常单、盘点计划、库存台账。
- **在已有实体上扩字段**：库区库位补 `maxVolume`、`maxWeight`、`abcClass`；设备档案补 `deviceType`、`lastHeartbeatAt`、`connectStatus`；入库通知单补 `appointmentNo`；出库订单补 `packingNo`、`loadingNo`；容器档案补 `containerNo`（周转箱）与 LPN 绑定关系。
- **需新建实体**：结算单、发票与收款、服务目录与报价、货主仓授权、告警、运营日报指标、月台预约、仓容与产能、组织、审批流、设备运行指标、维保计划、质检单、理货单、越库任务、打包单、分播任务、装车单、加工任务、冻结单、序列号、盘点差异、任务池任务、人效指标、设备告警、故障工单、设备驱动、AGV 调度策略。
- **不单建实体**：到货预约与月台复用「月台预约」（同一套 `appointmentNo`）；库位容量、设备监控、驱动与协议在已有字典上扩字段；异常登记与处置复用「差异异常单」；`report` 页的指标口径随其实体文档登记，不另建指标字典。
- **份数不在本文件定死**：按一实体一文档粒度合并后由 A 批登记字典时逐页确认，本文件只给页面到实体的对应关系；此前写「19 个」与清单不符，已撤销。

## 5. 功能架构与增量清单

### 5.1 取舍判据

1. **单实例单主体**：不画租户切换、平台运营后台、套餐订阅；JeeWMS 的 `TenantList` 与 OpenWES 的多租户架构都排除。
2. **端即交付单元**：中台管服务关系与仓网，不下沉库内作业；WMS 把 WES 的任务编排与 WCS 的设备控制收在同一端，用段隔开，不新增端。
3. **只画可演示的交互**：算法只画参数、规则与结果，不画求解过程。
4. **货主是筛选维度**：设备、容器、库位不分货主；库存、单据、账单按货主筛选。

### 5.2 运营中台管理端：五域十二段

| 域 | 回答的问题 | 现有页面 | 本方案增量 |
| --- | --- | --- | --- |
| 服务关系 | 服务谁、服务什么、多少钱 | 货主档案、货主组、承运商、时效协议、协议审核 | 货主仓授权、服务目录与报价 |
| 仓网资源 | 有哪些仓、多少产能、多少设备 | 仓库档案、设备档案、设备调拨、容器档案 | 仓容与产能规划、设备利用率、维保计划 |
| 作业协同 | 今天哪里卡住了 | 仓网总览、计划单确认、跨仓调拨 | 告警中心、运营日报、月台预约计划 |
| 结算 | 该收多少、收没收回来 | 软件服务费 | 费用规则、费用账单、结算单、发票与收款 |
| 运营治理 | 谁在用、怎么用 | 商城 8 页、ERP 运营 5 页、账号角色日志、字典 | 组织架构、审批流配置 |

### 5.3 货灵WMS：四层两线

| 层 | 现有页面 | 本方案增量 |
| --- | --- | --- |
| 任务层 | 作业任务、作业看板、单据总览 | 任务池与派工、人效与准确率 |
| 单据层 | 入库通知、收货、上架；出库订单、波次、拣货、复核、交接；库位、移库、盘点、补货 | 到货预约、质检单、理货任务、越库直发、打包单、分播播种、装车发运、库位容量、组套加工、冻结解冻、差异审批 |
| 账实层 | 库存、批次效期、仓位库存、日清、初始库存、调整、快照 | 序列号追踪 |
| 设备层 | 设备、容器、执行单元 | 设备监控、告警与故障工单、驱动与协议、AGV 调度策略 |
| 贯穿线 · 策略 | 策略管理、工序编排、任务中心策略 | 不增页，挂在上架单、波次计划等触发页 |
| 贯穿线 · 异常 | 无 | 异常登记与处置 |

### 5.4 增量清单

证据列：A 为仓库文件原文，B 为 README 自述，C 为目录名或服务名推断。

| # | 端 | 模块 | 页 key | 页名（拟） | 类型 | 对标来源 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | network-app | billing | `settlement-list` | 结算单 | list | A · JeeWMS `bms/BmsBillHList`（页签/状态链实读）、`bms/subTables/BmsBillISubTable`（含税口径）、`jee/Statement`（对账单） |
| 2 | network-app | billing | `invoice-list` | 发票与收款 | list | A · JeeWMS `bms/BmsInvoiceList`、`BmsPaymentList`、`BmsFiCompanyList`；账单页「开票」动作 |
| 3 | network-app | network | `service-catalog` | 服务目录与报价 | list | A · JeeWMS `erp/baseInfo/BasePriceList`、`bms/BmsCostRuleHList`（合同/最低最高收费/周期/有效期实读） |
| 4 | network-app | network | `owner-warehouse-auth` | 货主仓授权 | list | A · JeeWMS `jee/MdCusList`、`BaKehushuxingList`、`BaKehuzhuangtaiList` |
| 5 | network-app | network | `alert-center` | 告警中心 | list | A · OpenWCS `notification` 的 `/alerts`；B · JeeWMS 效期预警 |
| 6 | network-app | network | `ops-daily` | 运营日报 | report | A · JeeWMS `views/bi`、`dashboard`、`BiVisualConfigList`；B · 多货主看板 |
| 7 | network-app | network | `dock-schedule` | 月台预约计划 | list | A · JeeWMS `TmsYwWindList`（装车单）、`TmsYwCarList`（车辆） |
| 8 | network-app | network | `capacity-plan` | 仓容与产能规划 | report | A · JeeWMS `jee/BaKwList`、`PositionsFigure`（库位图）；B · 仓位使用率 |
| 9 | network-app | system | `org-list` | 组织架构 | list | A · JeeWMS `system/DepartList`、`SysPositionList`、`erp/baseInfo/BaseOrganizationList` |
| 10 | network-app | system | `approval-flow` | 审批流配置 | list | A · JeeWMS `views/activiti`、`system/PermissionDataRuleList`（B 级迁移：流程模型 ≠ 审批节点） |
| 11 | network-app | resource | `device-utilization` | 设备利用率 | report | C · JeeWMS AGV 调度模拟（README）与 OpenWCS 设备遥测，无现成页面 |
| 12 | network-app | resource | `maintenance-plan` | 维保计划 | list | C · OpenWCS 无维保模块，按通用设计 |
| 13 | network-app | billing | `rate-list` | 费用规则 | list | 启用，已有源 |
| 14 | network-app | billing | `bill-list` | 费用账单 | list | 启用，已有源 |
| 15 | warehouse-app | inbound | `appointment-list` | 到货预约与月台 | list | A · JeeWMS `TmsYwDingdanList`；OpenWES `workflow` 收货第一步选工作站 |
| 16 | warehouse-app | inbound | `qc-order` | 质检单 | list | A · JeeWMS `jee/BaQmQaList`、`BaQmStaList`、`WmReturnAcceptList`（实为收货验收，弹窗必填验收数量 + 计划库位 + 托盘）；OpenWES `Quality Control` |
| 17 | warehouse-app | inbound | `tally-task` | 理货任务 | list | A · JeeWMS README 流程原句「入库、理货、上架」 |
| 18 | warehouse-app | inbound | `crossdock-task` | 越库直发 | list | A · OpenWES `Cross-Docking` |
| 19 | warehouse-app | outbound | `packing-order` | 打包单 | list | A · JeeWMS `jee/WmCartonNumberList`、README「称重」；OpenWES `Packing Optimization` |
| 20 | warehouse-app | outbound | `sort-task` | 分播播种 | list | A · OpenWES `workflow` 拣货六步（播种墙、周转箱绑定、格口三色）；JeeWMS `WaveToDownList` 两级容器 `firstRq`/`secondRq` |
| 21 | warehouse-app | outbound | `loading-list` | 装车发运 | list | A · JeeWMS `TmsYwWindList`、`TmsYwCarList` |
| 22 | warehouse-app | warehouse | `location-capacity` | 库位容量与 ABC | list | A · JeeWMS `BaKwList`、`PositionsFigure`；C · 容积与承重字段 |
| 23 | warehouse-app | warehouse | `kitting-task` | 组套与库内加工 | list | A · JeeWMS `BaPronutMethodList`、`BaPronutTypeList`（加工方式与类型） |
| 24 | warehouse-app | warehouse | `freeze-list` | 冻结与解冻 | list | A · OpenWES `Quarantine Management`（扣留与放行） |
| 25 | warehouse-app | inventory | `serial-list` | 序列号追踪 | list | A · JeeWMS `BaSnroList`、`BaSnroTypeList`；OpenWES `Lot/Serial Tracking` |
| 26 | warehouse-app | inventory | `count-diff-audit` | 盘点差异审批 | list | A · OpenWCS `counting`（盲盘、容差内自动批准、`StockAdjusted`） |
| 27 | warehouse-app | task | `task-pool` | 任务池与派工 | list | A · OpenWES `Task Orchestration`；OpenWCS `process-designer` 任务库 |
| 28 | warehouse-app | task | `staff-performance` | 人效与准确率 | report | A · OpenWES `Performance Tracking`、`Performance Analytics` |
| 29 | warehouse-app | resource | `device-monitor` | 设备监控 | list | A · OpenWCS UI 硬件孪生、`equipment-emulator` 遥测 |
| 30 | warehouse-app | resource | `device-alarm` | 告警与故障工单 | list | A · OpenWCS `/alerts`、`/alerts/{id}/ack`、andon 安灯墙 |
| 31 | warehouse-app | resource | `device-driver` | 驱动与协议 | list | A · OpenWCS 统一设备契约 `POST /tasks` + `/healthz` + `/readyz` |
| 32 | warehouse-app | resource | `agv-strategy` | AGV 调度策略 | list | A（适配器）· OpenWCS `amr-geekplus`；C（策略字段） |
| 33 | warehouse-app | warehouse | `exception-list` | 异常登记与处置 | list | A · OpenWES `Exception Handling`；B · JeeWMS 差异处理 |

新增 31 页，另启用 `billing` 两页。

## 6. 关键交互模式

### 6.1 任务池到回传

三态并列是这条链的前提：`taskStatus`（待派 / 已派 / 执行中 / 已完成 / 已取消）、`deviceStatus`（待下发 / 已下发 / 执行中 / 失败）、单据态跟随来源单据。派工后任务进 PDA 或工作站，结果回传任务池；失败可重派，重派累加 `retryCount`，超阈值转异常。设备任务走 OpenWCS 那套统一契约：下发 `POST /tasks`，健康检查 `/healthz`、`/readyz`，失败原因回写告警。

### 6.2 工作站（按 OpenWES 原文）

拣货工作站分六步：

1. 登录选工作站，确认。
2. 进主操作界面，选「拣货」。
3. 任务详情显示库位码与待拣数量；播种墙格口显示蓝色，表示需绑定周转箱。
4. 扫格口号（如 1），再扫周转箱号（如 Z000003）；绑定成功格口转白。
5. 扫 SKU 条码，系统校验有效后格口转绿；点绿色格口确认该 SKU 已拣。
6. 该格口全部拣完，格口转蓝；点蓝色格口或熄灭播种灯确认订单完成，格口回白，进入下一单。

颜色即状态，不另加文字说明。收货工作站同理：扫 LPN → 校验客户与存储类型 → 扫 SKU 与数量 → 扫库位 → 满箱（`Full Box`）→ 生成收货明细。

JeeWMS 的 `WaveToDownList` 补上了两级容器：「一次下架容器 `firstRq`」是波次拣货的来料容器，「分拣容器 `secondRq`」是分播后的落点。所以分播播种页先显示一次下架容器，再按格口绑定到分拣容器/周转箱；第 4.3 节的 `firstContainerNo` 与 `secondContainerNo` 由此而来。波次打印单含订单总数、总拣数量、仓位、商品条码、应检数量，与这里的 `orderCount`、`pickedQty`、`barcode` 对得上。人工仓不用这两个工作站，但页面保留——同一端要能表达两种仓型。

### 6.3 设备监控与告警

监控以列表为主视图，运行状态只用四种：运行、空闲、故障、离线。地图或 3D 视图是同页第二视图，不单独开页；OpenWCS 的做法是按实时状态着色（绿正常 / 橙堵塞 / 红故障），可作参照但不要求画到设备级动画。告警从监控进，处置完回监控；告警状态为待处理 / 处理中 / 已恢复 / 已转工单，恢复时计停机分钟。告警不能直接改库存，改账只走盘点差异或异常审批。

### 6.4 计费链路

按 JeeWMS 的 bms 四段落地：**配置**（费用类型、费用来源、计费规则、费用项目）→ **计费**（费用明细）→ **出账**（账单、账单配置）→ **结算**（结算类型、财务主体、收付款、发票）。

实读 `BmsBillHList` 后补两条：

- **账单页签按账单状态，结算单页签按开票状态**：费用账单按待确认 / 已申诉 / 已确认 / 已关闭分组，运营方看处置队列；结算单按未开票 / 已开票分组，财务看开票队列。两页都用「计数进页签、详情进抽屉」。
- **动作链**：费用账单有确认、申诉处理、账单调整；结算单有审核 → 发送 → 确认 → 完成，另有账单调整；发票有登记收款。结算单的 `settlementStatus` 取「待审核 / 已发送 / 已确认 / 已完成 / 已驳回」。

计费规则主表实读后补：报价挂在**合同编号**下，带最低收费、最高收费、计费周期与有效开始/结束时间；账单明细逐行带**来源编号**、税率、货币、不含税价与含税价。服务目录与报价是价格唯一来源，费用规则只引用 `itemCode` 并展示参考价，改价归服务目录。中台看全量，货灵ERP 只看本货主，两端状态枚举逐字一致。规则变更不追溯已出账单，账单明细保留出账时的规则版本与单价快照。

### 6.5 异常闭环

登记 → 归责 → 审批 → 库存或费用调整 → 复盘。异常单是唯一能绕过正常单据改账的入口，必须留审批。

## 7. 侧栏重排

### 7.1 运营中台管理端：10 段 → 12 段，40 → 54 页

| 段 | 页数 | 变化 |
| --- | --- | --- |
| 总览 | 3 | 加告警中心、运营日报 |
| 仓网档案 | 3 | 移出服务类页面，加仓容与产能规划 |
| 服务关系 | 5 | 新增段：货主、货主组、货主仓授权、服务目录、时效协议 |
| 仓网调度 | 4 | 加月台预约计划 |
| 库存 | 7 | 不变 |
| 商品 | 2 | 不变 |
| 作业资源 | 5 | 加设备利用率、维保计划 |
| 商城 | 8 | 不变 |
| ERP 运营 | 5 | 不变 |
| 账号与权限 | 5 | 加组织架构、审批流配置 |
| 计费结算 | 5 | 新增段：费用规则、费用账单、结算单、发票与收款、协议审核 |
| 服务与设置 | 2 | 协议审核移出，留软件服务费与字典 |

### 7.2 货灵WMS：8 段 → 11 段，32 → 51 页

| 段 | 页数 | 变化 |
| --- | --- | --- |
| 任务中心 | 4 | 加任务池与派工 |
| 入库管理 | 7 | 加到货预约、质检单、理货任务、越库直发 |
| 出库管理 | 4 | 拣货与复核留本段 |
| 发货作业 | 4 | 新增段：打包、分播播种、装车发运、交接 |
| 库内作业 | 6 | 库位、容量、移库、补货、组套加工、冻结 |
| 盘点与异常 | 5 | 盘点计划、盘点单、差异审批、库存调整、异常登记 |
| 库存中心 | 6 | 批次、仓位库存、序列号、日清、初始库存、快照 |
| 设备与容器 | 7 | 新增段：容器、设备、执行单元、监控、告警、驱动、AGV 策略 |
| 人员与班次 | 4 | 新增段：班组、人员、排班、人效 |
| 作业配置 | 3 | 不变 |
| 基础资料 | 1 | 不变 |

出货侧拆成「出库管理」与「发货作业」两段，是把拣选（找货）与发货（凑单、装箱、装车）分开；干这两件事的不是同一批人。

## 8. 跨端联动评估

按 `.codebuddy/rules/跨端联动确认/RULE.mdc` 的「清单怎么写」一节填。本表给清单，确认后才改源。

| 端 | 落点 | 联动点 | 结论 |
| --- | --- | --- | --- |
| network-app | `billing/rate-list`、`bill-list` 补 `app` | `billing` 首次进端；与 `erp-app` 的 `rate-owner-list`、`bill-owner-list` 同域 | 必须同改：账单状态枚举与金额口径逐字一致 |
| network-app | 新增 12 页，`nav` 10 → 12 段 | 首栏归并、面板分段、协议审核换段 | 必须同改：漏页无入口 |
| warehouse-app | 新增 19 页，`nav` 8 → 11 段 | 作业资源拆两段，交接单换段 | 必须同改 |
| `shared/modules.json` | 31 条页面、`billing` 两页 `app`、两处 `nav` | 五端装配 | 必须同改：全部端重建 |
| `shared/data/` | 设备主档补 `deviceType` 枚举值、`lastHeartbeatAt`、`connectStatus`；库位主档补 `maxVolume`、`maxWeight`、`abcClass`；容器主档补 `containerNo` | 引用设备的页：中台设备档案、设备调拨、设备利用率、维保；WMS 设备、执行单元、监控、告警、驱动、AGV 策略；PDA 我的设备 | 必须同改：字段增删顺引用传到三个端 |
| `inbound` / `outbound` / `warehouse` / `inventory` | 新增页与 `erp-app` 同域页 | 只核对列名与状态不冲突，不复用同名列 | 无需改：ERP 页只读本货主数据 |
| `task` | 新增 `task-pool`、`staff-performance` 归 `warehouse-app` | `pda-app` 任务列表仍走 `pda-*` 页 | 无需改：PDA 数据独立 |
| `system` | 新增 `org-list`、`approval-flow` | 该模块四页全归 `network-app` | 无需改：不涉及其它端 |
| 实现层 `ui.mjs` / `implementation.md` | 新增页只复用现有组件与 `live` 配置 | 不新增骨架类型，不新增 `data-*` 属性 | 无需改：无新组件与新契约 |
| 文案 | 31 个页名、约 55 个列名、19 组枚举 | 先登 `references/core/glossary.md` | 必须同改：未登记会被构建期拦下 |
| 各 `module.json` | 9 个模块 | `version` 递增与交付状态 | 必须同改 |
| 数据字典 | 新实体按第 4.5 节清单一页一核、5 处扩字段 | 见第 4.5 节；含税口径、合同、来源编号、验收数量、两级容器等新增字段 | 必须同改：先登记字段再落页 |

**需重建的产物**：五端全建。

**不同步的影响**：A 组构建与死链（31 页须可达）、A 组货主筛选、B 组文案（逐字比对 glossary）、B 组壳层（不得出现统计卡与大标题）、C 组已登记缺口不变。

## 9. 分批实施

| 批 | 内容 | 前置 | 完成判据 |
| --- | --- | --- | --- |
| A 文案与装配 | 31 个页名、约 55 个列名、19 组枚举登 glossary；新实体按第 4.5 节清单一页一核、5 处扩字段进字典；注册表加 31 条、`billing` 两页补 `app`、两处 `nav` 改写 | 本文件确认 | 构建通过，侧栏出现新段 |
| B 中台 14 落点 | 12 页新建源与数据，2 页启用；计费四段先通 | A | 中台 54 页，计费链路可点 |
| C WMS 单据与账实 12 页 | 预约到差异审批；理货与异常串通 | A | 单据层闭环，差异可审批 |
| D WMS 任务与设备 7 页 | 任务池、人效、监控、告警、驱动、AGV 策略、异常 | C | 三态可筛，告警可转工单 |
| E 收尾 | 五端重建、全量验收、9 个 `module.json` 交付字段 | B/C/D | 全量验收零违规 |

## 10. 未纳入与理由

| 能力 | 依据 | 不纳入原因 |
| --- | --- | --- |
| 租户管理 | JeeWMS `system/TenantList.vue`；OpenWES `Multi-Tenant Architecture` | 与单实例单主体冲突 |
| BPMN 流程引擎 | OpenWCS `process-engine`、`process-designer` | 货灵WMS 的工序编排已由 `workflow-list` 承担，不引入 BPMN 建模器 |
| 路径规划与任务分配算法 | OpenWES `Pick Path Optimization` | 只画参数与结果，求解属实现层 |
| RFID、PLC、硬件驱动实现 | OpenWCS `adapters/*`、`equipment-emulator` | 只画驱动配置与连接测试，不画协议实现与仿真 |
| 计费公式引擎 | JeeWMS `BmsCostRuleHListBatch` | 只画规则与账单，计价表达式属实现层 |
| 组套 BOM 维护 | JeeWMS `BaPronutTypeList` | 只画加工任务与耗用，不画 BOM 维护 |
| AI 助手 | OpenWCS `services/assistant` | 与本次两端功能无关 |
| 退货链五页 | JeeWMS `WmReturnNoticeH/I`、`WmReturnClientH/I`、`WmReturnPutaway`（`WmReturnAcceptList` 实为收货验收，不计入） | 源头在货灵ERP 退货申请单与售后入库计划单，仓内落成一张入库通知单，不另建退货单体系 |
| 冷链温控 | JeeWMS `WmWenduList` | 冷链业务前提未定，纳入前需先定温区与温度记录口径 |
| 黑白件名单 | JeeWMS `WmsBlackWhitePieceList` | 属货主侧风控策略，不在仓内端 |
| 平台出入库对接 | JeeWMS `WmPlatIoList`、`WmPlatIoMList` | 平台对接在货灵ERP 的平台适配器，仓内只收执行单 |
| 托盘管理单页 | JeeWMS `WmTuopanList` | 由容器档案承载，不单开页 |

## 11. 三层一致性自检

1. **字段有出口**：字段清单里每个字段都能在列表列、抽屉字段或指标卡上找到位置；查不到就删。
2. **列有出处**：页面每一列都来自第 4 节；派生列必须是纯函数。
3. **枚举唯一**：同一含义的枚举跨端同名同值，第 4.4 节的 19 组与 glossary 逐字比对。
4. **危险动作有三件套**：`reason`、`operator`、`actedAt` 齐全，且动作旁有后果提示。
5. **分区对分组**：抽屉的分区数等于字段分组数，不出现「其它」兜底分组。

## 12. 变更记录

| 日期 | 类型 | 内容 |
| --- | --- | --- |
| 2026-11-08 | 新增 | 建立方案：对标三套开源系统的功能架构，出两端目标架构、30 页增量、5 类交互模式、跨端联动清单与 5 批实施 |
| 2026-11-08 | 修改 | 按「字段 · 界面结构 · 设计理念」三层扩为参考框架：补设计目标与七条原则及映射、四级层级与外壳区域职责、四类骨架区域划分、逐页字段清单、枚举与字典登记口径，新增三层一致性自检 |
| 2026-11-08 | 修改 | 对标源确认为 JeeWMS（`jeewsms` 为笔误），两端统一 |
| 2026-11-08 | 修改 | 按源码调研重写：补第 1.2 节证据清单（A/B/C 三级，逐条给仓库路径）与第 1.3 节四处修正；补「理货任务」页（30 → 31 页），「称重」并入打包单；改判 OpenWCS 为 WES+WCS 合体；工作站按 OpenWES 原文六步重写；计费链路按 JeeWMS bms 四段重写；增量清单逐页标证据级别；WMS 页数 50 → 51 |
| 2026-11-08 | 修改 | 补齐 JeeWMS 出库侧调研（GitHub API 限流后改走 Gitee 镜像 `erzhongxmu/JEEWMS`）：补 `wms/jee` 完整 118 个组件清单与 `Wm*` 46 个分组（出库 17、`WmReturn*` 6、上下架与移库 7、装车复核 2、称重/温控/托盘/箱号/平台出入库各 1~2）；实读 `WmOmClientHList.vue` 与 `WmOmQmIList.vue` 两页字段，补第 1.3 节第 5~7 条修正；打包单加 `cartonNo`、装车发运加 `dockCode`；第 10 节补退货链、温控、黑白件、平台出入库、托盘五条不纳入理由 |
| 2026-11-08 | 修改 | 页面级字段调研收口：实读 `WmToUpList`、`WmToMoveGoodsList`、`WaveToDownList`、`WmReturnAcceptList`、`BmsCostRuleHList`、`BmsBillHList`、`BmsBillISubTable` 七页源码并逐条进 1.2 证据清单；更正「`WmReturnAcceptList` 为退货验收」的误判（实为收货验收）与退货链页数（7 文件 / 四件套 → 6 文件 / 5 页）；补第 1.3 节第 8~11 条；结算状态改按账单四步链，新增开票/货币/计费周期/账单类型/收款状态五组枚举；服务目录与报价补合同与最低/最高收费/周期/有效期，结算单与发票补货币税率与含税口径，质检单补验收数量与计划库位/托盘，分播播种补两级容器与条码；第 4.5 节撤销不实的「19 个新实体」计数改为一页一核；第 6.4 节计费链路按账单实读补页签与状态链；联动与分批的枚举、列名、实体口径同步 |
