import { expect } from 'chai';
import { createCanvas } from 'canvas';
import {
  applyCommand,
  applyLineCommand,
  applyNewlineCommand,
  applyRichContentCommand,
  buildBlockClasses,
  buildContentClasses,
  calculateDocWidth,
  css,
  renderBarcode,
  renderCut,
  renderHtmlWithCanvas,
  renderImage,
  renderQRCode,
  renderRichContent,
  renderRule,
  renderTable,
  renderTableCell,
  renderTableCellMargin,
  renderTextBlock,
  wrapDocument,
} from '../src/htmlRenderer.js';

describe('HTML Renderer', () => {
  const buildState = (state = {}) => ({
    html: '',
    styles: buildStyles(),
    chars: 32,
    docWidth: 300,
    wordWrap: false,
    pendingText: '',
    ...state,
  });

  const buildStyles = (styles = {}) => ({
    alignment: 'left',
    size: 1,
    bold: false,
    italic: false,
    underline: false,
    invert: false,
    small: false,
    ...styles,
  });

  describe('calculateDocWidth', () => {
    it('correctly calculates document width based on character count', () => {
      const width = calculateDocWidth({
        createCanvas,
        chars: 32,
        fontFamily: 'monospace',
        fontSize: '14px',
      });

      expect(width).to.be.a('number');
      expect(width).to.be.greaterThan(0);
    });
  });

  describe('applyCommand', () => {
    it('handles alignment commands', () => {
      const state = buildState();

      applyCommand({ command: { name: 'left' }, state });
      expect(state.styles.alignment).to.equal('left');

      applyCommand({ command: { name: 'center' }, state });
      expect(state.styles.alignment).to.equal('center');

      applyCommand({ command: { name: 'right' }, state });
      expect(state.styles.alignment).to.equal('right');
    });

    it('handles size command', () => {
      const state = buildState();
      const command = { name: 'size', value: 2 };

      applyCommand({ command, state });
      expect(state.styles.size).to.equal(2);
    });

    it('handles style commands (bold, italic, etc)', () => {
      const state = buildState();

      applyCommand({ command: { name: 'bold' }, state });
      expect(state.styles.bold).to.equal(true);

      applyCommand({ command: { name: 'bold', off: true }, state });
      expect(state.styles.bold).to.equal(false);

      applyCommand({ command: { name: 'italic' }, state });
      expect(state.styles.italic).to.equal(true);
    });

    it('adds text to state', () => {
      const command = { name: 'text', value: 'bar' };
      const state = buildState({ pendingText: 'foo' });

      applyCommand({ command, state });
      expect(state.pendingText).to.eq('foobar');
    });
  });

  describe('applyLineCommand', () => {
    it('adds pending text', () => {
      const command = { name: 'line', value: 'World' };
      const state = buildState({ pendingText: 'Hello' });

      applyLineCommand({ command, state });
      expect(state.html).to.include('HelloWorld');
      expect(state.pendingText).to.equal('');
    });
  });

  describe('applyNewlineCommand', () => {
    it('adds br tags for newlines', () => {
      const command = { name: 'newline', value: 2 };
      const state = buildState();

      applyNewlineCommand({ command, state });
      expect(state.html).to.include('<br><br>');
    });

    it('adds pending text', () => {
      const command = { name: 'newline', value: 2 };
      const state = buildState({ pendingText: 'Hello' });

      applyNewlineCommand({ command, state });
      expect(state.html).to.include('Hello');
      expect(state.html).to.include('<br>');
      expect(state.html).to.not.include('<br><br>');
    });
  });

  describe('applyRichContentCommand', () => {
    it('inserts pending text before a non text command', () => {
      const command = { name: 'rule', attributes: { line: 'dashed' } };
      const state = buildState({ pendingText: 'Hello' });

      applyRichContentCommand({ command, state });
      expect(state.html).to.match(/Hello.*rpml-rule/s);
      expect(state.pendingText).to.equal('');
    });
  });

  describe('renderRichContent', () => {
    it('routes to the correct render function based on command name', () => {
      const state = buildState();

      const imageCmd = { name: 'image', attributes: { src: 'test.png' } };
      expect(renderRichContent({ command: imageCmd, state })).to.include('img');

      const ruleCmd = { name: 'rule', attributes: {} };
      expect(renderRichContent({ command: ruleCmd, state })).to.include('rpml-rule');
    });
  });

  describe('renderRule', () => {
    it('renders a dashed rule', () => {
      const command = {
        name: 'rule',
        attributes: {
          line: 'dashed',
          width: 20,
        },
      };
      const state = { chars: 32, styles: { alignment: 'center' } };

      const output = renderRule({ command, state });
      expect(output).to.include('rpml-rule-dashed');
      expect(output).to.include('rpml-center');
      expect(output).to.include('--------------------');
    });

    it('renders a double dashed rule', () => {
      const command = {
        attributes: {
          line: 'dashed',
          styles: 'double',
          width: 10,
        },
      };
      const state = { chars: 32, styles: { alignment: 'left' } };

      const output = renderRule({ command, state });
      expect(output).to.include('rpml-rule-dashed');
      expect(output).to.include('==========');
    });

    it('renders a solid rule with width percentage', () => {
      const command = {
        attributes: {
          line: 'solid',
          width: 16,
        },
      };
      const state = { chars: 32, styles: { alignment: 'left' } };

      const output = renderRule({ command, state });
      expect(output).to.include('width: 50%');
    });

    it('renders a double rule', () => {
      const command = { attributes: { line: 'solid', style: 'double' } };
      const state = { chars: 32, styles: { alignment: 'left' } };
      const output = renderRule({ command, state });
      const expectedOutput =
        '<div class="rpml-block rpml-left rpml-rule" style="position:relative;"><div class="rpml-rule-solid" style="width: 100%; border-bottom: 1px solid black; height: 3px;"></div></div>';
      expect(output).to.equal(expectedOutput);
    });
  });

  describe('renderImage', () => {
    it('renders image with all attributes', () => {
      const command = {
        name: 'image',
        attributes: {
          src: 'test.png',
          size: 80,
        },
      };
      const styles = { alignment: 'center' };

      const output = renderImage({ command, styles });
      expect(output).to.include('rpml-img-wrapper');
      expect(output).to.include('src="test.png"');
      expect(output).to.include('width="80%"');
      expect(output).to.include('rpml-center');
    });

    it('renders image without size attribute', () => {
      const command = { name: 'image', attributes: { src: 'test.png' } };
      const styles = { alignment: 'left' };

      const output = renderImage({ command, styles });
      expect(output).to.include('src="test.png"');
      expect(output).not.to.include('width=');
    });
  });

  describe('renderTable', () => {
    it('renders a simple table', () => {
      const command = {
        name: 'table',
        attributes: {
          cols: 2,
          rows: [
            ['Item', 'Price'],
            ['Product', '$10.99'],
          ],
        },
      };
      const state = buildState();

      const output = renderTable({ command, state });
      expect(output).to.include('<table class="rpml-table">');
      expect(output).to.include('<tr class="rpml-tr">');
      expect(output).to.include('Item');
      expect(output).to.include('Price');
      expect(output).to.include('Product');
      expect(output).to.include('$10.99');
    });

    it('renders a table with margin and alignment', () => {
      const command = {
        name: 'table',
        attributes: {
          cols: 2,
          rows: [['Left', 'Right']],
          margin: 1,
          align: ['left', 'right'],
        },
      };
      const state = buildState();

      const output = renderTable({ command, state });
      expect(output).to.include('text-align: left');
      expect(output).to.include('text-align: right');
      expect(output).to.include('&nbsp;'); // margin cell
    });
  });

  describe('renderTableCell and renderTableCellMargin', () => {
    it('calculates cell width correctly with explicit widths', () => {
      const command = {
        attributes: {
          cols: 2,
          width: [10, '*'],
        },
      };
      const state = { chars: 32, docWidth: 300 };
      const content = 'Test';

      const output = renderTableCell({
        content,
        index: 0,
        contentClasses: '',
        margin: 0,
        command,
        state,
      });

      expect(output).to.include('data-cols="10"');
      expect(output).to.include('width: 93.75px');
    });

    it('calculates margin cell width', () => {
      const state = { chars: 32, docWidth: 300 };
      const output = renderTableCellMargin({
        contentClasses: 'test-class',
        margin: 2,
        state,
      });

      expect(output).to.include('data-cols="2"');
      expect(output).to.include('width: 18.75px');
      expect(output).to.include('test-class');
    });
  });

  describe('renderBarcode and renderQRCode', () => {
    it('renders a barcode', () => {
      const command = {
        name: 'barcode',
        attributes: {
          data: '12345678',
          type: 'CODE128',
        },
      };
      const styles = { alignment: 'center' };

      const output = renderBarcode({ command, styles });
      expect(output).to.include('rpml-barcode');
      expect(output).to.include('rpml-center');
      expect(output).to.include('data=12345678');
      expect(output).to.include('code=CODE128');
    });

    it('renders a QR code', () => {
      const command = {
        name: 'qrcode',
        attributes: {
          data: 'https://example.com',
          size: 4,
        },
      };
      const styles = { alignment: 'center' };

      const output = renderQRCode({ command, styles });
      expect(output).to.include('rpml-qrcode');
      expect(output).to.include('size=84x84');
      expect(output).to.include('data=https://example.com');
    });
  });

  describe('buildContentClasses and buildBlockClasses', () => {
    it('builds content classes with all styles', () => {
      const styles = {
        small: true,
        bold: true,
        italic: true,
        underline: true,
        invert: true,
      };

      const output = buildContentClasses({ styles });
      expect(output).to.include('rpml-small');
      expect(output).to.include('rpml-bold');
      expect(output).to.include('rpml-italic');
      expect(output).to.include('rpml-underline');
      expect(output).to.include('rpml-invert');
    });

    it('builds block classes with alignment and size', () => {
      const command = { name: 'line' };
      const styles = { alignment: 'center', size: 2 };

      const output = buildBlockClasses({ command, styles });
      expect(output).to.equal('rpml-block rpml-center rpml-size-2');
    });
  });

  describe('renderCut', () => {
    it('renders div for cut', () => {
      const command = { name: 'cut', value: 'partial' };
      const output = renderCut({ command });
      expect(output).to.include('<div class="rpml-cut-partial"></div>');
    });
  });

  describe('wrapDocument', () => {
    it('wraps content in HTML document structure with proper styles', () => {
      const state = {
        html: '<div>Test Content</div>',
        docWidth: 300,
        wordWrap: true,
      };

      const output = wrapDocument({
        state,
        fontFamily: 'Arial',
        fontSize: '12px',
        lineHeight: '1.2em',
      });

      expect(output).to.include('<html>');
      expect(output).to.include('<body class="rpml-body">');
      expect(output).to.include('width: 300px');
      expect(output).to.include('word-wrap: break-word');
      expect(output).to.include('font-family: Arial');
      expect(output).to.include('font-size: 12px');
      expect(output).to.include('<div>Test Content</div>');
    });
  });

  describe('renderHtmlWithCanvas', () => {
    it('renders a simple document', () => {
      const commands = [
        { name: 'document', attributes: { wordWrap: true, bottomMargin: 3, cut: 'full' } },
        { name: 'text', value: 'Hello' },
      ];
      const output = renderHtmlWithCanvas({ commands, createCanvas });

      const expectedOutput = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body class="rpml-body">
        <div class="rpml-receipt" style="width: 269.71875px; margin: 0 auto;word-wrap: break-word;font-family: monospace; font-size: 14px; line-height: 1.3em;">
          ${renderTextBlock({ text: 'Hello', state: buildState() })}
<br><br>${renderCut({ command: { name: 'cut', value: 'full' } })}

        </div>
      </body>
    </html>
  `;

      expect(output).to.equal(expectedOutput);
    });
  });
});
