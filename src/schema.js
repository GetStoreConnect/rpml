const schema = {
  document: {
    attributes: {
      wordWrap: { type: 'boolean', default: false }, // DEPRECATED
      bottomMargin: { type: 'number', default: 6 },
      cut: { type: 'keyword', options: ['full', 'partial', 'none'], default: 'partial' },
    },
  },
  center: {},
  image: {
    attributes: {
      dither: {
        type: 'keyword',
        options: ['threshold', 'bayer', 'floydsteinberg', 'atkinson'],
        default: 'threshold',
      },
      height: { type: 'number' },
      size: { type: 'number' },
      src: { type: 'string' },
      width: { type: 'number' },
    },
  },
  left: {},
  right: {},
  rule: {
    attributes: {
      width: { type: 'number' },
      line: { type: 'keyword', options: ['solid', 'dashed'], default: 'dashed' },
      style: { type: 'keyword', options: ['single', 'double'], default: 'single' },
    },
  },
  table: {
    attributes: {
      align: { type: 'keyword', options: ['left', 'right'], split: true },
      cols: { type: 'number' },
      row: { type: 'string', split: true, multiple: true, key: 'rows' },
      margin: { type: 'number' },
      width: { type: 'number', split: true },
    },
  },
  line: {
    param: { type: 'string', default: '' },
  },
  text: {
    param: { type: 'string', default: '' },
  },
  bold: {
    toggle: true,
  },
  italic: {
    toggle: true,
  },
  underline: {
    toggle: true,
  },
  invert: {
    toggle: true,
  },
  small: {
    toggle: true,
  },
  size: {
    param: { type: 'number', options: [1, 2, 3, 4, 5, 6], default: 1 },
  },
  newline: {
    param: { type: 'number', default: 1 },
  },
  cut: {
    param: { type: 'string', options: ['partial', 'full'], default: 'full' },
  },
  barcode: {
    attributes: {
      type: { type: 'keyword', options: ['upca', 'ean13', 'ean8', 'code39', 'code128'] },
      data: { type: 'string' },
      height: { type: 'number', default: 50 },
      position: { type: 'keyword', options: ['none', 'above', 'below', 'both'], default: 'none' },
    },
  },
  qrcode: {
    attributes: {
      data: { type: 'string' },
      level: { type: 'keyword', options: ['l', 'm', 'q', 'h'], default: 'l' },
      model: { type: 'keyword', options: ['1', '2'], default: '1' },
      size: { type: 'number', options: [1, 2, 3, 4, 5, 6, 7, 8], default: 6 },
    },
  },
};

export default schema;
