import { parse } from './parser.js';
import { renderHtml } from './htmlRenderer.js';
import { printReceipt, printerModels } from './printer.js';

export function parseAndRenderHtml(markup, renderOptions = {}) {
  const commands = parse(markup);
  return renderHtml({ commands, ...renderOptions });
}

export function renderHtmlFromBrowser(markup, renderOptions = {}) {
  console.warn('renderHtmlFromBrowser is deprecated. Use parseAndRenderHtml instead.');
  return parseAndRenderHtml(markup, renderOptions);
}

export function parseAndPrintReceipt(markup, printOptions = {}) {
  const commands = parse(markup);
  return printReceipt({ commands, ...printOptions });
}

export { parse, renderHtml, printReceipt, printerModels };
