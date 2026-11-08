# huoling-proto

把「按模块写源码、按端出交付物」的自包含 HTML 原型工程，用注册表、构建、验收三件套管起来的 skill。

本文件讲**结构与工作原理**：这个 skill 由哪些部分组成、各部分怎么咬合、`prototypes/` 为什么这样分目录。执行任务前读 [SKILL.md](SKILL.md)——流程、硬约束、返工清单都在那里。两者冲突时以 SKILL.md 为准；SKILL.md 与工作区规则冲突时以工作区规则为准。

本文件不记录具体端名、模块名、页面清单与数量。那些属于装配现场，只看 `prototypes/shared/modules.json` 与 `references/core/glossary.md`。

## 1. 定位与边界

| 管 | 不管 |
| --- | --- |
| `prototypes/` 的页面源、构建入口、产物与验收 | `docs/` 下的文档（各有自己的规范） |
| 装配关系、外壳视觉法、令牌与组件白名单、文案权威源 | 后端接口、数据库、真实前端工程 |
| 「什么算合格」的可执行判据 | PRD 内容本身、业务规则的正确性 |

产物是**演示用的单文件 HTML**：双击即开、CSS 与脚本内联、数据在页面内。表单提交与状态流转只在浏览器内存与 `sessionStorage` 里生效，刷新或换端都不共享，不发起网络请求。

## 2. 工作原理

四句话：

1. `prototypes/shared/modules.json` 是装配的唯一权威源：有哪些端、哪些模块、每个页面归哪个端、页面是什么类型、端用哪套外壳。
2. 源按**模块**放：`prototypes/<模块ID>/pages/*.mjs` 与 `data/*.json`。模块目录里没有「端」这一级。
3. 构建 `node prototypes/build-app.mjs` 读注册表，把多个模块里 `pages[].app` 指向同一个端的页面聚合成一个 HTML，按 `apps[].shell` 套对应外壳，写出 `prototypes/dist/<端名>.html`。
4. 合格与否由两层判：构建期静态断言拦结构性问题，`verify-delivery.mjs` 加人工核对判交付是否成立。

由此得到几条必须先接受的推论：

| 推论 | 后果 |
| --- | --- |
| 端不是目录，是构建期聚合结果 | 增删端、改页面归属只改注册表，不搬源文件 |
| 模块是源组织单元，不是交付单元 | 模块目录不产出 HTML，也不按模块发版 |
| 页面类型决定骨架，不能混搭 | `pages[].type` 与实际调用的组件不符，构建期直接拦 |
| 页面源不认识端，也不认识别的模块 | 页面模块只 import `../../shared/ui.mjs`，不读注册表 |
| 产物是构建结果 | 手改 `dist/*.html` 下次构建即被覆盖 |

### 2.1 一次构建做了什么

`build-app.mjs` 按固定顺序走六段：

1. **读注册表并校验**：端 id 合法且不重复、`shell` 在允许的外壳内、页面 `key` 跨模块唯一、`type` 在五类骨架内、`app` 指向已存在的端、已分配端的页面文件存在；配了 `nav` 的端，每个页面必须恰好落在一段内。
2. **装载共享主档**：读 `shared/data/` 下由构建入口声明的主档文件，校验主档的取值域与注册表一致、外键不重复。
3. **按端取页面**：遍历 `deployed: true` 的模块，把 `pages[].app` 等于当前端 id 的页面收进本端。
4. **装配页面**：逐页 `import` 页面模块，装入 `data/<页key>.json`（`ref` 声明在这里展开成完整行），调 `renderPage(data, ctx)`，得到 `<section class="page" data-page-id="<模块ID>/<页key>">`。抽屉内容作为 `overlay` 单独收集，统一挂在 `<body>` 末尾。需要按登录身份隔离数据的端，在这一步为每个演示身份各渲染一套页面容器。
5. **套外壳**：`admin` 出顶栏、可收起侧栏与页头页签；`mall` 出商城顶栏与页脚；`pda` 出机身、状态条与按键区。导航分组优先用注册表的 `apps[].nav`，没配就按模块分组。CSS、脚本、数据全部内联。
6. **产物断言与落盘**：扫自包含（无外链、无外部样式与脚本）、红线词与过程文字、外壳串味、跨端链接、抽屉配对、页签筛选项等，通过后算源指纹写进 `<html data-build>`，输出到 `dist/`。任一断言失败打印 `[标签]` 并以退出码 1 中止。

`node prototypes/build-app.mjs --check` 走另一条路：不渲染，只对每个端重算源指纹，与产物里的 `data-build` 比对，逐端报 `check ok` 或 `[基线] drift`。指纹覆盖构建入口、注册表、令牌、`ui.mjs`、共享主档，以及该端全部 `pages/*.mjs` 与 `data/*.json`。

