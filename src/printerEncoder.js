import { addFinalCommands } from './commands.js';

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

// Designed to work with ReceiptPrinterEncoder from @point-of-sale/receipt-printer-encoder
export async function encodeReceipt({ commands, encoder, dots, createImage = null }) {
  createImage ||= () => new Image();

  const images = await loadImages({ commands, createImage });

  return encodeCommands({ commands, encoder, dots, images });
}

export function encodeCommands({ commands, encoder, dots, images }) {
  commands = addFinalCommands(commands);

  encoder = encoder.initialize();

  for (const command of commands) {
    encoder = encodeCommand({ command, encoder, dots, images });
  }

  return encoder;
}

export function encodeCommand({ command, encoder, dots, images }) {
  switch (command.name) {
    case 'document':
      return encoder; // Do nothing for document command
    case 'center':
      return encoder.align('center');
    case 'left':
      return encoder.align('left');
    case 'right':
      return encoder.align('right');
    case 'bold':
      return encoder.bold(!command.off);
    case 'underline':
      return encoder.underline(!command.off);
    case 'invert':
      return encoder.invert(!command.off);
    case 'italic':
      return encoder.italic(!command.off);
    case 'small':
      return command.off ? encoder.font('A') : encoder.font('B');
    case 'size':
      return encoder.size(command.value);
    case 'text':
      return encoder.text(command.value || '');
    case 'line':
      return encoder.line(command.value || '');

    case 'image':
      encoder = resetSize({ encoder });
      return encodeImage({ command, encoder, dots, images });

    case 'rule':
      encoder = resetSize({ encoder });
      return encodeRule({ command, encoder });

    case 'barcode':
      encoder = resetSize({ encoder });
      return encoder.raw(buildBarcode({ command, language: encoder.language }));

    case 'qrcode':
      encoder = resetSize({ encoder });
      return encodeQrCode({ command, encoder });

    case 'table':
      encoder = resetSize({ encoder });
      if (!command.attributes.rows) {
        return encoder;
      }
      const table = buildTable({ command, width: encoder.columns });
      return encoder.table(table.columns, table.rows);

    case 'newline':
      return encoder.newline(command.value);

    case 'cut':
      return encoder.cut(command.value);

    default:
      console.log(`Unknown command type: ${command.name}`);
  }

  return encoder;
}

function resetSize({ encoder }) {
  return encoder.size(1);
}

function encodeRule({ command, encoder }) {
  const attributes = command.attributes;
  const width = attributes.width || encoder.columns;
  if (attributes.line == 'dashed') {
    const character = attributes.style == 'double' ? '=' : '-';
    return encoder.line(character.repeat(width));
  } else {
    return encoder.rule({ width, style: attributes.style });
  }
}

function encodeImage({ command, encoder, dots, images }) {
  const attributes = command.attributes;

  const image = images[attributes.src];
  if (!image) {
    return encoder;
  }

  let width = attributes.width;
  let height = attributes.height;

  if (attributes.size) {
    // size is a percentage of the width
    // calculate the width based on the percentage of printer width (dots)
    width = parseInt((attributes.size / 100) * dots);

    // calculate the height based on the aspect ratio of the image
    height = parseInt((image.height / image.width) * width);

    // ensure both width and height are multiples of 24
    width = parseInt(width / 24) * 24;
    height = parseInt(height / 24) * 24;
  }

  return encoder.image(image, width, height, attributes.dither);
}

function buildTable({ command, width }) {
  const attributes = command.attributes;
  const margin = attributes.margin || 0;
  const splitWidth = parseInt(width / attributes.cols);
  const columns = [];
  let widthAvailable = width;

  for (let i = 0; i < attributes.cols; i++) {
    const align = attributes.align ? attributes.align[i] : 'left';
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

  return { columns, rows: attributes.rows };
}

function buildBarcode({ command, language }) {
  const attributes = command.attributes;
  const type = barcodeTypeMap[language][attributes.type.toUpperCase()];
  const position = barcodePositionMap[language][attributes.position];

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

function encodeQrCode({ command, encoder }) {
  const attributes = command.attributes;
  return encoder.qrcode(attributes.data, {
    model: attributes.model,
    size: attributes.size,
    errorlevel: attributes.level,
  });
}

async function loadImages({ commands, createImage }) {
  let images = {};

  for (const command of commands) {
    if (command.name == 'image') {
      const src = command.attributes.src;
      if (!images[src]) {
        try {
          images[src] = await loadImage({ src, createImage });
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  return images;
}

function loadImage({ src, createImage }) {
  return new Promise((resolve, reject) => {
    let image = createImage();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = src;
  });
}
