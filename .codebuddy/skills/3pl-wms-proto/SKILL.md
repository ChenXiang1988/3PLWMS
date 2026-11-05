---
name: 3pl-wms-proto
description: 3PL 云仓原型（prototypes/）的新增与修改。按端出 HTML，产物进 00 dist，共享层在 01 shared；含目录生成、文案登记、页面骨架、构建验收。PRD、后端接口、真实前端工程不管。
---

# 3PL 云仓原型绘制

这个 skill 管 `prototypes/` 下的原型。货主端、仓网管理端、单仓端、商城端各出一个 HTML；后台三端侧栏按模块分组列本端页面，商城端是前台商城外壳。页面源按模块目录放，产物集中在 `prototypes/00 dist/`，共享层在 `prototypes/01 shared/`。

规范在 `references/`，取值在 `01 shared/tokens.css.mjs` 与 `ui.mjs`，装配清单是 `01 shared/modules.json`。端名、页面名、列名、按钮文案逐字取 [references/glossary.md](references/glossary.md)，自己起名就是返工起点。

## 目录怎么生成

空工作区第一次用，按这个顺序做：

1. 定文案和装配清单。在 `references/glossary.md` 登记端名、页面名、列名、按钮、状态；在 `templates/modules.json` 写好 `apps`、`modules` 和每个 `pages[]`（含 `app` 归属）。首次初始化会把这份注册表复制成 `01 shared/modules.json`。
2. 每个模块跑一次脚手架：

   ```bash
   node .codebuddy/skills/3pl-wms-proto/scripts/init-module.mjs --list
   node .codebuddy/skills/3pl-wms-proto/scripts/init-module.mjs <模块ID>
   ```

   第一条命令顺带建 `01 shared/`（modules.json、tokens.css.mjs、ui.mjs）、`prototypes/build-app.mjs` 和 `.gitignore` 的忽略规则。每条命令建一个模块目录：`module.json`、`pages/`（按注册表每页一个模板文件）、`data/`（每页一个空数据文件）。
3. 填页面和数据。把 `pages/*.mjs` 换成真实列定义，`data/*.json` 填演示行，派生列写成纯函数。
4. 跑 `node prototypes/build-app.mjs`。`00 dist/` 不用手建，构建会创建并写出四个端 HTML。
5. 跑 `node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs` 验收。

生成完是这样：

```
prototypes/
├── build-app.mjs       脚手架生成，端构建唯一入口
├── 00 dist/            构建时创建，产物不入库
│   ├── 货主端.html
│   ├── 仓网管理端.html
│   ├── 单仓端.html
│   └── 商城端.html
├── 01 shared/          脚手架生成
│   ├── modules.json
│   ├── tokens.css.mjs
│   └── ui.mjs
└── <模块ID>/           每个模块跑一次脚手架
    ├── module.json
    ├── pages/<页key>.mjs
    └── data/<页key>.json
```

几个容易踩的地方：目录已存在时脚手架不覆盖，要加页面就先改 `01 shared/modules.json`，再从 `templates/page-*.mjs` 复制并替换占位符、补上 `data/<页key>.json`，别删模块目录重跑，会丢已经写好的内容。改 `apps` 或页面归属要同步 `references/modules.md`、`glossary.md` 和注册表，然后四个端产物全部重建。`00 dist/` 里的 HTML 不入库、也不手改，改源再构建。

## 开工前

- 页面属于哪个端、哪个模块：查 `01 shared/modules.json` 的 `apps` 与 `pages[].app`，模块 ID 和 CSS 前缀也在里面。
- 现场有没有被别的会话改过：`node prototypes/build-app.mjs --check`，记下 `data-build`。
- 要动 `01 shared/`、加设计取值、加端、改页面归属，先跟相关的人确认。

## 硬约束

原型按端交付、可独立部署，不是 SaaS。

| 约束 | 落到原型上 |
| --- | --- |
| 单实例单主体 | 不画租户切换器、平台运营后台、套餐与订阅页 |
| 多货主是业务维度 | 用「货主」筛选与 `data-owner` 表达，不写租户隔离 |
| 端即交付单元 | 一个端一个 `00 dist/<端名>.html`，侧栏按模块分组，页头页签只列本端页面 |
| 模块即源组织单元 | 源按 `<模块ID>/pages/`、`data/` 存放；页面模块只读 `../../01 shared/ui.mjs`，不跨模块 import |
| 模块可插拔 | `deployed` 与 `pages[].app` 决定装配，未归属端的页面不进产物 |
| 改共享层要全量重建 | 改过 `01 shared/` 任一文件，四个端产物全部重建并重新验收 |
| 登录演示随端交付 | 四个端产物各带一份登录层与会话面板，流程、错误码与提示逐字一致 |

每个端产物单独拷到空目录都要能双击打开、没有死链。

## 流程

```
0 读规范 → 1 记基线 → 2 查文案 → 3 改源 → 4 构建 → 5 验收 → 6 自查
```