### 2.2 一次验收做了什么

`scripts/verify-delivery.mjs` 按端跑六组：

| 组 | 查什么 |
| --- | --- |
| S1 | 模块边界：页面无跨模块 import、`dependsOn` 只含 `shared`、`module.json` 与注册表一致 |
| S2 | 文案一致：端名、模块名、页面名逐字存在于文案权威源 |
| S3 | 取值不越界：页面里每个 hex 都在令牌源内、无 `rpx` |
| S4 | 骨架与命名：声明类型与实际组件匹配、自定义类名带模块前缀 |
| S5 | 产物：单文件自包含、页容器齐全、产物只在 `dist/`、未被 git 跟踪 |
| X | 漂移：调 `build-app.mjs --check` |

脚本只能判可执行项。层级、强调色预算、空态、多宽度适配这类靠眼睛的，在 `references/core/acceptance.md` 的人工组，交付前逐条打勾。`--fast` 跳过 X 组，只用于改源中途自查，不能当交付验收。

## 3. skill 自己的目录

```
.codebuddy/skills/huoling-proto/
├── SKILL.md                 入口：分层索引、目录生成、硬约束、流程
├── README.md                本文件：结构与工作原理
├── references/              规范层，按需读
│   ├── registry.md          装配索引：端与模块清单、页面归属、目录结构、依赖边界
│   ├── implementation.md    实现层契约：令牌、组件白名单、命名、data-* 交互
│   ├── core/
│   │   ├── output-format.md 产物契约、外壳骨架、构建链与断言、交付清单
│   │   ├── acceptance.md    验收的可执行项、人工项、已知缺口
│   │   ├── glossary.md      所有可见文字的唯一出处
│   │   └── anti-patterns.md 误用全集
│   └── shells/
│       ├── admin.md         后台外壳：设计意图、骨架、层级、强调色纪律、禁区
│       ├── mall.md          商城前台外壳
│       └── pda.md           手持终端外壳
├── scripts/
│   ├── init-module.mjs      建共享层、端构建入口、模块骨架
│   └── verify-delivery.mjs  交付验收
└── templates/               脚手架母本，由脚本复制并替换占位符
    ├── build-app.mjs        端构建入口
    ├── modules.json         注册表模板
    ├── module.json          模块源交付清单
    ├── tokens.css.mjs       令牌
    ├── ui.mjs               组件与外壳实现
    ├── data/                共享主档初始数据
    └── page-*.mjs           五类页面骨架
```

三类资源分工固定：

- **`SKILL.md`** 管「按什么顺序做」。它只给层与层的入口，不写具体色值、不写完整字段表。
- **`references/`** 管「上限与文案」。能不能这么画、这页叫什么、列名怎么写、什么算通过，都在这里。改规范只改这里，不改产物。
- **`scripts/` 与 `templates/`** 管「重复动作」。建目录、构建、验收都是确定性脚本，不靠每次手写。

按任务挑卷，不要通读：改页面先读对应的 `references/shells/` 一卷，再读 `implementation.md`；加页面、加端、改归属读 `registry.md`；构建交付读 `core/output-format.md` 与 `core/acceptance.md`；报错读 `core/anti-patterns.md`；查文案只查 `core/glossary.md`。

## 4. `prototypes/` 的目录

### 4.1 全貌

```
prototypes/
├── build-app.mjs              端构建唯一入口（脚手架生成，之后以现场为准）
├── dist/                      构建产物，不入库、不手改
│   └── <端名>.html            apps[] 里每个端一个文件
├── shared/                    全端共用，改这里所有端全部重建
│   ├── modules.json           注册表：装配唯一权威源
│   ├── tokens.css.mjs         令牌：色值、字号、间距、圆角、布局尺寸的唯一取值处
│   ├── ui.mjs                 组件、三套外壳、登录层、外壳脚本
│   └── data/                  共享演示主档，单一事实源
└── <模块ID>/                  一个业务模块一个目录
    ├── module.json            源交付清单：版本、负责人、层级、依赖、状态
    ├── pages/<页key>.mjs      页面模块，导出 renderPage 与可选 PAGE_CSS
    └── data/<页key>.json      该页的演示数据，或对共享主档的 ref 引用
```

`<模块ID>` 与 `<端名>` 都来自注册表，目录名与文件名不另起一套。模块目录没有嵌套、没有分组目录、没有端这一级。

### 4.2 三层分工

| 层 | 位置 | 改动代价 |
| --- | --- | --- |
| 共享层 | `shared/` | 改任一文件，所有端产物全部重建并重新验收 |
| 模块层 | `<模块ID>/` | 只影响本模块被装配进的那些端 |
| 产物层 | `dist/` | 不手改，改源后重建 |

