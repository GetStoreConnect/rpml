import { parse } from './parser.js';
import { renderHtml } from './htmlRenderer.js';
import { encodeReceipt } from './printerEncoder.js';

export function parseAndRenderHtml(markup, renderOptions = {}) {
  const commands = parse(markup);
  return renderHtml({ commands, ...renderOptions });
}

export function parseAndEncodeReceipt(markup, encodeOptions = {}) {
  const commands = parse(markup);
  return encodeReceipt({ commands, ...encodeOptions });
}

export { parse, renderHtml, encodeReceipt };
