import { expect } from 'chai';
import { printReceipt, printerModels } from '../../src/renderers/thermal.js';

describe('Thermal Printer Renderer', () => {
  // Mock PrinterEncoder class
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

    size(value) {
      this.commands.push(`size:${value}`);
      return this;
    }

    height(value) {
      this.commands.push(`height:${value}`);
      return this;
    }

    width(value) {
      this.commands.push(`width:${value}`);
      return this;
    }

    rule(options) {
      this.commands.push(`rule:${JSON.stringify(options)}`);
      return this;
    }

    image(img, width, height, dither) {
      this.commands.push(`image:${width}x${height}:${dither || 'none'}`);
      return this;
    }

    qrcode(data, model, size, errorLevel) {
      this.commands.push(
        `qrcode:${data}:model${model || ''}:size${size || ''}:error${errorLevel || ''}`
      );
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

  // Mock device with native JavaScript instead of sinon
  let mockDevice;
  let transferOutCalls;
  let originalImage;
  let mockLoadImageSuccess = true;
  let encoderInstance;

  beforeEach(() => {
    transferOutCalls = [];
    mockDevice = {
      transferOut: (endpoint, data) => {
        transferOutCalls.push({ endpoint, data });
        return Promise.resolve(true);
      },
    };

    // Save the original global Image if it exists
    if (typeof global.Image !== 'undefined') {
      originalImage = global.Image;
    }

    // Create a mock Image class
    global.Image = class MockImage {
      constructor() {
        this.width = 240;
        this.height = 120;
        this.onload = null;
        this.onerror = null;
        this.crossOrigin = null;
      }

      set src(value) {
        this._src = value;
        // For testing, trigger the onload or onerror callback synchronously
        setTimeout(() => {
          if (mockLoadImageSuccess && this.onload) {
            this.onload();
          } else if (!mockLoadImageSuccess && this.onerror) {
            this.onerror(new Error('Mock image load error'));
          }
        }, 5);
      }

      get src() {
        return this._src;
      }
    };
  });

  afterEach(() => {
    // Restore the original global Image if it existed
    if (originalImage) {
      global.Image = originalImage;
    } else {
      delete global.Image;
    }

    // Reset mock state
    transferOutCalls = [];
    mockLoadImageSuccess = true;
  });

  it('initializes the encoder with correct printer settings', (done) => {
    // Set up printer model
    const printerModel = printerModels.mPOP;

    // Simple markup with document command
    const markup = `{document word-wrap=true}
{center}
{line}Test Receipt
`;

    // Call printReceipt and store the returned encoder
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });

    // Now we verify that the encoder was created correctly
    expect(encoderInstance).to.exist;
    expect(encoderInstance.options.language).to.equal('star-prnt');
    expect(encoderInstance.options.width).to.equal(32);
    expect(encoderInstance.options.wordWrap).to.be.true;

    // Increase the timeout to give more time for async operations
    setTimeout(() => {
      try {
        // Check if anything was transferred
        expect(transferOutCalls.length).to.be.greaterThan(0);

        if (transferOutCalls.length > 0) {
          expect(transferOutCalls[0].endpoint).to.equal(1);
        } else {
          console.log('Debug: No transferOut calls were made');
        }

        // Verify commands were added to the chain
        expect(encoderInstance.commands).to.include('initialize');
        expect(encoderInstance.commands).to.include('align:center');
        expect(encoderInstance.commands).to.include('line:Test Receipt');
        expect(encoderInstance.commands).to.include('cut:partial');

        done();
      } catch (e) {
        done(e);
      }
    }, 200); // Increased timeout
  });

  it('handles text formatting commands correctly', (done) => {
    // Set up printer model
    const printerModel = printerModels['TM-T88IV'];

    // Markup with text formatting
    const markup = `
{document}
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
{endSmall}
`;

    // Call printReceipt and store the returned encoder
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        const commands = encoderInstance.commands;

        expect(commands).to.include('bold:true');
        expect(commands).to.include('bold:false');
        expect(commands).to.include('italic:true');
        expect(commands).to.include('italic:false');
        expect(commands).to.include('underline:true');
        expect(commands).to.include('underline:false');
        expect(commands).to.include('invert:true');
        expect(commands).to.include('invert:false');
        expect(commands).to.include('size:small');
        expect(commands).to.include('size:normal');

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('renders images correctly', (done) => {
    // Set up printer model
    const printerModel = printerModels.mPOP;

    // Markup with image
    const markup = `{document}
{center}
{image
src="https://example.com/test.png"
size=80
dither=atkinson
}
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        const commands = encoderInstance.commands;

        // Find the image command
        const imageCommand = commands.find((cmd) => cmd.startsWith('image:'));
        expect(imageCommand).to.exist;
        expect(imageCommand).to.include('atkinson');

        // Verify the image was loaded with correct source
        expect(transferOutCalls.length).to.equal(1);

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('handles image loading errors gracefully', (done) => {
    // Set up to simulate image load failure
    mockLoadImageSuccess = false;

    const printerModel = printerModels.mPOP;

    // Markup with image that will fail to load
    const markup = `{document}
{center}
{image
src="https://example.com/nonexistent.png"
size=80
}
{line}This should still render
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        expect(transferOutCalls.length).to.equal(1);

        const commands = encoderInstance.commands;

        // The line command should still be processed despite image error
        expect(commands).to.include('line:This should still render');

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('renders tables correctly', (done) => {
    const printerModel = printerModels['TM-T88IV'];

    // Markup with table
    const markup = `{document}
{table
cols=3
margin=1
align=[left,center,right]
width=[10,10,*]
row=["Item", "Qty", "Price"]
row=["Product 1", "2", "$10.00"]
}
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        const commands = encoderInstance.commands;

        // Find the table command
        const tableCommand = commands.find((cmd) => cmd.startsWith('table:'));
        expect(tableCommand).to.exist;
        expect(tableCommand).to.include('3x2'); // 3 columns, 2 rows

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('renders rules with different styles', (done) => {
    const printerModel = printerModels.mPOP;

    // Markup with different rule styles
    const markup = `{document}
{rule line=solid width=32}
{rule line=dashed width=20}
{rule line=dashed style=double width=10}
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        const commands = encoderInstance.commands;

        // Find rule commands
        const solidRule = commands.find((cmd) => cmd.startsWith('rule:'));
        expect(solidRule).to.exist;
        expect(solidRule).to.include('"width":32');

        // Check if dashed rules were rendered
        const dashedLine = commands.find((cmd) => cmd === 'line:--------------------');
        expect(dashedLine).to.exist;

        const doubleDashedLine = commands.find((cmd) => cmd === 'line:==========');
        expect(doubleDashedLine).to.exist;

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('renders QR codes correctly', (done) => {
    const printerModel = printerModels['TM-T88IV'];

    // Markup with QR code
    const markup = `{document}
{center}
{qrcode
data="https://example.com"
size=6
model=2
errorLevel=L
}
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        const commands = encoderInstance.commands;

        // Find the QR code command
        const qrCommand = commands.find((cmd) => cmd.startsWith('qrcode:'));
        expect(qrCommand).to.exist;
        expect(qrCommand).to.include('https://example.com');
        expect(qrCommand).to.include('model2');
        expect(qrCommand).to.include('size6');

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('handles barcodes correctly', (done) => {
    const printerModel = printerModels.mPOP;

    // Markup with barcode
    const markup = `
{document}
{center}
{barcode
  data="12345678"
  type="CODE128"
  height=50
  position="below"
}
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        const commands = encoderInstance.commands;

        // Find the raw command for barcode
        const barcodeCommand = commands.find((cmd) => cmd.startsWith('raw:'));
        expect(barcodeCommand).to.exist;

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });

  it('handles complex receipts with multiple command types', (done) => {
    const printerModel = printerModels['TM-T88IV'];

    // Complex receipt markup
    const markup = `
{document word-wrap=true}
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
{qrcode data="receipt-id-123" size=4}
`;

    // Call printReceipt
    encoderInstance = printReceipt({
      markup,
      printer: printerModel,
      device: mockDevice,
      PrinterEncoder: MockPrinterEncoder,
    });
    expect(encoderInstance).to.exist;

    // Allow time for async operations
    setTimeout(() => {
      try {
        expect(transferOutCalls.length).to.equal(1);

        const commands = encoderInstance.commands;

        // Verify various commands were added in order
        expect(commands).to.include('align:center');
        expect(commands).to.include('bold:true');
        expect(commands).to.include('line:RECEIPT');
        expect(commands).to.include('bold:false');

        // Check for tables
        const tableCommands = commands.filter((cmd) => cmd.startsWith('table:'));
        expect(tableCommands).to.have.length(2);

        // Check for alignment changes
        expect(commands).to.include('align:right');
        expect(commands).to.include('align:center');

        // Check for QR code
        expect(commands.some((cmd) => cmd.startsWith('qrcode:receipt-id-123'))).to.be.true;

        // Check for final commands
        expect(commands).to.include('cut:partial');

        done();
      } catch (e) {
        done(e);
      }
    }, 100);
  });
});
