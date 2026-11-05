# 原型产出格式与构建链

本文件是 [SKILL.md](../SKILL.md) 第 3、4、6 步的展开。目录结构见 [modules.md](modules.md) 第 3 节，视觉约束见 [design-spec.md](design-spec.md)。

## 1. 产物定义

**一个端，一个文件**：`prototypes/00 dist/<端名>.html`。产物集中在一个目录，模块目录下不放 HTML。

| 要求 | 判据 |
| --- | --- |
| 单文件自包含 | CSS、脚本、演示数据全部内联；无 `<script src>`、无 `<link href>`、无 CDN、无 `http(s)://` 引用 |
| 编码与可打开性 | `<meta charset="utf-8">`；双击本地文件即可浏览该端全部页面 |
| 独立交付 | 产物不引用任何其它端或模块的文件路径；模块条只列模块名不跳转 |
| 页面容器 | 每页一个 `<section class="page" data-page-id="<模块ID>/<页key>" hidden>`，切页由内联脚本用 `.page[data-page-id]` 完成 |
| 源指纹 | `<html data-build="<sha256>">`，由构建对全部源文件算出；`--check` 比对 |
| 不入库 | `.gitignore` 忽略 `prototypes/00 dist/` 与 `prototypes/*/dist/` |
| 交付物 | `00 dist/<端名>.html` × 4 + 各模块 `pages/`、`data/`、`module.json` 源 |

HTML 骨架（构建生成，不手写）：

```html
<!DOCTYPE html>
<html lang="zh-CN" data-build="...">
<head><meta charset="utf-8"><title>货主端 · 3PL 云仓系统</title>
<style>/* tokens.css.mjs + ui.mjs 的 BASE_CSS + 各页 PAGE_CSS */</style></head>
<body>
  <div class="wx-app">
    <header class="wx-top"><!-- 品牌（产品名 + 端名） / 全局搜索 / 工具与用户 --></header>
    <div class="wx-shell">
      <aside class="wx-side"><!-- 模块分组（data-nav）+ 本端页面（data-target）+ 折叠按钮 --></aside>
      <main class="wx-main">
        <div class="wx-page-header"><!-- 按模块成组的页面页签 + 货主作用域 --></div>
        <div class="wx-page-body"><!-- 各 .page[data-page-id] --></div>
      </main>
    </div>
    <div class="wx-toast" hidden></div>
  </div>
  <div class="wx-login-layer"><!-- 登录页：三种方式 / 加载 / 失败 / 重试 / 锁定 --></div>
  <div class="wx-session" hidden><!-- 登录态 / 令牌剩余 / 刷新 / 退出 --></div>
  <script>/* 统一交互：登录状态机 / 切页 / 侧栏分组与折叠 / 页头页签 / 页签筛选 / 筛选条 / 分页 / 货主作用域 / toast */</script>
</body>
</html>
```

页面容器外的 `<script>` 只有构建内联的**一份**。页面模块里出现 `<script>` 视为违规。

## 2. 顶栏、侧栏、页头与货主作用域

- 顶栏左为品牌（产品名 + 端名副标题），中间全局搜索（按页面名过滤侧栏与页头页签），右侧工具按钮与只读用户块。端名逐字取 [glossary.md](glossary.md) 第 2 节。
- 顶栏不出现「当前端：」、部署形态、运营主体说明、主体切换器；注册表的 `subject` / `edition` 只是装配元数据，不进界面。
- 侧栏按模块分组，一级 `data-nav` 只展开 / 收起，二级 `data-target` 切页；不生成跨端或跨模块链接。
- 页头页签按模块成组（`data-tabs`），切页时只显示当前模块那组；页签 `data-target` 与侧栏二级指向同一 `data-page-id`。
- 货主下拉选项取注册表的 `owners`，首项「全部」。`ownerScoped: true` 的页才显示下拉；切换时按行的 `data-owner` 显隐。
- 切页写 `location.hash`，可刷新、可后退；初始无 hash 时落到本端第一页。
- `.wx-scope{display:flex}` 这类规则必须同时存在全局 `[hidden]{display:none}`。

商城端外壳（`apps[].shell = "mall"`）：根容器 `wx-shop-app`，顶栏是品牌、商品搜索框、进货单、我的订单与采购账号，下方是类目导航条、页面容器与页脚。没有侧栏、页头页签和货主下拉，也不摆装配元信息。类目、搜索、加购、数量增减、去结算、提交订单全由 `MALL_SCRIPT` 的 `data-shop-*` 驱动，产物里仍只有一份内联脚本（外加统一登录脚本）。商城端同样带登录层与会话面板。

登录演示约定：

