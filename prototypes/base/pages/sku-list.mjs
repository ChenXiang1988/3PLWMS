import { ListPage, StatusTag, dash, n, uniq } from '../../01 shared/ui.mjs';

export const STATUS_META = {
  active: { label: '启用', type: 'enabled' },
  inactive: { label: '停用', type: 'disabled' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const count = (s) => rows.filter((r) => r.skuStatus === s).length;
  const sameCodeOwners = (r) => dash(
    uniq(rows.filter((x) => x.barcode === r.barcode && x.owner !== r.owner).map((x) => x.owner)).join('，') || ''
  );

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
      { label: '启用', count: count('active'), field: 'skuStatus', value: 'active' },
      { label: '停用', count: count('inactive'), field: 'skuStatus', value: 'inactive' },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '是否效期管理', key: 'shelfLifeManaged', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.shelfLifeManaged))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
    ],
    toolbar: [
      { label: '新增', toast: '新增（原型示意）' },
      { label: '导入', ghost: true, toast: '导入（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
      { label: '停用', ghost: true, toast: '停用（原型示意）' },
    ],
    showCount: true,
    scopeNote: `本模块：${ctx.moduleName}`,
    columns: [
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'spec', label: '规格', render: (r) => dash(r.spec) },
      { key: 'barcode', label: '条码', width: '160px', render: (r) => dash(r.barcode) },
      { key: 'sameCodeOwners', label: '同码货主', width: '120px', render: sameCodeOwners },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'unit', label: '单位', render: (r) => dash(r.unit) },
      { key: 'shelfLifeManaged', label: '是否效期管理', render: (r) => dash(r.shelfLifeManaged) },
      { key: 'batchManaged', label: '是否批次管理', render: (r) => dash(r.batchManaged) },
      { key: 'shelfLifeDays', label: '保质期天数', width: '120px', align: 'right', render: (r) => n(r.shelfLifeDays) },
      { key: 'nearExpiryDays', label: '临期预警天数', width: '120px', align: 'right', render: (r) => n(r.nearExpiryDays) },
      { key: 'skuStatus', label: '商品状态', width: '108px', render: (r) => StatusTag(statusLabel(r.skuStatus), (STATUS_META[r.skuStatus] || {}).type || 'info') },
      { key: 'createdAt', label: '创建时间', width: '157px', render: (r) => dash(r.createdAt) },
    ],
    rows,
    rowAttrs: ctx.ownerScoped
      ? (r) => ({ 'data-owner': r.owner, 'data-status': r.skuStatus })
      : (r) => ({ 'data-status': r.skuStatus }),
    emptyTitle: '暂无商品',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
