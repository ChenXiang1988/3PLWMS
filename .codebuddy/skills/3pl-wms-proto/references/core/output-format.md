# 产物契约与构建链

本文件管「一个端产物长什么样、怎么造出来、造完怎么判合格」，不管视觉细则（`references/shells/`）也不管装配归属（`references/registry.md`）。

## 1. 产物定义

**一个端，一个文件**：`prototypes/dist/<端名>.html`。产物集中在一个目录，模块目录下不放 HTML。

| 要求 | 判据 |
| --- | --- |
| 单文件自包含 | CSS、脚本、演示数据全部内联；无 `<script src>`、无 `<link href>`、无 CDN、无 `http(s)://` 引用 |
| 编码与可打开性 | `<meta charset="utf-8">`；双击本地文件即可浏览该端全部页面 |
| 独立交付 | 产物不引用任何其它端或模块的文件路径 |
| 页面容器 | 每页一个 `<section class="page" data-page-id="<模块ID>/<页key>" hidden>`，切页由内联脚本用 `.page[data-page-id]` 完成 |
| 源指纹 | `<html data-build="<sha256>">`，由构建对全部源文件算出；`--check` 比对 |
| 不入库 | `.gitignore` 忽略 `prototypes/dist/` |
| 交付物 | `dist/<端名>.html` × 5 + 各模块 `pages/`、`data/`、`module.json` 源 |

外壳不同，骨架不同，骨架由构建按 `apps[].shell` 生成，不手写：

| 外壳 | 根容器 | 骨架要点 | 视觉法 |
| --- | --- | --- | --- |
| `admin` | `.wx-app` | 顶栏 → 侧栏 + 页头页签 → 页面容器 | `references/shells/admin.md` |
| `mall` | `.wx-shop-app` | 商城顶栏 → 页面 + 类目导航 → 页面容器 → 页脚 | `references/shells/mall.md` |
| `pda` | `.wx-pda` | 机身 → 状态条 + 导航 + 页面容器 + 按键区 | `references/shells/pda.md` |

三套外壳共用同一份页面容器语义、同一套 `data-*` 交互契约（见 `references/implementation.md` 第 5 节）与同一份登录状态机。

## 2. 五端共性

- **登录层与会话面板**：每个端产物都带同一份，挂在外壳之后、`<script>` 之前，由 `ui.mjs` 的 `renderLogin` / `LOGIN_CSS` / `LOGIN_SCRIPT` 生成。五端的流程、错误码与提示逐字一致。
- **唤起方式分三种**：后台三端是 `gate` 模式，登录前全屏覆盖；商城端与 PDA 是 `entry` 模式，登录层默认隐藏。商城由顶栏「登录」入口唤起；PDA 的登录本身是 `pda-login` 页的设备登录（扫工号牌 / 工号 + PIN / 人脸），共享登录层只留会话与错误表，不再叠一层账号密码表单。模式由 `data-login-gate` 区分。
- **账号密码、验证码、第三方登录**共用一套提交状态机：加载 → 成功或失败 → 重试；连续失败 5 次锁定 60 秒；错误提示只从统一错误表取，不在各端另写一份。
- **令牌**：有效期 60 分钟，五端共用同一个 `TOKEN_SECONDS`；会话面板按「分:秒」展示剩余，刷新重新计时；到期或退出后，后台三端与 PDA 回到登录层，商城端回到访客态首页。
- **货主作用域**：端不渲染顶栏货主下拉；需要收窄的页在筛选区自带「货主」下拉，取值域来自注册表 `owners`。货主端按登录身份限定数据范围，构建期为每个演示身份各渲染一套页面，不渲染货主筛选。
- **商城价格随登录态切换**：`html[data-auth="guest"]` 隐藏金额并显示「登录可见价格」，`member` 显示金额；金额一律由 `ShopPrice` 输出。
- **原型不发起网络请求**：判定规则用本地演示凭据，产物保持单文件自包含。

## 3. 页面模块契约

### 3.1 文件与导出

`prototypes/<模块ID>/pages/<页key>.mjs`（文件名与注册表 `pages[].file` 一致），只允许两类导出：

```js
import { ListPage, StatusTag } from '../../shared/ui.mjs';

export function renderPage(data, ctx) { /* ... */ }
export const PAGE_CSS = ``;
```

| 项 | 约定 |
| --- | --- |
| `data` | 对象，键为页 key；数组自动包成 `{ rows }` |
| `ctx` | `{ moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped, modules }` |
| 返回值 | HTML 字符串，或 `{ html, overlay }`；`overlay` 由构建挂 `<body>` 末尾 |
| `PAGE_CSS` | 可选；类名以「模块前缀 + 页 key」开头 |
| 禁止 | `<script>`、硬编码 hex、跨模块 import、页面内拼大段结构 HTML、数据里塞派生字段 |

### 3.2 演示数据

