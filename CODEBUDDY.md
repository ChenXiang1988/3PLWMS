# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 仓库性质

3PL 云仓系统的产品文档与可独立部署的 HTML 原型。没有后端、数据库、真实前端工程，也没有 `package.json`、npm scripts、测试框架、lint 或 CI 配置。所有可执行入口都是 Node 原生 ESM 的 `.mjs` 脚本，无第三方依赖，一律在仓库根目录以 `node <路径>` 运行。因此没有「单测」概念，最小范围的检查靠脚本参数实现（见下）。

## 动手前先读规范

工作区规则 `.codebuddy/rules/工作前读规范/RULE.mdc` 要求：写入前先确定任务类型并读完对应规范；规范与现场代码不一致时按规范确认，必要时先提出差异，不自行发明口径。只读探索不受此约束。

| 任务 | 必读 |
| --- | --- |
| `prototypes/` 原型增删改 | `.codebuddy/skills/3pl-wms-proto/SKILL.md` 的「开工前」「硬约束」「流程」，再按流程第 0 步挑 `references/`：改页面看 `references/shells/`（admin / mall / pda）与 `references/implementation.md`；加端或模块看 `references/registry.md`、`references/core/output-format.md`；查文案看 `references/core/glossary.md`；构建交付看 `references/core/output-format.md`、`references/core/acceptance.md`；报错看 `references/core/anti-patterns.md` |
| `docs/` 文档增删改 | `docs/index.md` 的「使用规则」「日志管理」及目标文档的「使用规则」。改完必须在 `log.md` 留痕并更新索引「最近更新」，只改文档不记日志视为未完成 |
| `docs/数据字典/` 实体与字段 | `docs/数据字典/index.md` 的「使用规则」+ 对应实体文档；改完跑自检 |
| 流程图 / 状态流转 / 时序 / 泳道图 | `.codebuddy/rules/流程图规范/RULE.mdc` + `docs/index.md`「使用规则」。文档归入 `docs/产品需求/` 或 `docs/架构设计/`，须登记索引并在 `docs/log.md` 留痕 |
| 原型构建与交付 | `SKILL.md`「流程」+ `references/core/output-format.md`、`references/core/acceptance.md`，并跑 `node prototypes/build-app.mjs --check` 记基线 |

`humanfile/` 是人类书写区，agent 只读、不允许修改（`humanfile/AGENTS.md`）；`humanfile/架构设计.md` 是人类草稿，端数以 `prototypes/shared/modules.json` 为准。工作区规范与 skill 冲突时以工作区规范为准，并同步回 `references/`。

## 常用命令

- `node prototypes/build-app.mjs`：端构建唯一入口。读装配注册表、页面源与演示数据，校验后生成五个端 HTML 到 `prototypes/dist/`；任一断言违规即打印 `[标签] 描述`、报「构建中止」并以退出码 1 结束，不写盘。
- `node prototypes/build-app.mjs --check`：只读基线比对，不写盘。比对产物 `<html data-build>` 与当前源指纹，输出 `check ok` 或 `[基线] drift`。改原型前先跑并记下 `data-build`；报 drift 先查并发会话或产物过期。
- `node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs`：交付验收全量五端，交付前必须跑不带 `--fast` 的全量版本。退出码 0 通过、1 有违规、2 环境不满足。
- `node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs --app owner-app`：只验一个端，是本仓库最小范围的检查；可加 `--json` 取结构化输出，`--fast` 跳过部分检查但不能用于交付。另有 `--module <id>`、`--root <路径>`。
- `node .codebuddy/skills/3pl-wms-proto/scripts/init-module.mjs --list`：空工作区初始化，建 `shared/`、`prototypes/build-app.mjs` 与 `.gitignore` 规则。带 `<模块ID>` 时为单模块生成 `module.json`、`pages/`、`data/`；目录已存在时拒绝覆盖。
- `node docs/check.mjs`：文档体系自检，查总索引章节与链接闭环、状态与日期合法、孤儿文档、日志格式与归档分片闭环。仅警告仍算通过，有错误退出码 1。
- `node docs/数据字典/check.mjs`：数据字典自检，查实体清单闭环、章节完整性、字段 key 小驼峰与必填枚举、全字典禁用词。有错误退出码 1。
- 提交前：`node docs/check.mjs` 与 `node docs/数据字典/check.mjs` 两者都要零错误。

## 架构

### 原型：两套坐标系

最容易搞错的是「模块」不等于「端」。`prototypes/` 下 `base/ inbound/ outbound/ warehouse/ inventory/ billing/ task/ system/ mall/ mall-admin/ network/ resource/ workbench/ pda/` 十四个目录是**源组织单元**（模块）。真正的交付单元是五个端：货主端、仓网管理端、单仓端、商城端、PDA 作业端。

