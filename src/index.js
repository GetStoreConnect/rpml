import { TPMLDocument } from "./tpmlDocument.js";

export function printCommands(tpml, chars) {
  return new TPMLDocument(tpml, chars).toCommands();
}

export function printPreview(tpml, chars) {
  const html = new TPMLDocument(tpml, chars).toHtml();

  return html;
}
