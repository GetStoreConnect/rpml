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
export function printReceipt(markup, printer, device, PrinterEncoder) {
  printer.chars = parseInt(printer.chars);
  printer.dots = parseInt(printer.dots);

  let commands = parse(markup);

  const documentIndex = commands.findIndex((i) => i.name == 'document');
  const doc = commands[documentIndex];

  // remove document from commands
  commands.splice(documentIndex, 1);

  const encoder = new PrinterEncoder({
    language: printer.language,
    width: printer.chars,
    wordWrap: doc.attributes.wordWrap,
    imageMode: imageModes[printer.language],
  });

  loadImages(commands).then((images) => {
    sendReceiptCommands(commands, doc, images, printer, device, encoder);
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

function sendReceiptCommands(commands, doc, images, printer, device, encoder) {
  let chain = encoder.initialize();

  commands.push(...endCommands());

  for (const command of commands) {
    chain = receiptCommand(command, chain, doc, images, printer);
  }

  device.transferOut(1, chain.encode()).catch((error) => {
    console.log(`printReceipt: ${error}`);
  });
}

function receiptCommand(command, chain, document, images, printer) {
  const name = command.name;
  const attributes = command.attributes;
  const value = command.value;
  const off = command.off === true;

  switch (name) {
    case 'center':
      return chain.align('center');
    case 'left':
      return chain.align('left');
    case 'right':
      return chain.align('right');
    case 'image':
      // turn off any sizing
      chain = chain.height(value).width(value);

      let image = images.shift();
      if (!image) return chain;

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

      return chain.image(image, width, height, attributes.dither);
    case 'line':
      return chain.line(value || '');
    case 'rule':
      // turn off any sizing
      chain = chain.height(value).width(value);

      if (attributes.line == 'dashed') {
        let character = attributes.style == 'double' ? '=' : '-';

        return chain.line(character.repeat(attributes.width || printer.chars));
      } else {
        return chain.rule({ width: attributes.width || printer.chars, style: attributes.style });
      }
    case 'text':
      return chain.text(value || '');
    case 'bold':
      return chain.bold(!off);
    case 'underline':
      return chain.underline(!off);
    case 'invert':
      return chain.invert(!off);
    case 'italic':
      return chain.italic(!off);
    case 'small':
      if (!off) return chain.size('small');
      else return chain.size('normal');
    case 'size':
      return chain.height(value).width(value);
    case 'width':
    case 'barcode':
      // turn off any sizing
      chain = chain.height(value).width(value);

      let bc = encodeBarcode(attributes, printer);
      return chain.raw(bc);
    case 'qrcode':
      // turn off any sizing
      chain = chain.height(value).width(value);

      return chain.qrcode(
        attributes.data,
        attributes.model,
        attributes.size,
        attributes.errorLevel
      );
    case 'table':
      // turn off any sizing
      chain = chain.height(value).width(value);

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

      return chain.table(columns, attributes.rows);
    case 'bottom-margin':
      return chain.newline().newline().newline().newline().newline().newline();
    case 'cut':
      return chain.cut(value);
    default:
      console.log(`Unknown command type: ${name}`);
  }

  return chain;
}

function encodeBarcode(attributes, printer) {
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

async function loadImages(commands) {
  let images = [];

  for (const command of commands) {
    if (command.name == 'image') {
      images.push(
        await loadImage(command.attributes.src).catch((error) => {
          console.log(error);
          return null;
        })
      );
    }
  }

  return images;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (error) => {
      reject("couldn't load image");
      console.log(error);
    };
    image.src = src;
  });
}
