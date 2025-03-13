import { RPMLDocument } from './rpmlDocument.js';

export function printCommands(markup, chars) {
  return new RPMLDocument(markup, chars).toCommands();
}

export function printPreview(markup, chars) {
  const html = new RPMLDocument(markup, chars).toHtml();

  return html;
}
