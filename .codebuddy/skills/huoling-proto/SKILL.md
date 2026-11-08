---
name: huoling-proto
description: 货灵供应链运营平台原型（prototypes/）的新增与修改。五端三种外壳，按端出 HTML，产物进 dist，共享层在 shared；改任一端前先做跨端联动评估并等确认；含装配索引、跨端法、外壳视觉法、实现层契约、脚手架与构建验收。PRD、后端接口、真实前端工程不管。
---

# 货灵供应链运营平台原型绘制

这个 skill 管 `prototypes/` 下的原型：货灵ERP、货灵运营中台管理端、货灵WMS、货灵商城、PDA 作业端各出一个 HTML，产物集中在 `prototypes/dist/`，共享层在 `prototypes/shared/`。页面源按模块目录放，端是构建期按注册表聚合出来的。

结构说明、工作原理与 `prototypes/` 的目录组织见 [README.md](README.md)；本文件只给流程与约束，两者冲突时以本文件为准。

端名、页面名、列名、按钮、状态文案逐字取 [references/core/glossary.md](references/core/glossary.md)，自己起名就是返工起点。

## 五层，按层读

| 层 | 卷 | 管什么 | 什么时候读 |
| --- | --- | --- | --- |
| ① 装配索引 | [references/registry.md](references/registry.md) | 端与模块清单、页面归属、类型与外壳、目录结构、依赖方向、新增端流程 | 开工定位、加页面、加端、改归属 |
| ② 跨端法 | [references/core/output-format.md](references/core/output-format.md)、[acceptance.md](references/core/acceptance.md)、[glossary.md](references/core/glossary.md)、[anti-patterns.md](references/core/anti-patterns.md) | 产物契约、构建链与断言、验收判据、文案真值、误用全集 | 构建交付、查文案、报错、返工 |
| ③ 外壳视觉法 | [references/shells/admin.md](references/shells/admin.md)、[mall.md](references/shells/mall.md)、[pda.md](references/shells/pda.md) | 三套外壳的设计意图、骨架、层级、强调色纪律、禁区 | 画页面前、评审视觉、问「这算不算好看」 |
| ④ 实现层 | [references/implementation.md](references/implementation.md) + `prototypes/shared/` | 令牌、组件白名单、命名、`data-*` 契约、令牌缺口 | 查取值、挑组件、加交互 |
| ⑤ 器 | [scripts/](scripts/)、[templates/](templates/) | 脚手架、构建入口模板、交付验收脚本 | 建目录、构建、验交付 |

`references/` 管上限与文案，`prototypes/shared/tokens.css.mjs` 与 `ui.mjs` 管取值与结构，`prototypes/shared/modules.json` 只管装配。三处互相复制就是漂移的起点。

## 目录怎么生成

空工作区第一次用，按这个顺序：

1. 定文案和装配清单。在 `references/registry.md` 第 4 节确认模块与端，在 `references/core/glossary.md` 登记端名、页面名、列名、按钮、状态；在 `templates/modules.json` 写好 `apps`、`modules` 与每个 `pages[]`（含 `app`）。
2. 每个模块跑一次脚手架：

   ```bash
   node .codebuddy/skills/huoling-proto/scripts/init-module.mjs --list
   node .codebuddy/skills/huoling-proto/scripts/init-module.mjs <模块ID>
   ```

   第一条顺带建 `shared/`（modules.json、tokens.css.mjs、ui.mjs、data/）、`prototypes/build-app.mjs` 与 `.gitignore` 规则；每条建一个模块目录：`module.json`、`pages/`（按注册表每页一个模板）、`data/`（**只为已分配 `app` 的页面**生成）。未分配端的页面只在注册表留 `pages[].file`，不落地模板与空数据。
3. 填页面和数据。把 `pages/*.mjs` 换成真实列定义，`data/*.json` 填演示行，或用 `ref` 引用 `shared/data/` 共享主档。派生列写成纯函数。
4. 跑 `node prototypes/build-app.mjs`。`dist/` 不用手建。
5. 跑 `node .codebuddy/skills/huoling-proto/scripts/verify-delivery.mjs` 验收。

