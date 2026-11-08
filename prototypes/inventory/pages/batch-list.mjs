import { ListPage, StatusTag, dash, n, uniq } from '../../shared/ui.mjs';

export const STATUS_META = {
  normal: { label: '正常', type: 'enabled' },
  near: { label: '临期', type: 'pending' },
  hold: { label: '禁售', type: 'rejected' },
  expired: { label: '过期', type: 'rejected' },
};
const statusLabel = (s) => (STATUS_META[s] || {}).label || s || '—';

const DAY = 24 * 60 * 60 * 1000;
const daysLeft = (d) => Math.ceil((new Date(`${d}T00:00:00`).getTime() - Date.now()) / DAY);
const expiryOf = (r) => {
  const left = daysLeft(r.expiryDate);
  if (left < 0) return 'expired';
  if (left <= Number(r.saleBlockDays || 0)) return 'hold';
  if (left <= Number(r.nearExpiryDays || 0)) return 'near';
  return 'normal';
};

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};
  const derived = rows.map((r) => ({ ...r, remainingDays: daysLeft(r.expiryDate), expiryStatus: expiryOf(r) }));
  const count = (s) => derived.filter((r) => r.expiryStatus === s).length;

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: derived.length, active: true },
      { label: '正常', count: count('normal'), field: 'expiryStatus', value: 'normal' },
      { label: '临期', count: count('near'), field: 'expiryStatus', value: 'near' },
      { label: '禁售', count: count('hold'), field: 'expiryStatus', value: 'hold' },
      { label: '过期', count: count('expired'), field: 'expiryStatus', value: 'expired' },
    ],
    filters: [
      { label: '库位编码', key: 'locationCode', type: 'text', placeholder: '请输入库位编码' },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(derived.map((r) => r.owner))] },
    ],
    toolbar: [
      { label: '批量异常登记', toast: '批量异常登记（原型示意）' },
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'batchNo', label: '批次号', width: '160px', render: (r) => dash(r.batchNo) },
      { key: 'productionDate', label: '生产日期', width: '157px', render: (r) => dash(r.productionDate) },
      { key: 'expiryDate', label: '失效日期', width: '157px', tipKey: '按生产日期加保质期天数计算', render: (r) => dash(r.expiryDate) },
      { key: 'remainingDays', label: '剩余天数', width: '120px', align: 'right', tipKey: '按失效日期与当前日期比对得出', render: (r) => n(r.remainingDays) },
      { key: 'expiryStatus', label: '效期状态', width: '108px', tipKey: '按剩余天数与临期预警天数比对得出', render: (r) => StatusTag(statusLabel(r.expiryStatus), (STATUS_META[r.expiryStatus] || {}).type || 'info') },
      { key: 'locationCode', label: '库位编码', width: '160px', render: (r) => dash(r.locationCode) },
      { key: 'qty', label: '在库数量', width: '120px', align: 'right', render: (r) => n(r.qty) },
    ],
    rows: derived,
    rowAttrs: ctx.ownerScoped
      ? (r) => ({ 'data-owner': r.owner, 'data-status': r.expiryStatus })
      : (r) => ({ 'data-status': r.expiryStatus }),
    emptyTitle: '暂无批次',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