模块层内部不允许互相引用：`pages/*.mjs` 只许 import `../../shared/ui.mjs`，不读别的模块的页面或数据。跨模块要共享的东西一律上提到 `shared/`。

### 4.3 三件套与页 key 命名链

一个页面在四处出现，都靠同一个**页 key** 串起来：

```
注册表 pages[].key = <页key>
        pages[].file = pages/<页key>.mjs
                       │
                       ├── prototypes/<模块ID>/pages/<页key>.mjs
                       ├── prototypes/<模块ID>/data/<页key>.json
                       └── 产物里 <section data-page-id="<模块ID>/<页key>">
```

改 key 等于同时改注册表、页面文件名、数据文件名，以及侧栏与页签的跳转目标。构建期以 `data/<页key>.json` 装载，并以页 key 作为 `data` 对象的键，文件名对不上直接报错。

`module.json` 是源交付清单，不是第二份注册表：

| 字段 | 约束 |
| --- | --- |
| `id` / `name` | 等于目录名与注册表 `name` |
| `dependsOn` | 只允许 `["shared"]`，写别的模块 ID 判违规 |
| `deliverables` | 至少含 `pages/`、`data/`；模块不产出 HTML |
| `status` | `draft` / `review` / `delivered`，通过验收才置 `delivered` |
| `version` / `owner` | 每次交付递增版本、填负责人 |

页面清单只在注册表维护，`module.json` 不复制 `pages[]`。

### 4.4 端与模块不正交

这是最容易误判的一处。三条事实：

- **一个端的页面来自多个模块**：外壳只提供容器，页面内容可以来自任意模块。
- **一个模块的页面可以分属多个端**：同一个模块里，后台页与手持终端页各自归属不同端，只由注册表 `pages[].app` 决定。
- **模块目录不是端产物**：目录里没有端的概念，端是构建期按 `app` 聚合出来的。

所以「按端建目录」是错的：端一旦增减，源就要搬家。源永远按模块放，归属只改注册表。

### 4.5 `shared/` 四件东西

| 文件 | 管什么 | 不许做什么 |
| --- | --- | --- |
| `modules.json` | 端、模块、页面归属、页面类型、外壳类型、导航段 | 不放取值、不放文案正文、不放页面清单以外的东西 |
| `tokens.css.mjs` | 色值、字号、间距、圆角、阴影、布局尺寸 | 不被页面绕过；页面只写令牌变量 |
| `ui.mjs` | 组件白名单、三套外壳、登录层、外壳脚本、`data-*` 交互实现 | 不新增规范层没允许的组件 |
| `data/` | 共享演示主档 | 不在页面数据里另抄一份 |

页面数据有两种写法：自带 `rows`，或写成引用声明 `{ "ref": "<主档名>", "keys": [...] }` 指向 `shared/data/` 下的主档，构建期补齐成完整行再交给页面模块。页面模块与最终产物都不感知主档的存在，所以主档改一次，所有引用它的页面同时变。主档文件名由构建入口声明，不在页面里约定。

`ui.mjs` 同时是三套外壳的实现：外壳骨架、登录层、外壳脚本都在这里。页面只管页面容器里的内容，不拼外壳。

### 4.6 `dist/`

- 一个端一个文件，文件名取注册表 `apps[].name`，不硬编码。
- 只有这里有 HTML；模块目录下出现 HTML 判违规。
- 被 `.gitignore` 忽略，不提交。
- 单个文件拷到空目录要能双击打开、本端页面无死链。跨端链接默认禁止，确需跨端的入口由构建断言按白名单校验，脱离同目录交付时不影响本端浏览。

## 5. 常见改动落在哪

| 要做的事 | 改哪里 | 顺带要动 | 验什么 |
| --- | --- | --- | --- |
| 改一页的列、筛选、按钮、数据 | 该模块 `pages/<页key>.mjs`、`data/<页key>.json` | 新列名先登记文案权威源 | 构建后看该端 |
| 加一个页面 | 登记文案 → 注册表加 `pages[]`（含 `app`）→ 从 `templates/page-*.mjs` 复制并替换占位符 → 补 `data/<页key>.json` | 该端配了 `nav` 时，新页必须放进某一段 | 构建 + 全量验收 |
| 加一个端 | 注册表加 `apps[]`（id 带 `-app`、`shell` 三选一） | 新外壳类型要先补 `references/shells/` 与 `ui.mjs` | 新端产物单独打开 |
| 改页面归属 | 只改注册表 `pages[].app` | 源端与目标端的 `nav` 同步 | 两端都构建 |
| 改视觉取值 | 先改 `references/shells/` 或 `implementation.md`，再改 `shared/tokens.css.mjs` | 所有端全部重建 | 全量验收 |
| 加共享主档字段 | `shared/data/` 对应主档 | 用到它的页面 `data/*.json` 的 `ref` | 构建期主档断言 |
| 只改一个端的页面 | 仍然先做跨端联动评估 | 按工作区的跨端联动规则出清单等确认 | 该端 + `--check` |