目录已存在时脚手架不覆盖：加页面先改注册表，再从 `templates/page-*.mjs` 复制并替换占位符、补 `data/<页key>.json`，别删模块目录重跑。

## 开工前

- 页面属于哪个端、哪个模块、什么类型：查注册表 `apps` 与 `pages[]`，类型与外壳的对应关系见 `references/registry.md` 第 3 节。
- 现场有没有被别的会话改过：`node prototypes/build-app.mjs --check`，记下 `data-build`。
- 要动 `shared/`、加设计取值、加端、改页面归属，先跟相关的人确认。
- 跨端联动：按 `.codebuddy/rules/跨端联动确认/RULE.mdc` 出评估清单（受影响端、落点、联动点、`必须同改 / 无需改`），确认后才改源。改单个端的页面也走这一步，不因为是单页改动就跳过。

## 硬约束

原型按端交付、可独立部署，不是 SaaS。

| 约束 | 落到原型上 |
| --- | --- |
| 单实例单主体 | 不画租户切换器、平台运营后台、套餐与订阅页 |
| 多货主是业务维度 | 货灵运营中台管理端、货灵WMS用「货主」筛选与 `data-owner` 表达；货灵ERP按登录身份限定数据、不提供货主下拉或筛选 |
| 端即交付单元 | 一个端一个 `dist/<端名>.html`；后台三端侧栏默认按模块分组，注册表为本端配了 `nav` 时按导航段分组，货灵商城是前台外壳，PDA 端是手机外壳 |
| 模块即源组织单元 | 源按 `<模块ID>/pages/`、`data/` 存放；页面模块只读 `../../shared/ui.mjs`，不跨模块 import |
| 端与模块不正交 | 一个端的页面可来自多个模块，一个模块的页面可分属两个端；归属只改注册表，不搬目录 |
| 外壳决定骨架 | `apps[].shell` 取 `admin` / `mall` / `pda`，各自对应 `shells/` 的一卷；`shop` 页只归货灵商城 |
| 改共享层要全量重建 | 改过 `shared/` 任一文件，五个端产物全部重建并重新验收 |
| 共享数据单一事实源 | 货主、商品、仓库、批次主档只在 `shared/data/` 存一份；各页用 `ref` 引用 |
| 端与模块命名分离 | 端 id 统一带 `-app` 后缀，模块 ID 用业务名，两者不得同名 |
| 信息自解释 | 布局、层级、间距与主操作自己说明结构；不加 slogan、页面副标题、教学段、每区块帮助说明、字段旁常显提示；必要补充走 info 图标 + hover 提示（`tipKey` / `title`），无悬停端（PDA / 触屏）改为删减或并入主标签；但表单标签与可访问名称、危险 / 不可逆操作的后果提示必留。细则见工作区「界面文案纪律」规则 |

每个端产物单独拷到空目录都要能双击打开、本端页面没有死链。唯一例外是货灵ERP顶栏「前往商城」：相对路径指向同目录的货灵商城产物、带 `owner` 参数传买家货主，`target="_blank"` 新开页面，五端产物同目录交付时可用；单独拷贝一个端 HTML 时该链接失效，不影响本端页面浏览。店主侧单建「商城店铺」一级菜单，不并入其它分组；一个货主当前只能开一个店铺。

## 流程

```
0 读规范 → 1 记基线 → 2 查联动 → 3 查文案 → 4 改源 → 5 构建 → 6 验收 → 7 自查
```

第 0 步按任务挑卷：改页面先读 `references/shells/` 对应外壳一卷，再读 `references/implementation.md`；加页面、加端、改归属读 `references/registry.md`；构建交付读 `references/core/output-format.md` 与 `references/core/acceptance.md`；报错读 `references/core/anti-patterns.md`。

第 2 步按 `.codebuddy/rules/跨端联动确认/RULE.mdc` 列清单、等确认；确认前不改源，也不先改一点再问。

