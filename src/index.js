import { parse } from './parser.js';
import { renderHtml } from './renderers/html.js';

export function parseAndRenderHtml(markup, renderOptions = {}) {
  const commands = parse(markup);
  return renderHtml({ commands, ...renderOptions });
}

export function renderHtmlFromBrowser(markup, renderOptions = {}) {
  console.warn('renderHtmlFromBrowser is deprecated. Use parseAndRenderHtml instead.');
  return parseAndRenderHtml(markup, renderOptions);
}

export { parse, renderHtml };
