import { parse } from './parser.js';
import { renderHtml } from './renderers/html.js';

function renderHtmlFromBrowser(markup, renderOptions = {}) {
  const commands = parse(markup);
  const createCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };
  return renderHtml({ commands, createCanvas, ...renderOptions });
}

export { parse, renderHtml, renderHtmlFromBrowser };
