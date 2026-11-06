import { ListPage, StatusTag, dash, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  active: { label: '在职', type: 'enabled' },
  leave: { label: '休假', type: 'pending' },
  resigned: { label: '离职', type: 'disabled' },
};

const labelOf = (s) => (STATUS_META[s] || {}).label || '—';
const toneOf = (s) => (STATUS_META[s] || {}).type || 'info';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.staffStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '在职', count: count('active'), field: 'staffStatus', value: 'active' },
      { label: '休假', count: count('leave'), field: 'staffStatus', value: 'leave' },
      { label: '离职', count: count('resigned'), field: 'staffStatus', value: 'resigned' },
    ],
    filters: [
      { label: '岗位', key: 'position', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.position))] },
      { label: '所属班组', key: 'teamName', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.teamName))] },
      { label: '人员状态', key: 'staffStatus', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.staffStatus))], extra: true },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'staffCode', label: '人员编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'staffName', label: '姓名', width: '120px', render: (r) => dash(r.staffName) },
      { key: 'position', label: '岗位', width: '120px', render: (r) => dash(r.position) },
      { key: 'warehouse', label: '所属仓库', width: '120px', render: (r) => dash(r.warehouse) },
      { key: 'teamName', label: '所属班组', width: '120px', render: (r) => dash(r.teamName) },
      { key: 'qualification', label: '作业资质', width: '160px', render: (r) => dash(r.qualification) },
      { key: 'staffStatus', label: '人员状态', width: '108px', render: (r) => StatusTag(labelOf(r.staffStatus), toneOf(r.staffStatus)) },
      { key: 'entryDate', label: '入职日期', width: '120px', render: (r) => dash(r.entryDate) },
      { key: 'createTime', label: '创建时间', width: '157px', render: (r) => dash(r.createTime) },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-status': r.staffStatus }),
    emptyTitle: '暂无人员',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
