---
name: 调研报告迁入docs调研目录
overview: 把 docs/产品需求/ 下 3 份 HTML 调研报告迁入 docs/调研/，加 legacy- 前缀与三个 meta，同步索引与日志；两份 md 做内容比对后决定留存或删除。
todos:
  - id: relax-legacy-check
    content: 改 docs/check.mjs 的 E 段，legacy- 前缀文件只校验索引登记与存在性
    status: completed
  - id: move-html-reports
    content: 迁移三份 HTML 到 docs/调研/ 并重命名为 legacy- 前缀加日期
    status: completed
    dependencies:
      - relax-legacy-check
  - id: inject-meta
    content: 给三份迁入报告补 topic、survey-window、survey-objects 三个 meta
    status: completed
    dependencies:
      - move-html-reports
  - id: sync-indexes
    content: 改 docs/index.md 三行分类与链接，docs/调研/index.md 追加三轮次记录
    status: completed
    dependencies:
      - move-html-reports
  - id: judge-md
    content: 比对两份 md 与对应 HTML，无独有内容则删除，有则迁入并标待办
    status: completed
    dependencies:
      - move-html-reports
  - id: log-and-verify
    content: docs/log.md 留痕，跑 docs/check.mjs 与数据字典 check 验证零新增错误
    status: completed
    dependencies:
      - sync-indexes
      - judge-md
---

## 用户需求

把 `docs/` 下的调研报告统一归入 `docs/调研/`：本次只迁 3 份 HTML，搬运的同时重命名并补齐三个 head meta，章节结构一字不改；文件名加 `legacy-` 前缀，`docs/check.mjs` 跳过这类存量文件；两份 md 比对内容后决定留存或删除。

## 迁移清单

| 现路径 | 迁入后 |
| --- | --- |
| `docs/产品需求/三套对标系统源码调研.html` | `docs/调研/legacy-三套对标系统源码调研-2026-11-08.html` |
| `docs/产品需求/店小秘与领星ERP调研报告.html` | `docs/调研/legacy-店小秘与领星ERP调研报告-2026-11-08.html` |
| `docs/产品需求/货灵ERP与店小秘ERP对比分析.html` | `docs/调研/legacy-货灵ERP与店小秘ERP对比分析-2026-11-08.html` |


## 核心功能

- 三份报告落到 `docs/调研/`，文件名带 `legacy-` 前缀与日期后缀
- 每份补 `topic`、`survey-window`、`survey-objects` 三个 meta，正文不动
- 分类索引登记三行，顶层索引分类由「产品需求」改为「调研」
- 两份 md 比对后处置：无独有内容则删除并留痕，有则迁入并标待办

## 边界

不重排章节、不补截图、不改正文、不动 `docs/国家标准/` 的存量断链。

## 技术栈

沿用现有工具链：Node 原生 ESM 脚本、Markdown 文档体系、无构建无依赖。文件移动用 `fs.renameSync`，避开 PowerShell 中文路径的编码问题。

## 实施方案

1. **先松校验再搬**：`docs/check.mjs` 的 E 段把 `调研/` 下的文件分成两组——非 `legacy-` 的文件走全套校验（文件名、三个 meta、窗口、索引闭环），`legacy-` 的文件只校验「已登记且文件存在」，不查 meta 与窗口。这样迁移过程中不会出现大面积误报。
2. **搬 + 改名一次完成**：用一段 Node 脚本对三份文件执行 `renameSync`，目标目录不存在时先建。搬完立刻校验三份文件仍能独立打开（自包含单文件，无外链依赖）。
3. **补 meta 用定点插入**：读每份 HTML 的 `</title>` 之后位置，插入三行 `<meta>`，避免破坏原有 head 结构。`survey-window` 统一填 `2026-11-08T00:00 / 2026-11-08T23:59`，并在分类索引注明「存量：原始报告未记窗口」。
4. **索引双向对齐**：`docs/index.md` 三行的分类列由 `产品需求` 改为 `调研`、链接改新路径；`docs/调研/index.md` 轮次表追加三行。两处必须同批改，否则 `check.mjs` 的 B 段或 E 段立刻报错。
5. **md 处置靠内容比对**：逐份比对 `店小秘ERP竞品对照.md`、`店小秘与领星ERP菜单结构.md` 与对应 HTML 的报告，判据是三类独有内容——三级菜单原文、来源 URL 清单、帮助中心入口踩坑记录。三类都被覆盖则删除，并在 `docs/log.md` 写清删了什么；有任一类独有则迁入 `docs/调研/` 加 `legacy-` 前缀，并在分类索引记一条「待并入」待办。

## 性能与可靠性

- 迁移是三次 `renameSync`，O(1)，无 IO 放大。
- meta 插入用一次读一次写，三份文件总计约 270 KB，无内存压力。
- 删除不可逆：md 删除前必须把独有内容摘要写进 `docs/log.md`，摘要包含文件、覆盖情况、被删内容要点，便于回溯。

## 实施要点

- `docs/check.mjs` 的 E 段现有逻辑是先 `readdirSync` 过滤 `.html`，再加 `legacy-` 过滤时要保留这部分文件用于索引闭环比对，避免「登记了但被判成孤儿」。
- `docs/index.md` 的分类列必须与路径首段严格一致（B 段校验），`调研/legacy-xxx.html` 对应分类写 `调研`。
- `docs/log.md` 记录类型用「迁入」，该类型已在格式声明的枚举内；记录里不要出现半角竖线。
- 三份 HTML 的 `topic` 取值分别为 `三套对标系统源码调研`、`店小秘与领星ERP调研报告`、`货灵ERP与店小秘ERP对比分析`。