把两者连起来的唯一真值源是 `prototypes/shared/modules.json`：`apps[]` 定义端及外壳（`shell` 取 `admin` / `mall` / `pda`），`modules[]` 里每个 `pages[]` 用 `app` 决定页面进哪个端产物，`deployed` 决定模块是否参与装配，`ownerScoped` 标记该页是否按货主维度渲染，`owners[]` 提供演示货主。没写 `app` 的页面不进任何产物——注册表里这类页面不少，别误以为页面源文件丢了。改动 `apps`、页面归属或共享层任一文件，五个端产物必须全部重建并重新验收。

### 页面模块与共享层

模块目录固定三件套：`module.json` 是该模块的交付状态清单（**不列页面**）、`pages/<页key>.mjs` 是页面源码、`data/<页key>.json` 是演示行或扫描/商城场景对象，三者按页 key 同名对应。页面统一导出 `renderPage(data, ctx)` 与可选 `PAGE_CSS`，只允许 import `../../shared/ui.mjs`；跨模块 import、内联 `<script>`、硬编码 hex/rpx、自造色型都会被构建期正则拦下。五种 `type`（list/detail/report/scan/shop）分别对应 `ListPage` / `DetailPage` / `ReportHero + StatRow + Block` / `ScanPage` / `ShopPage`，页面只写 `columns` / `rows` / `filters` / `toolbar`，交互由 `data-*` 属性驱动。

`shared/` 只有三个文件且分工严格：`modules.json` 只管装配，`tokens.css.mjs` 是色值令牌唯一来源，`ui.mjs` 是组件、后台外壳、登录层、商城外壳及内联 CSS/JS 的实现层。skill 的 `references/` 管设计上限与文案枚举，`shared/` 管取值与结构，二者改动的传播方向不同。

### 构建链与交付形态

`prototypes/build-app.mjs` 动态 `import` 共享层，按 `apps` 逐个装配，把每页包成 `<section class="page" data-page-id="<模块>/<页key>">`，输出 `dist/<端名>.html`。产物是自包含单文件 HTML：CSS/JS 全内联、无外链、每端各带一份登录层与会话面板，单独拷到空目录双击可开。`dist/` 被 `.gitignore` 忽略，不入库、不手改。

构建同时是校验器：装配清单、模块边界、骨架白名单、SaaS 红线词与过程文字（TODO/占位符等）、登录层与端隔离、页签 `field` + `value`。产物 `<html data-build>` 是「全部源 + 构建脚本自身」的 sha256 指纹，`--check` 靠它检测漂移；`verify-delivery.mjs` 再跑产物级断言。

硬约束：原型按端交付、可独立部署，不是 SaaS；单实例单主体，多货主只是业务维度——仓网端/单仓端用「货主」筛选与 `data-owner` 表达，货主端按登录身份限定数据、不提供货主下拉或筛选。端名、页面名、列名、按钮、状态文案逐字取 `references/core/glossary.md`，自己起名是返工起点。

### 文档体系与真值源

`docs/` 是文档唯一存放处：`index.md` 为总索引（「分类与文档」表）、`log.md` 为变更日志，分类有 `产品需求/`、`架构设计/`、`数据字典/`。自检脚本会把「孤儿文档」「索引链接不存在」「日志引用未登记文档」判为错误。活跃日志跨月、超 200 条或超 100 KB 要归档到 `log/YYYY-MM.md` 并在归档索引表登记，归档文件与索引的双向闭环由脚本校验。

`数据字典/` 自管一套 `index.md`、`log.md`、`check.mjs`，顶层索引只给它一个入口，不重复维护实体清单。它是业务实体字段真值源（字段表列头固定、key 小驼峰、必填只能是「是/否」），原型页面列名与取值必须逐字取自对应实体文档，新文案先在 `glossary.md` 登记。流程图类文档只画正向主干视为未完成，必须同时覆盖异常场景与逆向场景，状态名与数据字典、glossary 的枚举一致。

### skill、模板与现场

`.codebuddy/skills/3pl-wms-proto/` 的 `templates/`（带占位符的骨架与构建入口）与 `scripts/`（脚手架、验收）生成现场 `prototypes/`，之后两者独立演进。空工作区顺序：登记 `references/core/glossary.md` + 写注册表 → `init-module.mjs --list` → 逐模块 `init-module.mjs <模块ID>` → 填 pages/data → 构建 → 验收。脚手架不覆盖已存在目录：加页面要先改 `modules.json`，再从 `templates/page-*.mjs` 复制并补数据文件，不要删目录重跑。

skill 只管 `prototypes/`；`docs/产品需求/原型同步方案.md` 里的 `pc/src/build.mjs` 属外部 proto-next 项目，本仓库无此入口。
