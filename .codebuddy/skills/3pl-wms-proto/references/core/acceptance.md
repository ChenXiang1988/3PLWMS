# 验收标准

判定方式分三类：**可执行**（脚本或构建跑）、**人工核对**（看图或读文案）、**已知缺口**（已登记，只禁新增）。一次交付要同时满足 A、B 两组。

## 1. 判定方式

```bash
node .codebuddy/skills/3pl-wms-proto/scripts/verify-delivery.mjs --app owner-app
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
| A5 | 产物格式：五个端 HTML 单文件自包含、有 `data-build`、页容器齐全、无红线禁语 | 产物正文扫描 | S5 |
| A6 | 产物集中且不入库 | 只有 `prototypes/dist/` 有 HTML；`.gitignore` 忽略产物目录 | S5 |
| A7 | 源与产物一致 | `node prototypes/build-app.mjs --check` 逐端报 `check ok` | X 组 |
| A8 | 构建期全部断言通过 | 构建无抛错，标签见 `output-format.md` 第 4 节 | 构建时自动 |
| A9 | 状态胶囊色型在五值内 | 无 `ok` / `out` / `low` 等未定义色型 | 构建期 `[色型]` |
| A10 | 页签真能筛数据 | 每个非「全部」页签有 `field` / `value`，行上有对应字段 | 构建期 `[页签]` |
| A11 | 货主端按登录身份隔离 | 产物无货主下拉与货主筛选、两个演示身份视图齐全、单套页面内不出现其它货主数据 | 构建期 `[货主端]` |
| A12 | 共享主档单一事实源 | 主档文件齐全、各页 `ref` 可解析、外键均在主档、主档改动触发 `--check` 漂移 | 构建期 `[共享主档]` |
| A13 | 预留页面不落地空壳 | 未分配 `app` 的页面在模块 `pages/` 与 `data/` 下没有模板与空数据文件 | 源码扫描 |
| A14 | 外壳不串味 | 后台端无商城外壳元素、商城端无侧栏与页头页签、PDA 端无侧栏与货主下拉且有状态条与六键 | 构建期 `[商城]`、`[PDA]` |

## 3. B 组：人工核对项

正确性（B1–B16）：

| 编号 | 判据 | 出处 |
| --- | --- | --- |
| B1 | 端名、模块名、页面名、页签、列名是否逐字核对过 `glossary.md`？ | `references/core/glossary.md` 第 1 节 |
| B2 | 页面上有没有实现说明、设计注解、操作指引、「本期不做」这类文字？ | `references/core/glossary.md` 第 1 节 |
| B3 | 指标定义、口径边界、设计理由是否都收进 `tipKey` / `title`？ | 同上 |
| B4 | 分页真的能切到第 2 页吗？切过去行变了没有？ | `references/core/output-format.md` 第 3 节 |
| B5 | 状态页签点下去，行是否真的变少？「全部」能否还原？ | `references/shells/admin.md` 4.1 |
| B6 | 需要按货主收窄的页是否都给了「货主」筛选？选一个货主后行数变了吗？货主端是否完全没有货主筛选、两个演示身份进去各自只看到自己的数据？ | `references/shells/admin.md` 第 3 节 |
| B7 | 抽屉 / 弹层切到别的页再切回来，还能打开吗？ | `references/core/output-format.md` 第 1 节 |
| B8 | PDA 作业页是否一屏只露一个当前输入？触控目标是否 ≥ 44px？ | `references/shells/pda.md` 第 4 节 |
| B9 | 数字列是否右对齐并带等宽数字？空态是否只有一处？ | `references/shells/admin.md` 4.1 |
| B10 | 一个区域是否只有一个主按钮？危险操作有没有二次确认入口？ | `references/implementation.md` 第 3 节 |
| B11 | 把 `prototypes/dist/<端名>.html` 单独拷到空目录双击，该端全部页面能浏览、无死链吗？ | `references/registry.md` 5.2 |
| B12 | 界面上有没有租户、订阅、套餐等 SaaS 痕迹？货主是否被写成租户？ | `references/core/glossary.md` 第 7 节 |
| B13 | 顶栏有没有出现部署形态、「当前端：」、运营主体说明或主体切换器？页头页签是否钉住、侧栏能否收起？ | `references/shells/admin.md` 第 3 节 |
| B14 | 五个端的登录方式、加载 / 失败 / 重试状态与错误提示是否一致？锁定、令牌刷新、过期与退出登录是否都能走通？ | `references/core/output-format.md` 第 2 节、`references/core/glossary.md` 第 5 节 |
| B15 | 商城端是不是前台外壳（无侧栏、无页头页签）？类目、搜索、加购、数量增减、去结算、提交订单点下去有没有反应？ | `references/shells/mall.md` 第 3、4 节 |
| B16 | 商城端首屏是不是首页而不是登录页？顶栏与首页有没有登录入口？访客态金额是否全部隐藏并显示「登录可见价格」，登录 / 刷新 / 令牌过期 / 退出后两种形态是否都切得回来？ | `references/shells/mall.md` 第 3 节、`references/core/output-format.md` 第 2 节 |

视觉与体验（B17–B22，本组靠肉眼与键盘，不靠脚本）：

| 编号 | 判据 | 出处 |
| --- | --- | --- |
| B17 | 层级是否成立：页级 / 块级 / 行级三级在同一屏内可辨，且不是只靠字号拉（字重与留白至少各用上一次）？ | 对应 `references/shells/*.md` 的「层级与节奏」 |
| B18 | 强调色是否守预算：一屏只有一处主色强调，状态色只出现在状态位，没有彩色底块与装饰用色？ | 对应 `references/shells/*.md` 的「强调色纪律」 |
| B19 | 交互态是否可感知：Tab 键走一遍，焦点是否可见；按下、hover 是否有反馈且不跳动？ | `references/implementation.md` 2.1 |
| B20 | 空态 / 错误态 / 访客态是否都设计过，且都撑住了版式（不塌、不留整屏空白）？ | `references/shells/*.md` 的禁区表 |
| B21 | 走一遍三分屏（1440 / 1024 / 768）：有没有横向溢出、文字截断丢字、卡片挤压变形？ | `references/shells/admin.md` 第 2 节、`references/shells/mall.md` 2 |
| B22 | 把两个不同页面的截图并排：除了内容不同，结构是否真的按类型分了（列表不长成报表、报表不长成列表）？ | `references/registry.md` 第 3 节 |

## 4. C 组：已知缺口

| 缺口 | 现状 | 登记日期 | 来源 |
| --- | --- | --- | --- |
| 演示数据不足一页 | 每页 20 条，当前各页 5–7 行，翻页交互未实测 | 2026-11-06 | 商品档案原型交付自查 |
| 焦点不可见 | 全库无 `:focus-visible` 规则，两处搜索框 `outline:none` 无替代，B19 当前必然不通过 | 2026-11-06 | 规范分层升级 |
| 层级只靠字号 | 无字重与行高令牌，B17 的「三件套」只能部分成立 | 2026-11-06 | 规范分层升级 |
| 信息色与主色接近 | `--wx-info-500` 与 `--wx-primary-500` 色相接近，状态胶囊与主色易混 | 2026-11-06 | 规范分层升级 |

登记规则：按「文件 + 具体取值」登记，不按整个文件豁免；脚本里的豁免表同步更新；不允许在缺口基础上扩大。缺口修掉后从本表删除，并在 `references/core/anti-patterns.md` 留一条反向条目。

## 5. 不通过的典型形态

- 只说「构建通过了」就交付。
- 跑了 `--fast` 就当验收完成。
- 只验了 `--app` 自己那一个端，没跑全量。
- 源动了产物没变，或产物变了源没动。
- B 组一条没做，或只做了 B1–B16 没看 B17–B22。
- `module.json` 的 `status` 写了 `delivered`，但版本没递增、负责人空着。
- 端产物侧栏里混进别的端页面，或模块目录下又出现 HTML。

## 6. 交付前清单

1. `node prototypes/build-app.mjs --check` 逐端报 `check ok`。
2. 全量 `verify-delivery.mjs` 退出码 0（不带 `--fast`）。
3. A 组十四项结论逐条看过。
4. B 组逐条打勾：B11 单独拷贝试开过，B16 两种登录形态都走过，B19 用键盘走过，B21 三个宽度都看过。
5. `module.json`：`version` 已递增、`owner` 已填、`status` 置 `delivered`、`deliverables` 指向 `pages/`、`data/`。
6. 若改过 `prototypes/shared/`，确认五个端产物都已重建。
7. 交付物打包：`prototypes/dist/` 下五个 HTML + 各模块 `pages/`、`data/` 源与 `module.json`。