`prototypes/<模块ID>/data/<页key>.json` 是行数组或 `{ "rows": [], "alerts": [] }` 形态。字段名即列定义的 `key`，列名取 `references/core/glossary.md`。派生列写成页面模块里的纯函数。

文件名必须等于页 key：构建以 `data/<页key>.json` 装载，并以页 key 作为 `data` 对象的键。改文件名等于改页 key，会连带改 `data-page-id`、侧栏与文案登记。

`data/*.json` 也可以是**引用声明**：`{ "ref": "skus", "keys": [...], "fields": [...] }` 或 `{ "ref": "owners" }`。`ref` 指向 `shared/data/` 共享主档，`keys` 按编码过滤并保持声明顺序，`fields` 投影字段，`drop` 排除字段；其余顶层键（如 `categories`、`floors`）原样保留。构建期补齐成完整 `rows` 再交给页面模块，**页面模块与产物不感知主档**。

### 3.3 模板占位符

`templates/` 下的页面模板带占位符，由 `init-module.mjs` 复制并替换：`__MODULE_ID__`、`__MODULE_NAME__`、`__PAGE_KEY__`、`__PAGE_NAME__`、`__PREFIX__`。在 skill 目录里直接 import 模板会报 `ERR_MODULE_NOT_FOUND`。

## 4. 构建链与断言

唯一构建入口：`prototypes/build-app.mjs`（模板 `templates/build-app.mjs`）。

```bash
node prototypes/build-app.mjs            # 构建全部端产物
node prototypes/build-app.mjs --check    # 只做源与产物的漂移检查，不写盘
```

按源码顺序五段：读清单与端分组 → 构建期静态断言 → 页面装配（按 `pages[].app` 聚合） → 外壳合成 → 产物断言与指纹。

| 标签 | 拦什么 |
| --- | --- |
| `[装配清单]` | 端 id 非法、shell 不在 `admin/mall/pda` 内、页面 key 跨模块重复、type 不在五类、app 不在端清单、shop 页归了非商城端、非 shop 页归了商城端、页面文件缺失、数据文件非法 JSON |
| `[模块边界]` | 页面模块跨模块 import |
| `[页面装配]` | 缺 `renderPage`、返回空、页数对不上 |
| `[取值越界]` | 页面模块出现令牌外的 hex、出现 `rpx` |
| `[色型]` | `StatusTag` / `Tag` 传入未定义色型 |
| `[骨架]` | 声明的 type 与所用组件不符（如 list 页摆 `StatRow`） |
| `[命名]` | 自定义类名未带模块前缀 |
| `[页签]` | 非「全部」页签缺 `field` / `value` |
| `[自包含]` | 产物外链、页面模块里出现 `<script>` |
| `[非SaaS]` | 红线词（租户、订阅、套餐等） |
| `[文案]` | 过程文字（TODO、占位符、本期不做等）、残留占位符 |
| `[商城]` | 商城端缺前台外壳 / 进货单入口 / 登录入口，或前台端混用后台外壳 |
| `[PDA]` | PDA 端缺手机外壳、出现侧栏或货主下拉、键位数不足 6、缺状态栏 |
| `[登录]` | 产物缺登录层或统一错误提示表 |
| `[货主端]` | 货主端出现货主下拉与货主筛选，或演示身份视图缺失 |
| `[共享主档]` | `ref` 目标不存在、主档缺行、外键不在主档、编码重复、保留键与页 key 冲突 |
| `[基线]` | `--check` 发现源指纹与产物不一致 |

判据：**构建通过是必要条件，不是充分条件**。`references/core/acceptance.md` 的 B 组人工项仍要逐条过。

## 5. 改源不改产物与并发基线

- 产物是构建结果，不手工编辑、不提交；手改一次下次构建即被覆盖。
- 源指纹覆盖：`build-app.mjs`、`shared/modules.json`、`shared/tokens.css.mjs`、`shared/ui.mjs`、`shared/data/*.json`，以及各端所有 `pages/*.mjs` 与 `data/*.json`。
- 改过 `prototypes/shared/` 任一文件 → 所有端产物重建并重新验收。
- 开工先 `--check` 记 `data-build`，交付前再 `--check`；两次不一致先查并发会话。

## 6. 交付清单

| 项 | 判据 |
| --- | --- |
| 源文件 | 各模块 `module.json`、全部 `pages/*.mjs` 与 `data/*.json`，加上 `build-app.mjs` 与 `shared/`（含主档） |
| 产物 | `prototypes/dist/` 下五个端 HTML 齐全，`--check` 逐端 `check ok` |
| 验收 | `verify-delivery.mjs`（不带 `--fast`）退出码 0 |
| 人工核对 | `references/core/acceptance.md` A、B 两组逐条打勾，C 组不扩大 |
| 清单字段 | `module.json` 的 `version` 已递增、`owner` 已填、`status` 置 `delivered` |
| 独立交付 | 把单个端 HTML 拷到空目录双击，该端全部页面可浏览、无死链 |
