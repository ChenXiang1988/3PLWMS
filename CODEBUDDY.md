# 货灵供应链运营平台

产品文档与五端自包含 HTML 原型。没有后端、数据库、真实前端工程，也没有 `package.json`、npm scripts、测试框架、lint、CI；入口全是 Node 原生 ESM 的 `.mjs`，在仓库根目录用 `node <路径>` 运行，没有单测。

## 常用命令

- `node prototypes/build-app.mjs`：按 `prototypes/shared/modules.json` 装配五个端，产物写到 `prototypes/dist/<端名>.html`。构建同时做校验，违规打印 `[标签] 描述` 后以退出码 1 中止，不写盘；`dist/` 不入库、不手改。
- `node prototypes/build-app.mjs --check`：只读比对产物指纹，输出 `check ok` 或 `[基线] drift`。改原型前先跑，报 drift 先查并发会话或产物过期。
- `node .codebuddy/skills/huoling-proto/scripts/verify-delivery.mjs`：交付验收；`--app <端id>` 只验一个端，`--fast` 跳过漂移检查、不能用于交付。退出码 0 通过 / 1 违规 / 2 环境不满足。
- `node docs/check.mjs`、`node docs/数据字典/check.mjs`：改完文档必须跑，两者零错误再提交。
- `node .codebuddy/skills/huoling-proto/scripts/init-module.mjs --list`：空工作区建共享层与构建入口；带 `<模块ID>` 建单模块骨架，目录已存在时拒绝覆盖。

## 项目结构

- `prototypes/`：源按模块目录放（清单见 `modules.json` 的 `modules[]`），端是构建期聚合出来的交付单元（`apps[]`，外壳取 `admin` / `mall` / `pda`）。页面归属只看 `pages[].app`，一个模块的页面可分属多个端，没写 `app` 的页面不进任何产物；配了 `nav` 的端按导航段分组，没配的按模块分组。
- `prototypes/shared/`：`modules.json` 只管装配，`tokens.css.mjs` 是色值令牌唯一来源，`ui.mjs` 是组件与三套外壳的实现层，`data/` 是货主、商品、仓库、批次等共享主档（页面数据用 `ref` 引用，不另抄一份）。改这里任一文件，五个端全部重建。
- `docs/`：文档唯一存放处，`index.md` 总索引 + `log.md` 变更日志，分类见索引；`数据字典/` 是字段真值源，自管一套 `index.md`、`log.md`、`check.mjs`。改文档必须记日志并更新索引「最近更新」。
- `humanfile/`：人类书写区，agent 只读。
- `.codebuddy/skills/huoling-proto/`：原型 skill 与 `references/`；`.codebuddy/rules/`：工作区约束。skill 只管 `prototypes/`，`docs/` 各有自己的规范。

## 动手前

原型规范全在 `.codebuddy/skills/huoling-proto/SKILL.md`，按「五层」第 0 步挑卷读；改任一端先按「跨端联动确认」规则出评估清单，确认后才动源。文案逐字取 `references/core/glossary.md`，自己起名就是返工。硬约束：不是 SaaS，单实例单主体，多货主只是业务维度——货灵运营中台管理端、货灵WMS用货主筛选，货灵ERP按登录身份限定数据、不给货主下拉。

文档、数据字典、流程图的规范分别在 `docs/index.md` 的使用规则、`docs/数据字典/index.md` 的使用规则、「流程图规范」规则里。
