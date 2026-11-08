import { ListPage } from '../../shared/ui.mjs';
import { listProps, PAGE_CSS } from './_list.mjs';

export function renderPage(data, ctx) {
  const { props, overlay } = listProps(data, ctx, { createLabel: '新增模块' });
  return { html: ListPage(props), overlay };
}

export { PAGE_CSS };
