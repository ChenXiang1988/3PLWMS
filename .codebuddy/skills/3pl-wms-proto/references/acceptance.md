# 验收标准

判定方式分三类：**可执行**（脚本或构建跑）、**人工核对**（看图或读文案）、**已知缺口**（已登记，只禁新增）。一次交付要同时满足 A、B 两组。

## 1. 判定方式

```bash
node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs --app owner
node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs
node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs --json
node prototypes/build-app.mjs --check
```

不带 `--app` 即全量验收所有端。退出码：0 通过、1 有违规、2 运行环境不满足。`--fast` 只在改完源还没构建时用，交付前必须不带 `--fast` 再跑一次。

## 2. A 组：可执行项

| 编号 | 判据 | 判定方式 | 谁在跑 |
| --- | --- | --- | --- |
| A1 | 模块边界：页面无跨模块 import，`dependsOn` 只含 `shared` | 源码扫描 + `module.json` 字段 | S1 |
| A2 | 文案一致：端名、模块名、页面名逐字存在于 `glossary.md` | 注册表 ↔ 文案表比对 | S2 |
| A3 | 取值不越界：页面模块每个 hex 都在令牌源里，且无 `rpx` | 白名单现场收集 | S3、构建期 `[取值越界]` |
| A4 | 骨架与命名：页面类型与组件匹配，`list` 页无 `StatRow` / `ReportHero`，类名带模块前缀 | 源码静态检查 | S4 |
| A5 | 产物格式：三个端 HTML 单文件自包含、有 `data-build`、页容器齐全、无红线禁语 | 产物正文扫描 | S5 |
| A6 | 产物集中且不入库 | 只有 `prototypes/00 dist/` 有 HTML；`.gitignore` 忽略产物目录 | S5 |
| A7 | 源与产物一致 | `node prototypes/build-app.mjs --check` 逐端报 `check ok` | X 组 |
| A8 | 构建期全部断言通过 | 构建无抛错，标签见 [output-format.md](output-format.md) 第 4 节 | 构建时自动 |
| A9 | 状态胶囊色型在五值内 | 无 `ok` / `out` / `low` 等未定义色型 | 构建期 `[色型]` |
| A10 | 页签真能筛数据 | 每个非「全部」页签有 `field` / `value`，行上有对应字段 | 构建期 `[页签]` |

## 3. B 组：人工核对项

| 编号 | 判据 | 出处 |
| --- | --- | --- |
| B1 | 端名、模块名、页面名、页签、列名是否逐字核对过 `glossary.md`？ | `glossary.md` 第 1 节 |
| B2 | 页面上有没有实现说明、设计注解、操作指引、「本期不做」这类文字？ | `design-spec.md` 第 6 节 |
| B3 | 指标定义、口径边界、设计理由是否都收进 `tipKey` / `title`？ | 同上 |
| B4 | 分页真的能切到第 2 页吗？切过去行变了没有？ | `output-format.md` 第 3 节 |
| B5 | 状态页签点下去，行是否真的变少？「全部」能否还原？ | `design-spec.md` 第 4.1 节 |
| B6 | 货主下拉只在该响应的页面出现吗？切货主后行数变了吗？ | `design-spec.md` 第 3 节 |
| B7 | 抽屉 / 弹层切到别的页再切回来，还能打开吗？ | `output-format.md` 第 1 节 |
| B8 | PDA 作业页是否一屏只露一个当前输入？触控目标是否 ≥ 44px？ | `design-spec.md` 第 4.2 节 |
| B9 | 数字列是否右对齐并带等宽数字？空态是否只有一处？ | `design-spec.md` 第 4.1 节 |
| B10 | 一个区域是否只有一个主按钮？危险操作有没有二次确认入口？ | `design-spec.md` 第 5 节 |
| B11 | 把 `prototypes/00 dist/<端名>.html` 单独拷到空目录双击，该端全部页面能浏览、无死链吗？ | `modules.md` 第 3.3 节 |
| B12 | 界面上有没有租户、订阅、套餐等 SaaS 痕迹？货主是否被写成租户？ | `design-spec.md` 第 8 节 |
| B13 | 顶栏有没有出现部署形态、「当前端：」、运营主体说明或主体切换器？页头页签是否钉住、侧栏能否收起？ | `design-spec.md` 第 3 节、`output-format.md` 第 2 节 |
| B14 | 三个端的登录方式、加载 / 失败 / 重试状态与错误提示是否一致？锁定、令牌刷新、过期与退出登录是否都能走通？ | `output-format.md` 第 2 节、`glossary.md` 第 5 节 |

## 4. C 组：已知缺口

| 缺口 | 现状 | 登记日期 | 来源 |
| --- | --- | --- | --- |
| 演示数据不足一页 | 每页 20 条，当前各页 5–7 行，翻页交互未实测 | 2026-11-06 | 商品档案原型交付自查 |

登记规则：按「文件 + 具体取值」登记，不按整个文件豁免；脚本里的豁免表同步更新；不允许在缺口基础上扩大。

## 5. 不通过的典型形态

- 只说「构建通过了」就交付。
- 跑了 `--fast` 就当验收完成。
- 只验了 `--app` 自己那一个端，没跑全量。
- 源动了产物没变，或产物变了源没动。
- B 组一条没做。
- `module.json` 的 `status` 写了 `delivered`，但版本没递增、负责人空着。
- 端产物侧栏里混进别的端页面，或模块目录下又出现 HTML。

## 6. 交付前清单

1. `node prototypes/build-app.mjs --check` 逐端报 `check ok`。
2. 全量 `verify-delivery.mjs` 退出码 0（不带 `--fast`）。
3. A 组十项结论逐条看过。
4. B 组十四项逐条打勾，B11 单独拷贝试开过。
5. `module.json`：`version` 已递增、`owner` 已填、`status` 置 `delivered`、`deliverables` 指向 `pages/`、`data/`。
6. 若改过 `prototypes/01 shared/`，确认三个端产物都已重建。
7. 交付物打包：`prototypes/00 dist/` 下三个 HTML + 各模块 `pages/`、`data/` 源与 `module.json`。
