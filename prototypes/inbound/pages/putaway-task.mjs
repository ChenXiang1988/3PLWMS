/**
 * list 页骨架（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/<模块ID>/pages/<页key>.mjs，
 *       并替换 inbound / putaway-task / 上架任务 / ib-putaway-task 占位符。
 *       本文件放在 skill 目录里时，下面那行 import 的相对路径是相对
 *       prototypes/<模块ID>/pages/ 算的，原地 import 会报 ERR_MODULE_NOT_FOUND。
 *
 * 本模板只演示骨架。**列名、页签、按钮文案必须逐字取 references/glossary.md，
 * 不得沿用本文件里的示例列名**；字段名与显示文案分开，字段名用小写驼峰。
 *
 * 三条硬约束（references/design-spec.md 第 4 节）：
 *   1. 结构只走 ListPage，页面模块只写 columns / rows / filters / toolbar / statusTabs。
 *   2. 不加统计卡片、不加页内大标题、不写自绘筛选栏；计数放页签的 count 或 scopeNote。
 *   3. 不在这里拼大段结构 HTML，也不写页面级脚本；交互由 data-* 属性驱动。
 *
 * 四个占位符仅出现在注释与字符串里，复制后由脚本替换；替换不干净会被
 * 构建期 [文案] 拦下。
 */
import { ListPage, StatusTag, Tag, ProgressCell, n, dash, uniq } from '../../01 shared/ui.mjs';

/* 状态 → 中文与胶囊色型。色型只能用 references/glossary.md 第 3 节登记的五种：
   disabled / enabled / info / pending / rejected。传别的会落成构建期 [色型]。 */
export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

/* 派生列写成纯函数，不往 data/*.json 里加展示字段（避免第二份真相）。
   这里给一个从行数据算数量的样例，真实页面按需要替换。 */
export function totalOf(rows = []) {
  return rows.reduce((a, r) => a + Number(r.planQty || 0), 0);
}

/**
 * @param {Object} data 键为 data/*.json 的文件名，值已规范化成 { rows, ... }
 * @param {Object} ctx  { moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped }
 */
export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.status === s).length;

  return ListPage({
    /* 分页单位随页面取：条 / 单 / 行 / 个 / 件。 */
    unit: '条',
    pageSize: 20,

    /* 状态页签：第一个是「全部」，其余每个必须带 field + value，
       否则点了只切高亮不筛数据（构建期 [页签] 会拦）。 */
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '待处理', count: count('pending'), field: 'status', value: 'pending' },
      { label: '进行中', count: count('doing'), field: 'status', value: 'doing' },
      { label: '异常待处理', count: count('exception'), field: 'status', value: 'exception' },
      { label: '已完成', count: count('completed'), field: 'status', value: 'completed' },
    ],

    /* 筛选用 filters 传，key 必须对应行数据字段；select 的 options 从行数据派生。
       extra 的收进「展开全部条件」。 */
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '单据编号', key: 'docNo', type: 'text', placeholder: '请输入单据编号' },
      { label: '创建时间', key: 'createdAt', type: 'daterange', extra: true },
    ],

    /* 工具条文案照 glossary.md 抄；原型里不做真实动作的按钮挂 data-toast。 */
    toolbar: [
      { label: '批量确认', toast: '批量确认（原型示意）' },
      { label: '批量异常登记', ghost: true, toast: '批量异常登记（原型示意）' },
    ],

    /* 计数说明只放计数，不写数据源、不写实现说明。 */
    showCount: true,
    scopeNote: `本模块：${ctx.moduleName}`,

    /* 列定义：改这里 —— label 逐字取 glossary.md 对应页面的主要列名。
       key 必须与行数据字段同名；数字列加 align right；口径说明用 tipKey。 */
    columns: [
      { key: 'docNo', label: '单据编号', width: '160px', cls: 'wx-col-strong' },
      {
        key: 'status', label: '单据状态', width: '108px',
        render: (r) => StatusTag(statusLabel(r.status), (STATUS_META[r.status] || {}).type || 'info'),
      },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      {
        key: 'priority', label: '优先级', width: '108px',
        render: (r) => Tag(r.priority || '—', r.priority === '高' ? 'danger' : 'info'),
      },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'doneQty', label: '已做数量', width: '120px', align: 'right', render: (r) => n(r.doneQty) },
      {
        key: 'progress', label: '作业进度', width: '160px',
        render: (r) => ProgressCell(r.doneQty, r.planQty),
      },
      {
        key: 'sla', label: '时效状态', width: '120px',
        tipKey: '按任务截止时间与当前时间比对得出',
        render: (r) => dash(r.sla),
      },
      { key: 'createdAt', label: '创建时间', width: '157px', render: (r) => dash(r.createdAt) },
    ],

    rows,

    /* 响应顶栏货主下拉的页面必须给每行写 data-owner；其它页面不要写，
       否则会被误当可切货主页。是否 scoped 由注册表的 ownerScoped 决定。 */
    rowAttrs: ctx.ownerScoped
      ? (r) => ({ 'data-owner': r.owner, 'data-status': r.status })
      : (r) => ({ 'data-status': r.status }),

    emptyTitle: '暂无记录',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

/* 本页自定义样式（可选）。类名一律以 ib-putaway-task 开头，
   避免与其它页面的同名类互相覆盖。没有自定义样式就留空。 */
export const PAGE_CSS = ``;