加页面时不要删模块目录重跑脚手架：`init-module.mjs` 见到目录已存在会直接拒绝，这是保护，不是缺陷。

## 6. 命令

| 命令 | 用途 |
| --- | --- |
| `node .codebuddy/skills/huoling-proto/scripts/init-module.mjs --list` | 打印端与模块清单（只读，不建目录） |
| `node .codebuddy/skills/huoling-proto/scripts/init-module.mjs <模块ID>` | 建 `shared/`（若缺）、`prototypes/build-app.mjs`、忽略规则，再建该模块骨架 |
| `node prototypes/build-app.mjs` | 构建全部端产物，同时做全部静态断言 |
| `node prototypes/build-app.mjs --check` | 只比对源指纹与产物，不写盘；开工记基线、交付前复查 |
| `node .codebuddy/skills/huoling-proto/scripts/verify-delivery.mjs` | 全量验收，退出码 0 通过 / 1 违规 / 2 环境不满足 |
| `node .codebuddy/skills/huoling-proto/scripts/verify-delivery.mjs --app <端id>` | 只验一个端 |

`--app` 只用于定位问题。交付前必须跑不带 `--fast` 的全量验收。

`init-module.mjs` 的保护行为：`shared/` 与构建入口已存在时保持原样不覆盖；目标模块目录已存在时拒绝执行。所以它只适合「从零建」和「加一个还没落地的新模块」。

## 7. 真值分层

同一件事只允许有一个出处。三处互相复制，就是漂移的起点。

| 事实 | 唯一出处 |
| --- | --- |
| 有哪些端与模块、页面归哪个端、页面类型、外壳类型 | `prototypes/shared/modules.json` |
| 界面上的字：端名、模块名、页面名、页签、列名、按钮、状态、空态 | `references/core/glossary.md` |
| 色值、字号、间距、圆角的具体取值 | `prototypes/shared/tokens.css.mjs` |
| 组件结构、外壳骨架、交互实现 | `prototypes/shared/ui.mjs` |
| 演示主档数据 | `prototypes/shared/data/` |
| 边界规则、上限、验收判据 | `references/` 下的规范文件 |

规范层不写具体 hex，实现层不新增规范没允许的组件，索引层（`modules.json`、`module.json`）只引用不新增取值。

## 8. 模板与现场的关系

`templates/` 是空工作区的起点，不是运行时的依赖：

- `init-module.mjs` 把 `templates/` 复制到 `prototypes/` 并替换 `__MODULE_ID__`、`__MODULE_NAME__`、`__PAGE_KEY__`、`__PAGE_NAME__`、`__PREFIX__`。
- 复制只在目标不存在时发生。现场文件一旦生成，就独立演进，模板不反向覆盖。
- 模板里的页面骨架带示例列名，**列名与按钮必须换成文案权威源的词**，不能沿用示例。
- 在 skill 目录里直接 import 模板会报 `ERR_MODULE_NOT_FOUND`：模板里的 `../../shared/ui.mjs` 是相对 `prototypes/<模块ID>/pages/` 算的。

因此改构建链要分清改哪边：`prototypes/build-app.mjs` 是现场的构建入口；`templates/build-app.mjs` 只影响以后新建的工作区。两边同步是规范要求，容易漏改模板。

## 9. 读法与维护

| 场景 | 顺序 |
| --- | --- |
| 第一次接手 | 本文件 → [SKILL.md](SKILL.md) → [references/registry.md](references/registry.md) 的装配与目录两节 |
| 要画或改页面 | 对应 `references/shells/*.md` → [references/implementation.md](references/implementation.md) → 查 [references/core/glossary.md](references/core/glossary.md) |
| 要加页面 / 加端 / 改归属 | [references/registry.md](references/registry.md) → 注册表 → 构建 |
| 要交付 | [references/core/output-format.md](references/core/output-format.md) → [references/core/acceptance.md](references/core/acceptance.md) → 跑全量验收 |
| 构建报错 | [references/core/anti-patterns.md](references/core/anti-patterns.md)，按 `[标签]` 找对应章节 |

维护规则：改 skill 的目录结构、脚本参数或模板用途时同步本文件；流程与硬约束只在 SKILL.md 维护，装配清单与文案只在注册表和 `glossary.md` 维护。