- 每个端产物都带同一份登录层与会话面板，挂 `.wx-app` 之后、`<script>` 之前，由 `ui.mjs` 的 `renderLogin` / `LOGIN_CSS` / `LOGIN_SCRIPT` 生成，四个端的流程、错误码与提示逐字一致。
- 登录前登录层覆盖全屏；登录成功后隐藏并写入会话态，刷新页面仍保持登录；令牌到期或退出登录时清除并回到登录层。
- 账号密码、验证码、第三方登录共用一套提交状态机：加载 → 成功或失败 → 重试；连续失败 5 次锁定 60 秒；错误提示只从统一错误表取，不在各端另写一份。
- 密码输入框只把摘要交给状态机，明文不留在 DOM 数据流里；会话面板展示令牌剩余时间，可刷新令牌、模拟令牌过期与退出登录。
- 原型不发起网络请求，判定规则用本地演示凭据，产物保持单文件自包含。

## 3. 页面模块契约

### 3.1 文件与导出

`prototypes/<模块ID>/pages/<页key>.mjs`（文件名与注册表 `pages[].file` 一致），只允许两类导出：

```js
import { ListPage, StatusTag } from '../../01 shared/ui.mjs';

export function renderPage(data, ctx) { /* ... */ }
export const PAGE_CSS = ``;
```

| 项 | 约定 |
| --- | --- |
| `data` | 对象，键为 `data/*.json` 的文件名；数组自动包成 `{ rows }` |
| `ctx` | `{ moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped, modules }` |
| 返回值 | HTML 字符串，或 `{ html, overlay }`；`overlay` 由构建挂 `<body>` 末尾 |
| `PAGE_CSS` | 可选；类名以「模块前缀 + 页 key」开头 |
| 禁止 | `<script>`、硬编码 hex、跨模块 import、页面内拼大段结构 HTML、数据里塞派生字段 |

### 3.2 演示数据

`prototypes/<模块ID>/data/<页key>.json` 是行数组或 `{ "rows": [], "alerts": [] }` 形态。字段名即列定义的 `key`，列名取 [glossary.md](glossary.md)。派生列写成页面模块里的纯函数。

### 3.3 模板占位符

`templates/` 下的页面模板带占位符，由 `init-module.mjs` 复制并替换：`__MODULE_ID__`、`__MODULE_NAME__`、`__PAGE_KEY__`、`__PAGE_NAME__`、`__PREFIX__`。模板在 skill 目录里直接 import 会报 `ERR_MODULE_NOT_FOUND`。

## 4. 构建链与构建期断言

唯一构建入口：`prototypes/build-app.mjs`（模板 `templates/build-app.mjs`）。

```bash
node prototypes/build-app.mjs            # 构建四个端产物
node prototypes/build-app.mjs --check   # 只做源与产物的漂移检查，不写盘
```

按源码顺序五段：读清单与端分组 → 构建期静态断言 → 页面装配（按 `pages[].app` 聚合） → 外壳合成 → 产物断言与指纹。

| 标签 | 拦什么 |
| --- | --- |
| `[装配清单]` | 端 id 非法、页面 key 跨模块重复、app 不在端清单、页面文件缺失、数据文件非法 JSON |
| `[模块边界]` | 页面模块跨模块 import |
| `[页面装配]` | 缺 `renderPage`、返回空、页数对不上 |
| `[取值越界]` / `[色型]` / `[骨架]` / `[命名]` | 与 [design-spec.md](design-spec.md) 一致 |
| `[页签]` | 非「全部」页签缺 `field` / `value` |
| `[自包含]` / `[非SaaS]` / `[文案]` | 产物外链、红线词、过程文字、残留占位符 |
| `[商城]` | 商城端缺前台外壳 / 进货单入口，或后台端混用商城外壳 |
| `[基线]` | `--check` 发现源指纹与产物不一致 |

判据：**构建通过是必要条件，不是充分条件**。[acceptance.md](acceptance.md) 的 B 组人工项仍要逐条过。

## 5. 改源不改产物与并发基线

- 产物是构建结果，不手工编辑、不提交；手改一次下次构建即被覆盖。
- 源指纹覆盖：`build-app.mjs`、`01 shared/modules.json`、`01 shared/tokens.css.mjs`、`01 shared/ui.mjs`，以及本端所有 `pages/*.mjs` 与 `data/*.json`。
- 改过 `prototypes/01 shared/` 任一文件 → 所有端产物重建并重新验收。
- 开工先 `--check` 记 `data-build`，交付前再 `--check`；两次不一致先查并发会话。

## 6. 交付清单

| 项 | 判据 |
| --- | --- |
| 源文件 | 各模块 `module.json`、全部 `pages/*.mjs` 与 `data/*.json`，加上 `build-app.mjs` 与 `01 shared/` |
| 产物 | `prototypes/00 dist/` 下四个端 HTML 齐全，`--check` 报 `check ok` |
| 验收 | `verify-delivery.mjs`（不带 `--fast`）退出码 0 |
| 人工核对 | [acceptance.md](acceptance.md) B 组逐条打勾 |
| 清单字段 | `module.json` 的 `version` 已递增、`owner` 已填、`status` 置 `delivered`、`deliverables` 指向 `pages/`、`data/` |
| 独立交付 | 把单个端 HTML 拷到空目录双击，该端全部页面可浏览、无死链 |
