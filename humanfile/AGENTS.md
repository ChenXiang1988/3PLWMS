# humanfile/ 工作区说明

**本目录是人类书写区，仅约束 `humanfile/`，不涉及仓库其它目录。Agent 对这里只读：不新增、不修改、不删除文件；人类可自由编辑。**

- 本目录不纳入 `docs/index.md` 的文档索引，也不参与 `docs/check.mjs` 的检查。
- 目录内文件是人类草稿，不是规范或真值源。`架构设计.md` 写「一共有三个端」却列出 5 项；端名与端数以 `prototypes/01 shared/modules.json` 的 `apps[]` 为准（货主端、仓网管理端、单仓端、商城端）。
- 现行口径：文档看 `docs/`，字段看 `docs/数据字典/`，端与页面装配看 `prototypes/01 shared/modules.json`，文案枚举看 `.codebuddy/skills/3pl-wms-proto/references/glossary.md`。
