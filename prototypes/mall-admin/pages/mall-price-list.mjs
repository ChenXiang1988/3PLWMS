import { ListPage, Tag, dash, uniq } from '../../shared/ui.mjs';

const money = (v) => (v == null || v === '' ? '—' : `￥${Number(v).toFixed(2)}`);

export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};

  return ListPage({
    unit: '条',
    pageSize: 20,
    statusTabs: [
      { label: '全部', count: rows.length, active: true },
    ],
    filters: [
      { label: '货主', key: 'owner', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.owner))] },
      { label: '访客可见', key: 'guestVisible', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.guestVisible))], extra: true },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码', extra: true },
    ],
    toolbar: [
      { label: '导出', ghost: true, toast: '导出（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称', render: (r) => dash(r.skuName) },
      { key: 'owner', label: '货主', width: '120px', render: (r) => dash(r.owner) },
      { key: 'price', label: '单价', width: '120px', align: 'right', render: (r) => money(r.price) },
      { key: 'ladderPrice', label: '阶梯价', width: '160px', render: (r) => dash(r.ladderPrice) },
      { key: 'guestVisible', label: '访客可见', width: '108px', render: (r) => Tag(dash(r.guestVisible), r.guestVisible === '否' ? 'info' : 'default') },
      { key: 'memberVisible', label: '登录可见', width: '108px', render: (r) => Tag(dash(r.memberVisible), r.memberVisible === '否' ? 'info' : 'default') },
    ],
    rows,
    rowAttrs: (r) => ({ 'data-owner': r.owner }),
    emptyTitle: '暂无价格记录',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
