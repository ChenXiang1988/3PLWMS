/**
 * detail 页骨架（模板）。
 *
 * 用法：由 scripts/init-module.mjs 复制到 prototypes/<模块ID>/pages/<页key>.mjs，
 *       并替换 inbound / asn-detail / 入库通知单详情 / ib-asn-detail 占位符。
 *       本文件放在 skill 目录里时，import 的相对路径是相对
 *       prototypes/<模块ID>/pages/ 算的，原地 import 会报 ERR_MODULE_NOT_FOUND。
 *
 * 结构固定四段：抬头字段网格 → 明细表 → 操作轨迹 → 底部操作条。
 * 明细用 BaseTable；本类页面不套状态页签与分页，也不拼大段结构 HTML。
 * 字段标签与按钮文案逐字取 references/glossary.md，不得沿用示例文案。
 */
import { DetailPage, StatusTag, dash, n } from '../../01 shared/ui.mjs';

/* 单据状态中文名与色型取 glossary.md 第 3 节，五种色型之外一律不许传。 */
export const STATUS_META = {
  pending: { label: '待处理', type: 'pending' },
  doing: { label: '进行中', type: 'enabled' },
  exception: { label: '异常待处理', type: 'rejected' },
  completed: { label: '已完成', type: 'disabled' },
  cancelled: { label: '已取消', type: 'disabled' },
};

/**
 * @param {Object} data 键为 data/*.json 的文件名，值已规范化成 { rows, doc, timeline, ... }
 * @param {Object} ctx  { moduleId, moduleName, pageKey, pageName, prefix, type, ownerScoped }
 */
export function renderPage(data, ctx) {
  const { rows = [], doc = {}, timeline = [] } = data[ctx.pageKey] || {};
  const st = STATUS_META[doc.status] || STATUS_META.pending;

  return DetailPage({
    /* 抬头：单据号 + 状态胶囊。不写页内大标题，侧栏已表明当前页。 */
    docNo: doc.docNo || '—',
    status: st.label,
    statusTone: st.type,

    /* 抬头字段：label 逐字取 glossary.md，口径说明放 tip，不摆到版面上。 */
    fields: [
      { label: '货主', value: doc.owner },
      { label: '仓库', value: doc.warehouse },
      { label: '预计到货时间', value: doc.eta },
      { label: '品类数', value: rows.length },
      { label: '计划数量', value: rows.reduce((a, r) => a + Number(r.planQty || 0), 0) },
      { label: '创建时间', value: doc.createdAt, tip: '单据建档时间' },
    ],

    /* 明细表：改这里 —— label 逐字取 glossary.md 对应页面的主要列名。 */
    columns: [
      { key: 'lineNo', label: '行号', width: '80px' },
      { key: 'skuCode', label: '商品编码', width: '160px' },
      { key: 'skuName', label: '商品名称' },
      { key: 'batchNo', label: '批次号', width: '160px' },
      { key: 'planQty', label: '计划数量', width: '120px', align: 'right', render: (r) => n(r.planQty) },
      { key: 'doneQty', label: '已收数量', width: '120px', align: 'right', render: (r) => n(r.doneQty) },
      {
        key: 'lineStatus', label: '行状态', width: '108px',
        render: (r) => StatusTag(r.lineStatus || '待处理', 'pending'),
      },
      { key: 'remark', label: '备注', render: (r) => dash(r.remark) },
    ],
    rows,

    /* 操作轨迹：只放读数（时间、动作、操作人），不放实现说明。 */
    timeline: timeline.map((t) => ({ time: t.time, text: t.text, operator: t.operator })),

    /* 底部操作：一个区域一个主按钮；危险操作给二次确认。 */
    actions: [
      { label: '返回', ghost: true, toast: '返回（原型示意）' },
      { label: '打印', ghost: true, toast: '打印（原型示意）' },
      { label: '确认', primary: true, confirm: '确认后不可撤销，是否继续？', toast: '确认（原型示意）' },
    ],
    note: `本模块：${ctx.moduleName}`,
  });
}

/* 本页自定义样式（可选）。类名一律以 ib-asn-detail 开头。 */
export const PAGE_CSS = ``;
