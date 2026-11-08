---
name: 权限域拆分：ERP 与仓网各管各的
overview: 把账号与权限从「一张统一账号表」拆成两个管理域：ERP 只管货主用户，仓网只管运营方与仓内用户；清掉仓网端混入的货主账号、货主角色选项与货主操作日志，并修正方案与字典口径。
todos:
  - id: docs-domain-split
    content: 改账号与权限方案、子账号字典、功能清单与 glossary，拆 ERP 货主域与仓网域并登记日志。
    status: pending
  - id: network-data-cleanup
    content: 删仓网账号页两行货主账号与货主账号类型，操作日志移除三条 ERP 日志并补仓网/PDA 日志。
    status: pending
    dependencies:
      - docs-domain-split
  - id: module-scope-align
    content: 改 system 模块与 modules.json 的 scope/版本，核对 registry 页数与仓网域描述。
    status: pending
    dependencies:
      - network-data-cleanup
  - id: build-verify
    content: 用 [skill:3pl-wms-proto] 五端重建，跑 verify-delivery 与两套 docs check。
    status: pending
    dependencies:
      - module-scope-align
  - id: browser-check
    content: 用 [skill:agent-browser] 核仓网账号 7 行、无 ow.*、日志无货灵ERP，ERP 货主隔离不变。
    status: pending
    dependencies:
      - build-verify
---

## 产品概述
在仓网管理端补一层面向软件运营方的「ERP 运营」后台，同时把 ERP 货主权限域与仓网运营/仓内权限域彻底拆开。仓网管理端负责货主开通、模块与版本、平台应用、同步健康和全局审计；货主 ERP 仍负责自己的订单、库存、账单、子账号与角色。

## 核心功能
- 仓网管理端新增「ERP 运营」一级菜单，含货主开通、模块与版本、平台应用、同步健康、全局审计五页。
- 货主开通页支持开通、停用、调整有效期、模块配置、代维进入、查看审计；模块与版本页支持启用停用、查看开通明细；平台应用页展示凭证脱敏、能力范围、限流与审核状态；同步健康页汇总全店铺积压、错误率与授权到期；全局审计页按货主、端、模块、动作筛选。
- 代维只做只读摘要与提示，不进入货主业务页，动作留审计。
- 仓网账号页只保留运营方账号与仓内账号，删除货主账号与货主角色选项；仓网操作日志不再出现货灵ERP端。
- 货灵ERP子账号、角色、操作日志保持本货主隔离，不因仓网新增运营后台而改变。
- 文档补 ERP 运营方案、货主开通、平台应用、ERP模块三份字典，并修正账号与权限方案的两域口径。

## 边界
- 仓网不管理货主子账号与货主角色，货主账号仍在货灵ERP建。
- 全局审计允许出现货灵ERP端；仓网「账号与权限 → 操作日志」不允许出现货灵ERP，两页职责分开。
- 原型不实现真实跨端登录、OAuth、token、API、队列与限流；平台应用页只做凭证脱敏、能力与审核状态。
- 原型文案不使用「租户」「订阅」「套餐」「续费」「试用到期」「平台运营后台」等词，统一写「货主开通」「模块与版本」。

## 技术栈
- 沿用现有 Node 原生 ESM 构建、`prototypes/shared/modules.json` 装配、`data/*.json` 演示数据与 `shared/ui.mjs` 组件。
- 不新增依赖、不新增骨架类型、不新增组件库；五页全部使用现有 `list` 骨架与 `ListPage`、`FormDrawer`、`DrawerDetail`。
- 新模块 `erp-ops` 归 `network-app`，页面类型均为 `list`；页面 key 必须全局唯一。
- 视觉沿用现有 admin 外壳与设计令牌，不新增字体、色值或页面骨架。

## 实现策略
1. 先改文档与字典，确定两域口径和 ERP 运营页面文案，再动原型数据。
2. 仓网账号域只做数据清理，不改 `system/pages/*.mjs`：删货主账号、去货主角色选项、删货主日志。
3. 新建 `erp-ops` 模块与五页，页面用薄包装复用现有列表与抽屉，避免复制五套页面代码。
4. 同步健康与全局审计是 `同步任务`、`操作日志` 的视图，不建第二份真相。
5. 最后五端重建、全量验收、浏览器核验与日志回填。

## 架构设计
- 仓网管理端 = 3PL 运营方后台，包含「仓网运营」与「ERP 运营」两块；货灵ERP = 货主业务后台。
- `erp-ops` 模块只读货主级汇总与审计，不持有货主业务数据；货主账号与角色仍由 `owner` 模块管理。
- 菜单权限在 `system/role-list.json` 增加「ERP 运营」，动作权限增加「代维」；运营管理员默认勾选，本期不新增角色。
- 全局审计与仓网账号日志分页：`erp-global-audit` 可跨货主、可出现货灵ERP端；`system/audit-log` 只保留仓网/PDA日志。
- 代维入口是货主开通页的行动作：打开只读摘要抽屉，提供「进入代维（原型示意）」按钮并 toast，不跨端跳转。

## 跨端联动
| 端 | 落点 | 联动点 | 结论 |
| --- | --- | --- | --- |
| 货灵ERP | 无页面/数据改动 | 账号域与审计口径 | 无需改页面，重建确认无回归 |
| 仓网管理端 | 新增 `erp-ops` 五页；`system` 账号与日志清理；nav 10 段 | 页面归属、导航、角色菜单、页数 | 必须同改 |
| 单仓端 | 无改动 | 人员页关联仓内账号 | 无需改 |
| PDA 作业端 | 无改动 | 我的页角色与仓库范围 | 无需改 |
| 商城端 | 无改动 | 买家与店主沿用货主账号 | 无需改 |
| 共享层 | `modules.json`、`glossary.md`、`registry.md` | 模块清单、页数、文案 | 必须同改 |
| 文档 | 新方案、账号方案、功能清单、三份新字典、索引与日志 | 两域与 ERP 运营口径 | 必须同改 |