改源时：`list` 用 `ListPage`，行下钻详情用 `DrawerButton` + `DrawerDetail` 作为 `overlay` 返回（不注册独立 `detail` 页），`report` 用 `ReportHero` + `StatRow` + `Block`，`scan` 用 `ScanPage`，`shop` 用 `ShopPage`。可录入的表单同样用 `FormDrawer` 挂在 `overlay`，字段只给 `fields` 声明，动作走 `data-form-action`；需要状态随操作变化时给 `ListPage` 传 `live` 配置，由外壳脚本在内存与 `sessionStorage` 里重算行、状态列与页签计数，不新增骨架类型。页面模块只写 `columns` / `rows` / `filters` / `toolbar` / `fields` / `live`，统一导出 `renderPage(data, ctx)`，可选 `PAGE_CSS`；自定义类名以「模块前缀 + 页 key」开头，交互由 `data-*` 驱动，不写 `<script>`。

构建 `node prototypes/build-app.mjs`，验收 `node .codebuddy/skills/huoling-proto/scripts/verify-delivery.mjs`（`--app erp-app` 只验一个端）。交付前跑一次不带 `--fast` 的全量验收，再逐条过 `references/core/acceptance.md` 的 A、B 两组与第 6 节清单，最后填 `module.json` 的交付字段。

## 最容易返工的五条

| 错误做法 | 正确做法 |
| --- | --- |
| 按端建目录、把同一模块的页面拆到两个目录 | 源按模块放，归属只改注册表 `pages[].app` |
| 货灵商城套后台外壳，或给后台端加商品卡片 | `shell = "mall"` 走 `wx-shop-app`；商城管理页是后台页面 |
| 列表页加统计卡片、大标题、自绘筛选栏 | 计数进页签，筛选用 `filters`，标题交给侧栏 |
| 页面里写死 hex 或传未定义色型 | 只取 `var(--wx-*)`，色型只用五种 tone |
| 手改 `dist/*.html` | 改源再构建 |

其余返工类型见 [references/core/anti-patterns.md](references/core/anti-patterns.md)。

## 模板与参考

| 文件 | 用途 |
| --- | --- |
| [references/registry.md](references/registry.md) | 端与模块清单、页面归属、类型与外壳、目录结构、依赖边界 |
| [references/core/output-format.md](references/core/output-format.md) | 产物契约、外壳骨架、构建链、断言、交付清单 |
| [references/core/glossary.md](references/core/glossary.md) | 端名、页面、页签、列名、按钮、状态枚举、禁语 |
| [references/core/acceptance.md](references/core/acceptance.md) | 验收 A/B/C 三组与交付清单 |
| [references/core/anti-patterns.md](references/core/anti-patterns.md) | 误用全集 |
| [references/shells/admin.md](references/shells/admin.md) | 后台三端的设计意图、骨架、层级、禁区 |
| [references/shells/mall.md](references/shells/mall.md) | 商城前台的骨架、商品与价格、强调色纪律 |
| [references/shells/pda.md](references/shells/pda.md) | PDA 终端的基准、六段扫码页、触控约束 |
| [references/implementation.md](references/implementation.md) | 令牌、组件白名单、命名、`data-*`、令牌缺口 |
| [templates/page-*.mjs](templates/) | 五类页面骨架模板 |
| [templates/build-app.mjs](templates/build-app.mjs) | 端构建入口模板，含 `--check` 与断言 |
| [templates/modules.json](templates/modules.json) | 注册表模板（含 `apps` 与 `pages[].app`） |
| [templates/module.json](templates/module.json) | 模块源交付清单模板 |
| [scripts/init-module.mjs](scripts/init-module.mjs) | 建共享层、端构建入口与模块骨架 |
| [scripts/verify-delivery.mjs](scripts/verify-delivery.mjs) | 交付验收脚本 |

模板带 `__MODULE_ID__` 等占位符，要由 `init-module.mjs` 复制并替换后使用。

## 边界

只管 `prototypes/`，`docs/` 下的需求文档各有自己的规范。不管后端接口、数据库、真实前端工程，产物是演示用的自包含 HTML。

要加设计取值，顺序是：先改 `references/shells/` 或 `references/implementation.md` 的规范层，再改 `prototypes/shared/` 实现层，最后重建五个端产物。工作区规范与本文件冲突时以工作区规范为准，并同步回 `references/`。
