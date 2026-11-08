import { ListPage } from '../../shared/ui.mjs';
import { listProps, PAGE_CSS } from './_list.mjs';

export function renderPage(data, ctx) {
  const { props, overlay } = listProps(data, ctx, { createLabel: '开通货主' });
  return { html: ListPage(props), overlay };
}

export { PAGE_CSS };
