import { ListPage, DrawerButton, DagDrawer, StatusTag, n, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  draft: { label: '草稿', type: 'disabled' },
  published: { label: '已发布', type: 'enabled' },
  stopped: { label: '已停用', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [], details = [] } = data[ctx.pageKey] || {};
  const pageId = `${ctx.moduleId}/${ctx.pageKey}`;
  const count = (s) => rows.filter((r) => r.flowStatus === s).length;

  const overlay = rows.map((r) => {
    const d = details.find((x) => x.flowCode === r.flowCode) || {};
    return DagDrawer({
      pageId,
      rowKey: r.flowCode,
      title: '单据工序编排',
      docNo: r.flowCode,
      status: labelOf(r.flowStatus),
      statusTone: toneOf(r.flowStatus),
      fields: d.fields || [],
      graph: { nodes: d.nodes || [], edges: d.edges || [] },
      actions: r.flowStatus === 'draft'
        ? [
          { label: '发布', toast: '发布编排（原型示意）' },
          { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
        ]
        : [
          { label: '另存为新版本', toast: '另存为新版本（原型示意）' },
          { label: '停用', ghost: true, toast: '停用编排（原型示意）' },
          { label: '关闭', ghost: true, attrs: { 'data-drawer-close': '' } },
        ],
    });
  }).join('');

  return {
    html: ListPage({
      unit: '条',
      pageSize: 20,
      statusTabs: [
        { label: '全部', count: rows.length, active: true },
        { label: '草稿', count: count('draft'), field: 'flowStatus', value: 'draft' },
        { label: '已发布', count: count('published'), field: 'flowStatus', value: 'published' },
        { label: '已停用', count: count('stopped'), field: 'flowStatus', value: 'stopped' },
      ],
      filters: [
        { label: '单据类型', key: 'docType', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.docType))] },
        { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
        { label: '品类', key: 'category', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.category))], extra: true },
        { label: '编排编号', key: 'flowCode', type: 'text', placeholder: '请输入编排编号', extra: true },
      ],
      toolbar: [
        { label: '新增', toast: '新增（原型示意）' },
        { label: '从现有复制', ghost: true, toast: '从现有复制（原型示意）' },
        { label: '导出', ghost: true, toast: '导出（原型示意）' },
      ],
      showCount: true,
      columns: [
        { key: 'flowCode', label: '编排编号', width: '140px', cls: 'wx-col-strong' },
        { key: 'docType', label: '单据类型', width: '140px', render: (r) => dash(r.docType) },
        { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
        { key: 'category', label: '品类', width: '108px', render: (r) => dash(r.category) },
        { key: 'version', label: '版本号', width: '96px', render: (r) => dash(r.version) },
        { key: 'flowStatus', label: '编排状态', width: '108px', render: (r) => StatusTag(labelOf(r.flowStatus), toneOf(r.flowStatus)) },
        { key: 'stepCount', label: '工序数', width: '96px', align: 'right', render: (r) => n(r.stepCount) },
        { key: 'updateTime', label: '更新时间', width: '157px', render: (r) => dash(r.updateTime) },
        { key: 'updateBy', label: '更新人', width: '108px', render: (r) => dash(r.updateBy) },
        { key: 'action', label: '操作', width: '108px', render: (r) => DrawerButton({ pageId, rowKey: r.flowCode, label: '查看编排' }) },
      ],
      rows,
      rowAttrs: (r) => ({ 'data-owner': r.owner, 'data-status': r.flowStatus }),
      emptyTitle: '暂无单据工序编排',
      emptyDesc: '当前筛选条件下没有任何记录。',
    }),
    overlay,
  };
}

export const PAGE_CSS = ``;
