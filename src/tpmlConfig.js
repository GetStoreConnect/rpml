const tpmlConfig = {
  document: {
    attributes: {
      wordWrap: { type: "boolean", default: false },
    },
  },
  center: {},
  image: {
    attributes: {
      dither: { type: "keyword", options: ["threshold", "bayer", "floydsteinberg", "atkinson"], default: "threshold" },
      height: { type: "number" },
      size: { type: "number" },
      src: { type: "string" },
      width: { type: "number" },
    },},
  left: {},
  line: {},
  rule: {
    attributes: {
      width: { type: "number" },
      line: { type: "keyword", options: ["solid", "dashed"], default: "dashed" },
      style: { type: "keyword", options: ["single", "double"], default: "single" },
    }
  },
  table: {
    attributes: {
      align: { type: "keyword", options: ["left", "right"], split: true },
      cols: { type: "number" },
      row: { type: "string", split: true, multiple: true, key: "rows" },
      margin: { type: "number" },
      width: { type: "number", split: true },
    },
  },
  text: {
    param: { type: "string" },
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
  height: {
    param: { type: "number", options: [1, 2, 3, 4, 5, 6], default: 1 },
  },
  width: {
    param: { type: "number", options: [1, 2, 3, 4, 5, 6], default: 1 },
  },
  barcode: {
    attributes: {
      type: { type: "keyword", options: ["upca", "ean13", "ean8", "code39", "code128"] },
      data: { type: "string" },
      height: { type: "number", default: 50},
      position: { type: "keyword", options: ["none", "above", "below", "both"], default: "none" },
    }
  },
  qrcode: {
    attributes: {
      data: { type: "string" },
      level: { type: "keyword", options: ["l", "m", "q", "h"], default: "l" },
      model: { type: "keyword", options: ["1", "2"], default: "1" },
      size: { type: "number", options: [1, 2, 3, 4, 5, 6, 7, 8], default: 6 },
    }
  }
}

export default tpmlConfig;
