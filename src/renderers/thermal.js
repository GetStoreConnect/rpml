import { parse } from '../parser.js';

const barcodeTypeMap = {
  'star-prnt': {
    CODE128: 0x06,
    CODE39: 0x04,
    EAN13: 0x03,
    EAN8: 0x02,
    UPCA: 0x01,
    UPCE: 0x00,
  },
  'esc-pos': {
    CODE128: 0x49,
    CODE39: 0x04,
    EAN13: 0x02,
    EAN8: 0x03,
    UPCA: 0x00,
    UPCE: 0x01,
  },
};

const barcodePositionMap = {
  'star-prnt': {
    none: 0x0,
    above: 0x1,
    below: 0x2,
    both: 0x3,
  },
  'esc-pos': {
    none: [0x1d, 0x48, 0x00],
    above: [0x1d, 0x48, 0x01],
    below: [0x1d, 0x48, 0x02],
    both: [0x1d, 0x48, 0x03],
  },
};

export const printerModels = {
  mPOP: {
    language: 'star-prnt',
    chars: 32,
    dots: 360,
    imageMode: 'dither',
  },
  'TM-T88IV': {
    language: 'esc-pos',
    chars: 42,
    dots: 512,
    imageMode: 'raster',
  },
};

const imageModes = {
  'star-prnt': 'dither',
  'esc-pos': 'raster',
};

// Designed to work with PrinterEncoder from @point-of-sale/receipt-printer-encoder
export function printReceipt({ markup, printer, device, createImage, PrinterEncoder }) {
  printer.chars = parseInt(printer.chars);
  printer.dots = parseInt(printer.dots);

  let commands = parse(markup);

  const documentIndex = commands.findIndex((i) => i.name == 'document');
  const documentCommand = commands[documentIndex];
  const wordWrap = documentCommand ? documentCommand.attributes.wordWrap : false;

  const encoder = new PrinterEncoder({
    language: printer.language,
    width: printer.chars,
    wordWrap,
    imageMode: imageModes[printer.language],
  });

  loadImages({ commands, createImage }).then((images) => {
    sendReceiptCommands({ commands, images, printer, device, encoder });
  });

  return encoder;
}

function endCommands() {
  return [
    {
      name: 'bottom-margin',
    },
    {
      name: 'cut',
      value: 'partial',
    },
  ];
}

function sendReceiptCommands({ commands, images, printer, device, encoder }) {
  encoder = encoder.initialize();

  commands.push(...endCommands());

  for (const command of commands) {
    encoder = receiptCommand({ command, encoder, images, printer });
  }

  device.transferOut(1, encoder.encode()).catch((error) => {
    console.log(`printReceipt: ${error}`);
  });
}

