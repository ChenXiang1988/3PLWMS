import { ListPage, dash, uniq, money } from '../../shared/ui.mjs';


export function renderPage(data, ctx) {
  const { rows = [] } = data[ctx.pageKey] || {};

  return ListPage({
    unit: '条',
    pageSize: 20,
    filters: [
      { label: '商品类目', key: 'category', type: 'select', options: ['全部', ...uniq(rows.map((r) => r.category))] },
      { label: '商品编码', key: 'skuCode', type: 'text', placeholder: '请输入商品编码' },
    ],
    toolbar: [
      { label: '保存', toast: '保存（原型示意）' },
    ],
    showCount: true,
    columns: [
      { key: 'skuCode', label: '商品编码', width: '160px', cls: 'wx-col-strong' },
      { key: 'skuName', label: '商品名称' },
      { key: 'price', label: '单价', width: '120px', align: 'right', render: (r) => money(r.price) },
      { key: 'ladderPrice', label: '阶梯价', width: '160px', render: (r) => dash(r.ladderPrice) },
      { key: 'guestVisible', label: '访客可见', width: '108px' },
      { key: 'memberVisible', label: '登录可见', width: '108px' },
    ],
    rows,
    emptyTitle: '暂无价格',
    emptyDesc: '当前筛选条件下没有任何记录。',
  });
}

export const PAGE_CSS = ``;
