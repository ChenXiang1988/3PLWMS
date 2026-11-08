import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
    draft: { label: '草稿', type: 'pending' },
    published: { label: '已发布', type: 'enabled' },
    disabled: { label: '已停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || s || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.flowStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 10,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '草稿', count: count('draft'), field: 'flowStatus', value: 'draft' },
      { label: '已发布', count: count('published'), field: 'flowStatus', value: 'published' },
      { label: '已停用', count: count('disabled'), field: 'flowStatus', value: 'disabled' },
    ],
    filters: [
      { label: '单据类型', key: 'docType', type: 'text', placeholder: '请输入单据类型' },
      { label: '更新时间', key: 'updateTime', type: 'daterange', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'flowCode', label: '流程编码', width: '140px', render: (r) => dash(r.flowCode) },
      { key: 'docType', label: '单据类型', render: (r) => dash(r.docType) },
      { key: 'nodeSeq', label: '节点序号', width: '90px', align: 'right', render: (r) => n(r.nodeSeq) },
      { key: 'nodeName', label: '节点名称', render: (r) => dash(r.nodeName) },
      { key: 'approverRole', label: '审批角色', render: (r) => dash(r.approverRole) },
      { key: 'timeoutHours', label: '超时小时', width: '100px', align: 'right', render: (r) => n(r.timeoutHours) },
      { key: 'escalateTo', label: '升级对象', render: (r) => dash(r.escalateTo) },
      { key: 'flowStatus', label: '状态', width: '90px', render: (r) => StatusTag(labelOf(r.flowStatus), toneOf(r.flowStatus)) },
      { key: 'version', label: '版本', width: '80px', render: (r) => dash(r.version) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.flowStatus }),
    emptyTitle: '暂无审批流配置',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