function receiptCommand({ command, encoder, images, printer }) {
  const name = command.name;
  const attributes = command.attributes;
  const value = command.value;
  const off = command.off === true;

  switch (name) {
    case 'document':
      return encoder; // Do nothing for document command
    case 'center':
      return encoder.align('center');
    case 'left':
      return encoder.align('left');
    case 'right':
      return encoder.align('right');
    case 'image':
      // turn off any sizing
      encoder = encoder.height(value).width(value);

      let image = images.shift();
      if (!image) return encoder;

      let width = attributes.width;
      let height = attributes.height;
      let size = attributes.size;
      if (size) {
        // size is a percentage of the width
        // calculate the width based on the percentage of printer width (dots)
        width = parseInt((size / 100) * printer.dots);

        // calculate the height based on the aspect ratio of the image
        height = parseInt((image.height / image.width) * width);

        // ensure both width and height are multiples of 24
        width = parseInt(width / 24) * 24;
        height = parseInt(height / 24) * 24;
      }

      return encoder.image(image, width, height, attributes.dither);
    case 'line':
      return encoder.line(value || '');
    case 'rule':
      // turn off any sizing
      encoder = encoder.height(value).width(value);

      if (attributes.line == 'dashed') {
        let character = attributes.style == 'double' ? '=' : '-';

        return encoder.line(character.repeat(attributes.width || printer.chars));
      } else {
        return encoder.rule({ width: attributes.width || printer.chars, style: attributes.style });
      }
    case 'text':
      return encoder.text(value || '');
    case 'bold':
      return encoder.bold(!off);
    case 'underline':
      return encoder.underline(!off);
    case 'invert':
      return encoder.invert(!off);
    case 'italic':
      return encoder.italic(!off);
    case 'small':
      if (!off) return encoder.size('small');
      else return encoder.size('normal');
    case 'size':
      return encoder.height(value).width(value);
    case 'width':
    case 'barcode':
      // turn off any sizing
      encoder = encoder.height(value).width(value);

      const barcode = encodeBarcode({ attributes, printer });
      return encoder.raw(barcode);
    case 'qrcode':
      // turn off any sizing
      encoder = encoder.height(value).width(value);

      return encoder.qrcode(
        attributes.data,
        attributes.model,
        attributes.size,
        attributes.errorLevel
      );
    case 'table':
      // turn off any sizing
      encoder = encoder.height(value).width(value);

      const margin = attributes.margin || 0;
      let columns = [];
      let widthAvailable = printer.chars;
      let splitWidth = parseInt(printer.chars / attributes.cols);

      for (var i = 0; i < attributes.cols; i++) {
        let align = attributes.align ? attributes.align[i] : 'left';
        let width;
        let colMargin = margin;

        // final column doesn't need margin
        if (i + 1 == attributes.cols) {
          colMargin = 0;
        }

        if (attributes.width) {
          if (attributes.width[i] === undefined) {
            // no more widths are set so split remaining width evenly
            width = parseInt(widthAvailable / (attributes.cols - i)) - colMargin;
          } else if (attributes.width[i] === '*') {
            // width is set to wildcard (*) so expand to fill remaining width
            let remainingWidths = attributes.width.slice(i + 1);
            if (remainingWidths.length > 0) {
              let remainingWidth = remainingWidths.reduce((total, item) => total + item);
              let remainingMargin = (attributes.cols - i - 1) * margin;
              width = widthAvailable - remainingWidth - remainingMargin;
            } else {
              width = widthAvailable;
            }
          } else {
            width = attributes.width[i];
          }
        } else {
          // no widths set so split evenly, factoring in margin
          width = splitWidth - colMargin;
        }
        widthAvailable -= width + colMargin;

        columns.push({
          align: align,
          marginRight: colMargin,
          width: width,
        });
      }

      return encoder.table(columns, attributes.rows);
    case 'bottom-margin':
      return encoder.newline().newline().newline().newline().newline().newline();
    case 'cut':
      return encoder.cut(value);
    default:
      console.log(`Unknown command type: ${name}`);
  }

  return encoder;
}

function encodeBarcode({ attributes, printer }) {
  let language = printer.language;
  let type = barcodeTypeMap[language][attributes.type.toUpperCase()];
  let position = barcodePositionMap[language][attributes.position];

  let barcodeData = attributes.data.split('').map(function (c) {
    return c.charCodeAt(0);
  });

  switch (language) {
    case 'star-prnt':
      let startMarker = 0x1b;
      let endMarker = 0x1e;
      let barcodeMarker = 0x62;
      let barcodeMode = 0x3;

      return [
        startMarker,
        barcodeMarker,
        type,
        position,
        barcodeMode,
        attributes.height,
        ...barcodeData,
        endMarker,
      ];
    case 'esc-pos':
      let widthMarker = [0x1d, 0x77];
      let heightMarker = [0x1d, 0x68];
      let typeMarker = [0x1d, 0x6b, type];

      if (attributes.type.toUpperCase() == 'CODE128') {
        barcodeData = [barcodeData.length + 2, 0x7b, 0x42, ...barcodeData];
      } else if (type > 0x40) {
        barcodeData = [barcodeData.length, ...barcodeData];
      } else {
        barcodeData = [...barcodeData, 0x00];
      }

      return [
        position,
        heightMarker,
        attributes.height,
        widthMarker,
        3,
        typeMarker,
        ...barcodeData,
      ].flat();
    default:
      return '';
  }
}

async function loadImages({ commands, createImage }) {
  let images = [];

  for (const command of commands) {
    if (command.name == 'image') {
      images.push(
        await loadImage({ src: command.attributes.src, createImage }).catch((error) => {
          console.log(error);
          return null;
        })
      );
    }
  }

  return images;
}

function loadImage({ src, createImage }) {
  return new Promise((resolve, reject) => {
    let image = createImage();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (error) => {
      reject("couldn't load image");
      console.log(error);
    };
    image.src = src;
  });
}
