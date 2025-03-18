import { expect } from 'chai';
import { parse } from '../src/parser.js';
import { printReceipt, printerModels, encodeCommand } from '../src/printer.js';

describe('Thermal Printer', () => {
  // Mock ReceiptPrinterEncoder class from @point-of-sale/receipt-printer-encoder
  class MockPrinterEncoder {
    constructor(options) {
      this.options = options;
      this.commands = [];
      this.encodedCommands = Buffer.from([]);
    }

    initialize() {
      this.commands.push('initialize');
      return this;
    }

    align(alignment) {
      this.commands.push(`align:${alignment}`);
      return this;
    }

    text(value) {
      this.commands.push(`text:${value}`);
      return this;
    }

    line(value) {
      this.commands.push(`line:${value}`);
      return this;
    }

    bold(on) {
      this.commands.push(`bold:${on}`);
      return this;
    }

    underline(on) {
      this.commands.push(`underline:${on}`);
      return this;
    }

    invert(on) {
      this.commands.push(`invert:${on}`);
      return this;
    }

    italic(on) {
      this.commands.push(`italic:${on}`);
      return this;
    }

    font(value) {
      this.commands.push(`font:${value}`);
      return this;
    }

    size(value) {
      this.commands.push(`size:${value}`);
      return this;
    }

    rule(options) {
      this.commands.push(`rule:${JSON.stringify(options)}`);
      return this;
    }

    image(_img, width, height, dither) {
      this.commands.push(`image:${width}x${height}:${dither || 'none'}`);
      return this;
    }

    qrcode(data, { model, size, errorlevel }) {
      this.commands.push(`qrcode:${data}:model=${model}:size=${size}:errorlevel=${errorlevel}`);
      return this;
    }

    table(columns, rows) {
      this.commands.push(`table:${columns.length}x${rows.length}`);
      return this;
    }

    newline() {
      this.commands.push('newline');
      return this;
    }

    cut(type) {
      this.commands.push(`cut:${type}`);
      return this;
    }

    raw(data) {
      this.commands.push(`raw:${JSON.stringify(data)}`);
      return this;
    }

    encode() {
      return Buffer.from([1, 2, 3]); // Mock encoded buffer
    }
  }

  class MockImage {
    constructor({ mockFailure = false } = {}) {
      this.width = 240;
      this.height = 120;
      this.onload = null;
      this.onerror = null;
      this.crossOrigin = null;
      this.mockFailure = mockFailure;
    }

    set src(value) {
      this._src = value;
      // For testing, trigger the onload or onerror callback synchronously
      setTimeout(() => {
        if (!this.mockFailure && this.onload) {
          this.onload();
        } else if (this.mockFailure && this.onerror) {
          this.onerror(new Error('Mock image load error'));
        }
      }, 5);
    }

    get src() {
      return this._src;
    }
  }

  const createMockImage = () => new MockImage();
  const createFailingMockImage = () => new MockImage({ mockFailure: true });

  class MockDevice {
    constructor() {
      this.transferOutCalls = [];
    }

    transferOut(endpoint, data) {
      this.transferOutCalls.push({ endpoint, data });
      return Promise.resolve(true);
    }
  }

  describe('encodeCommand', () => {
    it('does nothing if cut is none', () => {
      const encoder = new MockPrinterEncoder();
      const command = { name: 'cut', value: 'none' };
      const newEncoder = encodeCommand({ command, encoder });

      expect(newEncoder).to.equal(encoder);
      expect(encoder.commands).to.deep.equal([]);
    });
  });

  it('initializes the encoder with correct printer settings', async () => {
    const markup = `
{center}
{line}
Test Receipt`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels.mPOP,
      device,
      createImage: createMockImage,
      createCanvas: 'createCanvas', // Stub for testing
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });

    expect(encoder).to.exist;
    expect(encoder.options.language).to.equal('star-prnt');
    expect(encoder.options.columns).to.equal(32);
    expect(encoder.options.createCanvas).to.equal('createCanvas');

    // Check if anything was transferred
    expect(device.transferOutCalls.length).to.be.greaterThan(0);

    if (device.transferOutCalls.length > 0) {
      expect(device.transferOutCalls[0].endpoint).to.equal(1);
    } else {
      console.log('Debug: No transferOut calls were made');
    }

    expect(encoder.commands).to.include('initialize');
    expect(encoder.commands).to.include('align:center');
    expect(encoder.commands).to.include('line:Test Receipt');
    expect(encoder.commands).to.include('cut:partial');
  });

  it('handles text formatting commands correctly', async () => {
    const markup = `
{bold}
Bold text
{endBold}
{italic}
Italic text
{endItalic}
{underline}
Underlined text
{endUnderline}
{invert}
Inverted text
{endInvert}
{small}
Small text
{endSmall}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels['TM-T88IV'],
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    const commands = encoder.commands;

    expect(commands).to.include('bold:true');
    expect(commands).to.include('bold:false');
    expect(commands).to.include('italic:true');
    expect(commands).to.include('italic:false');
    expect(commands).to.include('underline:true');
    expect(commands).to.include('underline:false');
    expect(commands).to.include('invert:true');
    expect(commands).to.include('invert:false');
    expect(commands).to.include('font:B');
    expect(commands).to.include('font:A');
  });

  it('renders images correctly', async () => {
    const markup = `
{center}
{image
  src="https://example.com/test.png"
  size=80
  dither=atkinson
}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels.mPOP,
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    const commands = encoder.commands;

    const imageCommand = commands.find((cmd) => cmd.startsWith('image:'));
    expect(imageCommand).to.exist;
    expect(imageCommand).to.include('atkinson');

    // Verify the image was loaded with correct source
    expect(device.transferOutCalls.length).to.equal(1);
  });

  describe('stubbing console.error', () => {
    let originalConsoleError;
    let errorOutput = [];

    beforeEach(function () {
      originalConsoleError = console.error;
      console.error = (...args) => errorOutput.push(args.join(' '));
    });

    afterEach(function () {
      console.error = originalConsoleError;
      errorOutput = [];
    });

    it('handles image loading errors gracefully', async () => {
      const markup = `
{center}
{image
  src="https://example.com/nonexistent.png"
  size=80
}
{line}
This should still render`;

      const device = new MockDevice();
      const encoder = await printReceipt({
        commands: parse(markup),
        printer: printerModels.mPOP,
        device,
        createImage: createFailingMockImage,
        ReceiptPrinterEncoder: MockPrinterEncoder,
      });
      expect(encoder).to.exist;

      expect(errorOutput).to.include('Error: Mock image load error');

      expect(device.transferOutCalls.length).to.equal(1);

      const commands = encoder.commands;

      // The line command should still be processed despite image error
      expect(commands).to.include('line:This should still render');
    });
  });

  it('renders tables correctly', async () => {
    const markup = `
{table
  cols=3
  margin=1
  align=[left,center,right]
  width=[10,10,*]
  row=["Item", "Qty", "Price"]
  row=["Product 1", "2", "$10.00"]
}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels['TM-T88IV'],
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    const commands = encoder.commands;

    const tableCommand = commands.find((cmd) => cmd.startsWith('table:'));
    expect(tableCommand).to.exist;
    expect(tableCommand).to.include('3x2'); // 3 columns, 2 rows
  });

  it('renders rules with different styles', async () => {
    const markup = `
{rule line=solid width=32}
{rule line=dashed width=20}
{rule line=dashed style=double width=10}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels.mPOP,
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    const commands = encoder.commands;

    const solidRule = commands.find((cmd) => cmd.startsWith('rule:'));
    expect(solidRule).to.exist;
    expect(solidRule).to.include('"width":32');

    const dashedLine = commands.find((cmd) => cmd === 'line:--------------------');
    expect(dashedLine).to.exist;

    const doubleDashedLine = commands.find((cmd) => cmd === 'line:==========');
    expect(doubleDashedLine).to.exist;
  });

  it('renders QR codes correctly', async () => {
    const markup = `
{center}
{qrcode
  data="https://example.com"
  size=6
  model=2
  level=l
}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels['TM-T88IV'],
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    const commands = encoder.commands;

    const qrCommand = commands.find((cmd) => cmd.startsWith('qrcode:'));
    expect(qrCommand).to.exist;
    expect(qrCommand).to.include('https://example.com');
    expect(qrCommand).to.include('model=2');
    expect(qrCommand).to.include('size=6');
    expect(qrCommand).to.include('errorlevel=l');
  });

  it('handles barcodes correctly', async () => {
    const markup = `
{center}
{barcode
  data="12345678"
  type="CODE128"
  height=50
  position="below"
}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels.mPOP,
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    const commands = encoder.commands;
    const barcodeCommand = commands.find((cmd) => cmd.startsWith('raw:'));
    expect(barcodeCommand).to.exist;
  });

  it('handles complex receipts with multiple command types', async () => {
    const markup = `
{center}
{bold}
RECEIPT
{endBold}
{line}
{table
  cols=3
  margin=1
  align=[left,right,right]
  width=[*,4,8]
  row=["Item","Qty","Total"]
}
{rule}
{table
  cols=3
  margin=1
  align=[left,right,right]
  width=[*,4,8]
  row=["Product", "1", "$10.99"]
  row=["Another Item", "2", "$21.98"]
}
{right}
{bold}
Total: $32.97
{endBold}
{center}
{qrcode data="receipt-id-123" size=4}`;

    const device = new MockDevice();
    const encoder = await printReceipt({
      commands: parse(markup),
      printer: printerModels['TM-T88IV'],
      device,
      createImage: createMockImage,
      ReceiptPrinterEncoder: MockPrinterEncoder,
    });
    expect(encoder).to.exist;

    expect(device.transferOutCalls.length).to.equal(1);

    const commands = encoder.commands;

    expect(commands).to.include('align:center');
    expect(commands).to.include('bold:true');
    expect(commands).to.include('line:RECEIPT');
    expect(commands).to.include('bold:false');
    expect(commands).to.include('align:right');
    expect(commands).to.include('align:center');

    const tableCommands = commands.filter((cmd) => cmd.startsWith('table:'));
    expect(tableCommands).to.have.length(2);

    const qrCommands = commands.filter((cmd) => cmd.startsWith('qrcode:receipt-id-123'));
    expect(qrCommands).to.have.length(1);

    expect(commands).to.include('cut:partial');
  });
});