重建范围：五端全建。仓网页数 35 → 40，总页数 123 → 128，模块 16 → 17，导航 9 → 10 段。

## 目录结构
```
prototypes/
├── shared/modules.json                              # [MODIFY] 新增 erp-ops 模块与 5 个页面，network-app 导航加「ERP 运营」段
├── erp-ops/
│   ├── module.json                                  # [NEW] ERP 运营模块，5 页，app 归 network-app
│   ├── pages/
│   │   ├── _list.mjs                                # [NEW] 五页共用的列表薄包装，支持 createLabel/noCreate/form
│   │   ├── erp-tenant-list.mjs                      # [NEW] 货主开通页
│   │   ├── erp-module-list.mjs                      # [NEW] 模块与版本页
│   │   ├── erp-app-list.mjs                         # [NEW] 平台应用页
│   │   ├── erp-sync-health.mjs                      # [NEW] 同步健康页
│   │   └── erp-global-audit.mjs                     # [NEW] 全局审计页
│   └── data/
│       ├── erp-tenant-list.json                     # [NEW] 3~4 个货主开通演示数据
│       ├── erp-module-list.json                     # [NEW] 8 个 ERP 模块与版本
│       ├── erp-app-list.json                        # [NEW] Amazon/Temu/速卖通部署级应用
│       ├── erp-sync-health.json                     # [NEW] 全店铺同步健康演示数据
│       └── erp-global-audit.json                    # [NEW] 跨货主 ERP 审计演示数据
├── system/
│   ├── data/user-list.json                          # [MODIFY] 删 2 行货主账号，账号类型只留运营方/仓内
│   ├── data/audit-log.json                          # [MODIFY] 删 3 条货灵ERP日志，补 3 条仓网/PDA日志
│   ├── data/role-list.json                          # [MODIFY] 菜单加「ERP运营」，动作加「代维」
│   └── module.json                                  # [MODIFY] 版本 0.3.1，scope 改仓网域
docs/
├── 产品需求/
│   ├── ERP运营后台方案.md                            # [NEW] 定位、五页、货主开通生命周期、平台应用、同步健康、全局审计、代维、两张流程图
│   ├── 账号与权限方案.md                            # [MODIFY] 两域拆分、ERP运营与货主权限域边界
│   └── 三端核心功能清单.md                          # [MODIFY] 仓网新增 ERP 运营管理行与逐页落点
├── 数据字典/
│   ├── 货主开通.md                                  # [NEW] ownerCode、erpStatus、modules、version、expireDate、账号数、店铺数
│   ├── 平台应用.md                                  # [NEW] 平台、应用类型、AppKey脱敏、授权方式、回调、能力、限流、审核状态
│   ├── ERP模块.md                                   # [NEW] 模块编码、名称、当前版本、适用端、状态
│   ├── 子账号.md                                    # [MODIFY] 补 accountDomain，唯一性按域
│   ├── index.md                                     # [MODIFY] 登记三份新字典
│   └── log.md                                       # [MODIFY] 字典变更留痕
├── index.md                                         # [MODIFY] 登记 ERP运营后台方案
└── log.md                                           # [MODIFY] 记录两域拆分、五页新增、数据清理与验收
```
- `registry.md`：模块 17 个、仓网 40 页、总 128 页、仓网 10 段，补 `erp-ops` 模块行。
- `glossary.md`：补「ERP 运营」段、五页名称与列名、货主开通状态、模块状态、应用审核状态、同步健康状态、代维动作、账号域取值。

## 关键约束与性能
- 构建期 `SAAS_WORDS` 会拦截「租户」「订阅」「套餐」「续费」「试用到期」「平台运营后台」等词；页面与数据文案统一用「货主开通」「模块与版本」。
- 页面 key 全局唯一：`erp-tenant-list`、`erp-module-list`、`erp-app-list`、`erp-sync-health`、`erp-global-audit`。
- `erp-ops` 页面只读汇总，不新增业务表；同步健康与全局审计从 `同步任务`、`操作日志` 口径派生，避免第二份真相。
- 运行时仍是静态列表、筛选与分页，无额外请求、无队列、无定时任务；构建期新增 5 个页面与 5 份 JSON，产物体积增量有限。
- 代维只做只读抽屉与 toast，不跨端跳转；动作写入全局审计演示数据。

## Agent Extensions
### Skill
- **3pl-wms-proto**
  - Purpose: 按现有 modules.json、data JSON、shared/ui.mjs 与交付验收规范新增 `erp-ops` 模块、修改仓网账号/日志数据并重建五端。
  - Expected outcome: 仓网导航新增「ERP 运营」五页，仓网账号域只保留运营方与仓内账号，五端产物一致且验收零违规。
- **agent-browser**
  - Purpose: 打开仓网管理端与货灵ERP产物，核对账号行数、账号类型筛选、日志端名、五页可开与 ERP 货主隔离。
  - Expected outcome: 截图与交互记录证明仓网账号 7 行、无 `ow.*`、仓网账号日志无货灵ERP、ERP 五页正常、ERP 侧数据不变。
