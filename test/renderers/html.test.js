import { expect } from 'chai';
import { createCanvas } from 'canvas';
import { parse } from '../../src/parser.js';
import {
  applyCommand,
  buildBlockClasses,
  buildContentClasses,
  calculateDocWidth,
  css,
  renderBarcode,
  renderContent,
  renderHtmlWithCanvas,
  renderImage,
  renderLine,
  renderQRCode,
  renderRule,
  renderTable,
  renderTableCell,
  renderTableCellMargin,
  renderText,
  wrapDocument,
} from '../../src/renderers/html.js';

describe('HTML Renderer', () => {
  const buildState = (state = {}) => ({
    html: '',
    previousContentCommand: null,
    styles: buildStyles(),
    chars: 32,
    docWidth: 300,
    wordWrap: false,
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
    it('handles document command', () => {
      const state = buildState();
      const command = { name: 'document', attributes: { wordWrap: true } };

      applyCommand({ command, state });
      expect(state.wordWrap).to.equal(true);
    });

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

    it('handles cut command', () => {
      const state = buildState();
      const command = { name: 'cut', value: 'partial' };

      applyCommand({ command, state });
      expect(state).to.deep.equal(buildState());
    });
  });

  describe('renderContent', () => {
    it('routes to the correct render function based on command name', () => {
      const state = buildState();

      const imageCmd = { name: 'image', attributes: { src: 'test.png' } };
      expect(renderContent({ command: imageCmd, state })).to.include('img');

      const lineCmd = { name: 'line' };
      expect(renderContent({ command: lineCmd, state })).to.include('div');

      const ruleCmd = { name: 'rule', attributes: {} };
      expect(renderContent({ command: ruleCmd, state })).to.include('rpml-rule');
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

  describe('renderLine', () => {
    it('renders a line break if previous command was text', () => {
      const command = { name: 'line' };
      const state = buildState({ previousContentCommand: { name: 'text' } });
      const output = renderLine({ command, state });
      expect(output).to.equal('<br>');
    });

    it('renders a div with proper classes when not following text', () => {
      const command = { name: 'line', value: 'Hello' };
      const state = buildState();

      const output = renderLine({ command, state });
      expect(output).to.include('<div class="rpml-block rpml-left rpml-size-1">');
      expect(output).to.include('<span class="">Hello</span>');
    });
  });

  describe('renderText', () => {
    it('renders text with proper styling', () => {
      const command = { name: 'text', value: 'Test Text' };
      const styles = { bold: true, italic: true };

      const output = renderText({ command, styles });
      expect(output).to.include('<span class="rpml-bold rpml-italic">Test Text</span>');
    });

    it('handles empty text value', () => {
      const command = { name: 'text' };
      const styles = {};

      const output = renderText({ command, styles });
      expect(output).to.equal('<span class=""></span>');
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

  it('correctly parses the entire RPML markup', () => {
    const markup = `
{document
word-wrap=true
}
{# header }
{center}
{image
src="https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189"
size=80
dither=atkinson
}
{line}
LAYBY DOCKET
{line}
{bold}
Mountain Outfitters
{endBold}
Boulder Megastore
{line}
ABN 123456789
{line}
123 Boulder Rd, Boulder, WA 6432
Ph: 08 9022 1234
{left}
{line}
{table
cols=2
margin=1
align=[left,right]
row=["09/09/2023", "12:34:56PM"]
}
{# items }
{line}
{bold}
{table
cols=3
margin=1
align=[left,right,right]
width=[*,4,8]
row=["Item","Qty","Total"]
}
{endBold}
{rule}
{table
cols=3
margin=1
align=[left,right,right]
width=[*,4,8]
row=["Plain T-Shirt", "1", "$10.99"]
row=["123456 @$10.99 ea.", "", ""]
row=["Black Jeans", "1", "$29.99"]
row=["654321 @$29.99 ea.", "", ""]
row=["Baseball Cap", "12", "$9.99"]
row=["987654 @$9.99 ea.", "", ""]
row=["Shoes", "2", "$99.98"]
row=["456789 @$49.99 ea.", "", ""]
row=["Socks", "1", "$1.99"]
row=["987654 @$1.99 ea.", "", ""]
}
{# total }
{center}
{rule}
{left}
{table
cols=2
margin=1
align=[left,right]
width=[*,8]
row=["Subtotal","$102.95"]
row=["Tax","$10.30"]
}
{bold}
{table
cols=2
margin=1
align=[left,right]
width=[*,8]
row=["Total","$113.25"]
}
{endBold}
{line}
{table
cols=2
margin=1
align=[left,right]
width=[*,8]
row=["Cash","$120.00"]
row=["Change","-$6.75"]
}
{bold}
{table
cols=2
margin=1
align=[left,right]
width=[*,8]
row=["Balance","$0.00"]
}
{endBold}
{line}
{table
cols=2
margin=1
align=[left,right]
width=[10,*]
row=["Reference","SC1234567890"]
row=["Staff","JD"]
row=["Customer","Jane Smith"]
row=["Email","js@example.com"]
row=["Phone","0400 123 456"]
}
{line}
{center}
{qrcode
data="https://example.com/orders/1234567890"
size=6
model=1
}
{# layby }
{line}
{rule}
{line}
{bold}
{left}
Layby Terms & Conditions
{endBold}
1) Maximum layby period 3 months
2) Payments due every 2 weeks
3) Cancellations incur 10% fee
`;

    const output = renderHtmlWithCanvas({ commands: parse(markup), createCanvas });
    const expectedOutput = `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body class="rpml-body">
        <div class="rpml-receipt" style="width: 269.71875px; margin: 0 auto;word-wrap: break-word;font-family: monospace; font-size: 14px; line-height: 1.3em;">
          <div class="rpml-block rpml-center rpml-img-wrapper"><img class="rpml-img" src="https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189" width="80%"></div>
<div class="rpml-block rpml-center rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class="">LAYBY DOCKET</span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class="rpml-bold">Mountain Outfitters</span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class="">Boulder Megastore</span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class="">ABN 123456789</span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class="">123 Boulder Rd, Boulder, WA 6432</span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class="">Ph: 08 9022 1234</span></div>
<div class="rpml-block rpml-left rpml-size-1"><span class=""></span></div>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="15" class=" rpml-td" style="text-align: left; width: 126.4306640625px; max-width: 126.4306640625px; min-width: 126.4306640625px;">09/09/2023</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="15" class=" rpml-td" style="text-align: right; width: 126.4306640625px; max-width: 126.4306640625px; min-width: 126.4306640625px;">12:34:56PM</td></tr></table>
<div class="rpml-block rpml-left rpml-size-1"><span class=""></span></div>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="18" class="rpml-bold rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Item</td><td data-cols="1" class="rpml-bold rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="rpml-bold rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">Qty</td><td data-cols="1" class="rpml-bold rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="rpml-bold rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">Total</td></tr></table>
<div class="rpml-block rpml-left rpml-rule rpml-rule-dashed"><span class="">--------------------------------</span></div>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Plain T-Shirt</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$10.99</td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">123456 @$10.99 ea.</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Black Jeans</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$29.99</td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">654321 @$29.99 ea.</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Baseball Cap</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">12</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$9.99</td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">987654 @$9.99 ea.</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Shoes</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">2</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$99.98</td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">456789 @$49.99 ea.</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Socks</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$1.99</td></tr><tr class="rpml-tr"><td data-cols="18" class=" rpml-td" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">987654 @$1.99 ea.</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class=" rpml-td" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr></table>
<div class="rpml-block rpml-center rpml-rule rpml-rule-dashed"><span class="">--------------------------------</span></div>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="23" class=" rpml-td" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Subtotal</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$102.95</td></tr><tr class="rpml-tr"><td data-cols="23" class=" rpml-td" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Tax</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$10.30</td></tr></table>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="23" class="rpml-bold rpml-td" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Total</td><td data-cols="1" class="rpml-bold rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="rpml-bold rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$113.25</td></tr></table>
<div class="rpml-block rpml-left rpml-size-1"><span class=""></span></div>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="23" class=" rpml-td" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Cash</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$120.00</td></tr><tr class="rpml-tr"><td data-cols="23" class=" rpml-td" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Change</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class=" rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">-$6.75</td></tr></table>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="23" class="rpml-bold rpml-td" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Balance</td><td data-cols="1" class="rpml-bold rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="rpml-bold rpml-td" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$0.00</td></tr></table>
<div class="rpml-block rpml-left rpml-size-1"><span class=""></span></div>
<table class="rpml-table"><tr class="rpml-tr"><td data-cols="10" class=" rpml-td" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Reference</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class=" rpml-td" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">SC1234567890</td></tr><tr class="rpml-tr"><td data-cols="10" class=" rpml-td" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Staff</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class=" rpml-td" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">JD</td></tr><tr class="rpml-tr"><td data-cols="10" class=" rpml-td" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Customer</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class=" rpml-td" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">Jane Smith</td></tr><tr class="rpml-tr"><td data-cols="10" class=" rpml-td" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Email</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class=" rpml-td" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">js@example.com</td></tr><tr class="rpml-tr"><td data-cols="10" class=" rpml-td" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Phone</td><td data-cols="1" class=" rpml-td" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class=" rpml-td" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">0400 123 456</td></tr></table>
<div class="rpml-block rpml-left rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-center rpml-qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=126x126&data=https://example.com/orders/1234567890"></div>
<div class="rpml-block rpml-center rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-center rpml-rule rpml-rule-dashed"><span class="">--------------------------------</span></div>
<div class="rpml-block rpml-center rpml-size-1"><span class=""></span></div>
<div class="rpml-block rpml-left rpml-size-1"><span class="rpml-bold">Layby Terms & Conditions</span></div>
<div class="rpml-block rpml-left rpml-size-1"><span class="">1) Maximum layby period 3 months</span></div>
<div class="rpml-block rpml-left rpml-size-1"><span class="">2) Payments due every 2 weeks</span></div>
<div class="rpml-block rpml-left rpml-size-1"><span class="">3) Cancellations incur 10% fee</span></div>

        </div>
      </body>
    </html>
  `;

    expect(output).to.equal(expectedOutput);
  });
});