读规范按任务挑：改页面看 [design-spec.md](references/design-spec.md) 与 [glossary.md](references/glossary.md)；加端或模块看 [modules.md](references/modules.md) 与 [output-format.md](references/output-format.md)；构建交付看 [output-format.md](references/output-format.md) 与 [acceptance.md](references/acceptance.md)；报错看 [anti-patterns.md](references/anti-patterns.md)。

`references/` 管上限与文案，`01 shared/tokens.css.mjs`、`01 shared/ui.mjs` 管取值与结构，`01 shared/modules.json` 只管装配。

记基线跑 `node prototypes/build-app.mjs --check`，报 `check ok` 才动手，报 `drift` 先查并发会话。查文案先看骨架和色型，再逐字取 `glossary.md`；行数据看本模块 `data/*.json`，不从页面代码反推；新文案先按 `glossary.md` 第 6 节登记，别自己发明名字。

改源时：`list` 用 `ListPage`，`detail` 用 `DetailPage`，`report` 用 `ReportHero` + `StatRow` + `Block`，`scan` 用 `ScanPage`。页面模块只写 `columns` / `rows` / `filters` / `toolbar`，统一导出 `renderPage(data, ctx)`，可选 `PAGE_CSS`；自定义类名以「模块前缀 + 页 key」开头，交互由 `data-*` 属性驱动，不写 `<script>`。

构建 `node prototypes/build-app.mjs`，验收 `node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs`（`--app owner` 只验一个端）。交付前跑一次不带 `--fast` 的全量验收，再逐条过 [acceptance.md](references/acceptance.md) 的 B 组人工项和第 6 节清单，最后填 `module.json` 的交付字段。

## 正误对照

| 错误做法 | 正确做法 | 出处 |
| --- | --- | --- |
| 把不同端的页面并列进同一模块侧栏、页面名加端前缀 | 用 `pages[].app` 分端，一个端一个产物 | `modules.md` 第 2 节 |
| 商城端套后台外壳，或给后台端加商品卡片 | `apps[].shell = "mall"` 走 `wx-shop-app`，`shop` 页只归商城端 | `design-spec.md` 第 4 节 |
| 产物散落在各模块 `dist/` | 统一出到 `00 dist/` | `output-format.md` 第 1 节 |
| 给列表页加统计卡片、大标题、自绘筛选栏 | 计数放 `statusTabs` 的 count，筛选用 `filters` | `design-spec.md` 第 4 节 |
| 自己把「入库通知单」写成「到货预约单」 | 逐字取 `glossary.md` | `glossary.md` 第 6 节 |
| 页签点了只切高亮不筛数据 | 每个非「全部」页签带 `field` + `value` | `design-spec.md` 第 4 节 |
| 页面模块写死 hex 或传 `ok` 色型 | 取 `var(--wx-*)`，色型只用五种 tone | `design-spec.md` 第 2、5 节 |
| 产物里放跳转到另一个端 / 模块 HTML 的链接 | 侧栏按模块分组，页头页签只列本端页面 | `output-format.md` 第 2 节 |
| 手改 `00 dist/*.html` 改文案 | 改源再构建 | `output-format.md` 第 5 节 |

## 模板与参考

| 文件 | 用途 |
| --- | --- |
| [references/design-spec.md](references/design-spec.md) | 基准、令牌、五类骨架、组件白名单 |
| [references/modules.md](references/modules.md) | 端与模块清单、页面归属、目录结构、依赖边界 |
| [references/output-format.md](references/output-format.md) | 端产物格式、构建链、断言、交付清单 |
| [references/glossary.md](references/glossary.md) | 端名、页面、页签、列名、按钮、状态枚举 |
| [references/acceptance.md](references/acceptance.md) | 验收标准逐条判定方式 |
| [templates/page-*.mjs](templates/) | 五类页面骨架模板 |
| [templates/build-app.mjs](templates/build-app.mjs) | 端构建入口模板，含 `--check` 与断言 |
| [templates/modules.json](templates/modules.json) | 注册表模板（含 `apps` 与 `pages[].app`） |
| [templates/module.json](templates/module.json) | 模块源交付清单模板 |
| [scripts/init-module.mjs](scripts/init-module.mjs) | 建共享层、端构建入口与模块骨架 |
| [scripts/verify-delivery.mjs](scripts/verify-delivery.mjs) | 交付验收脚本 |

模板带 `__MODULE_ID__` 等占位符，要由 `init-module.mjs` 复制并替换后使用。

## 边界

只管 `prototypes/`，`docs/` 下的需求文档各有自己的规范。不管后端接口、数据库、真实前端工程，产物是演示用的自包含 HTML。要加设计取值，先改 `references/design-spec.md`，再改 `01 shared/` 实现层，最后重建四个端产物。工作区规范与本文件冲突时以工作区规范为准，并同步回 `references/`。
