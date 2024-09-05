import tpmlConfig from './tpmlConfig.js';
import { createCanvas } from 'canvas';

export class TPMLDocument {
  constructor(tpml, chars) {
    this.tpml = tpml;
    this.commands;
    this.html;
    this.elemWidth;

    this.chars = chars || 32;
  }

  toCommands() {
    return this.commands ||= new TPMLParser(this.tpml).parse();
  }

  toHtml() {
    return this.html ||= new TPMLDocumentBuilder(this.toCommands(), this.chars).build();
  }
}

class TPMLParser {
  constructor(tpml) {
    this.tpml = tpml;
  }

  parse() {
    const commands = [];

    let regex = /(?:\s*(?<!\\)(?:\\\\)*{\s*(?<key>\w+)[\s\n]*(?<attrs>(?:[^}]|\\})*)(?<!\\)(?:\\\\)*})|(?<comment>\s*{#[^}]+\s*})|(?<line>[^\n]+)/gmi;

    let matches = [...this.tpml.matchAll(regex)];

    for (const match of matches) {
      if (match.groups.comment)
        continue;

      let command = this.parseCommand(match, tpmlConfig);
      if (command)
        commands.push(command);
    }

    return commands;
  }

  parseCommand(match, config) {
    let command;

    if (match.groups.key) {
      let key = this.camelize(match.groups.key);
      if (config[key]) {
        if (config[key].attributes) {
          command = this.commandWithAttributes(key, match, config);
        } else if (config[key].param) {
          command = this.commandWithParam(key, match, config);
        } else {
          command = { name: key };
        }
      } else {
        let toggleName = key.substring(3);

        if (key.startsWith("end") && config[toggleName] && config[toggleName].toggle) {
          command = this.endCommand(toggleName);
        } else {
          command = this.unknownCommand(match);
        }
      }
    } else if (match.groups.line) {
      command = this.lineCommand(match);
    }

    return command;
  }

  commandWithAttributes(key, match, config) {
    let command = {
      name: key,
    }

    let attributes = this.parseAttributes(match.groups.attrs, config[key])
    if (attributes)
      command.attributes = attributes;

    return command;
  }

  commandWithParam(key, match, config) {
    return {
      name: key,
      value: this.castValue(match.groups.attrs, config[key].param) || config[key].param.default,
    }
  }

  endCommand(name) {
    return {
      name: name,
      off: true,
    }
  }

  lineCommand(match) {
    return {
      name: "line",
      value: match.groups.line,
    }
  }

  unknownCommand(match) {
    return {
      name: "unknown",
      key: match.groups.key,
      attributes: match.groups.attrs
    }
  }

  parseAttributes(input, config) {
    const attributes = {};
    let regex = /\s*(?<key>[^=\s]+)\s*=\s*(?:(?<number>[\d]+)|(?<keyword>[\w\-]+)|(["'])(?<string>.*?(?<!\\))\4|\[(?<array>.*(?<!\\))\])/gi;
    let matches = [...input.matchAll(regex)];

    for (const match of matches) {
      let key = this.camelize(match.groups.key);

      if (!config.attributes[key])
        continue;

      let rawValue = match.groups.number || match.groups.keyword || match.groups.string || match.groups.array;
      let value = this.castValue(rawValue, config.attributes[key]);

      if (value === null)
        continue;

      if (config.attributes[key].multiple) {
        key = config.attributes[key].key || key;
        if (!attributes[key])
          attributes[key] = []
        attributes[key].push(value)
      } else {
        attributes[key] = value;
      }
    }

    // check for default values
    for (const key in config.attributes) {
      if (config.attributes[key].default !== undefined && attributes[key] === undefined)
        attributes[key] = config.attributes[key].default;
    }

    return attributes;
  }

  castValue(value, config) {
    if (!value) return "";
    // replace all escaped characters with the original
    value = value.replace(/\\(.)/g, (m, chr) => chr);

    if (config.split) {
      // split on commas, but only if they're not inside quotes
      return value.match(/(['"].*?['"]|[^"',\s]+)(?=\s*,|\s*$)/g).map(
        bit => {
          return this.cast(bit, config.type, config.options)
        }
      )
    } else {
      return this.cast(value, config.type, config.options)
    }
  }

  cast(value, type, options) {
    switch (this.camelize(type)) {
      case "number":
        if (value === "*")
          return value

        if (!options)
          return Number(value);

        return options.includes(Number(value)) ? Number(value) : null;
      case "boolean":
        return value === "true";
      case "keyword":
        if (!options)
          return value;

        return options.includes(value.toLowerCase()) ? value.toLowerCase() : null;
      case "string":
        return value.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    }
  }

  camelize(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  }
}

class TPMLDocumentBuilder {
  constructor(commands, chars) {
    this.commands = commands;
    this.lines = [];
    this.styles = this.defaultStyles;
    this.fontFamily = "monospace";
    this.fontSize = "14px";
    this.lineHeight = "1.3em";
    this.chars = chars;
    this.docWidth;
    this.wordWrap = false;
  }

  defaultStyles() {
    return {
      alignment: "left",
      size: 1,
      bold: false,
      italic: false,
      underline: false,
      invert: false,
      small: false,
    }
  }

  bodyCss() {
    return `<style>
  body {
    font-family: ${this.fontFamily};
    font-size: ${this.fontSize};
    line-height: ${this.lineHeight};
    background-color: transparent;
    margin: 0;
    padding: 0;

    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-all;
  }

  article {
    padding: 1em;
    background-color: white;
    color: black;
  }

  div {
    min-height: 1.3em;
    text-align: left;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
    padding: 0;
  }

  tr {
    border: none;
    margin: 0;
    padding: 0;
  }

  td {
    border: none;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    vertical-align: top;
  }

  img {
    filter: grayscale(100%);
  }

  .small {
    font-size: 80%;
  }

  .size-1, .size-2, .size-3, .size-4, .size-5, .size-6 {
    line-height: 100%;
  }

  .size-1 {
    font-size: 100%;
  }

  .size-2 {
    font-size: 200%;
  }

  .size-3 {
    font-size: 300%;
  }

  .size-4 {
    font-size: 400%;
  }

  .size-5 {
    font-size: 500%;
  }

  .size-6 {
    font-size: 600%;
  }

  .bold {
    font-weight: bold;
  }

  .italic {
    font-style: italic;
  }

  .underline {
    text-decoration: underline;
  }

  .invert {
    // filter: invert(100%);
    background-color: black;
    color: white;
  }

  .center {
    text-align: center;
  }

  .left {
    text-align: left;
  }

  .right {
    text-align: right;
  }

  .img {
    width: 100%;
  }

  .rule {
    position:relative;
  }

  .rule .rule-solid {
    border: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid black;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .barcode, .qrcode {
    width: 100%;
  }
</style>`;
  }

  build() {
    for (const command of this.commands) {
      if (command.name === "document") {
        this.docWidth = this.calculateWidth(this.chars, this.fontFamily, this.fontSize);
        this.wordWrap = command.attributes.wordWrap;

        continue;
      }

      this.applyCommand(command);
    }

    return this.wrapDocument(this.lines.map(line => line.toHtml()).join(`\n`));
  }

  wrapDocument(content) {
    const docStyles = `width: ${this.docWidth}px; margin: 0 auto;`;
    const wordWrap = this.wordWrap ? "word-wrap: break-word;" : "";

    return `<html><head>${this.bodyCss()}</head><body><article style="${docStyles}${wordWrap}">\n${content}\n</article></body></html>`;
  }

  applyCommand(command) {
    switch (command.name) {
      case "left":
        this.styles.alignment = command.name;
        break;
      case "right":
        this.styles.alignment = command.name;
        break;
      case "center":
        this.styles.alignment = command.name;
        break;
      case "size":
        this.styles.size = command.value;
        break;
      case "bold":
        this.styles.bold = command.off === true ? false : true;
        break;
      case "italic":
        this.styles.italic = command.off === true ? false : true;
        break;
      case "underline":
        this.styles.underline = command.off === true ? false : true;
        break;
      case "invert":
        this.styles.invert = command.off === true ? false : true;
        break;
      case "small":
        this.styles.small = command.off === true ? false : true;
        break;
      case "line":
      case "text":
        this.addLine(command, { ...this.styles });
        break;
      default:
        this.styles.size = 1;
        this.addLine(command, { ...this.styles });
        break;
    }
  }

  addLine(command, styles) {
    this.lines.push(new TPMLDocumentLine(command, styles, this, this.lines[this.lines.length - 1]));
  }

  calculateWidth(chars, fontFamily, fontSize) {
    const canvas = createCanvas(200, 50); // The size here doesn't matter for measuring text width
    const context = canvas.getContext('2d');

    context.font = `${fontSize} ${fontFamily}`;

    return context.measureText('W'.repeat(chars)).width;
  }
}

class TPMLDocumentLine {
  constructor(command, styles, builder, precedingLine) {
    this.command = command;
    this.styles = styles;
    this.builder = builder;
    this.precedingLine = precedingLine;
    this.blockClasses = [];
    this.contentClasses = [];

    if (this.styles.small)
      this.contentClasses.push("small");

    if (this.styles.bold)
      this.contentClasses.push("bold");

    if (this.styles.italic)
      this.contentClasses.push("italic");

    if (this.styles.underline)
      this.contentClasses.push("underline");

    if (this.styles.invert)
      this.contentClasses.push("invert");

    if (this.styles.size && (this.command.name == "line" || this.command.name == "text")) {
      this.blockClasses.push("size-" + this.styles.size);
    }

    this.blockClasses.push(this.styles.alignment);
  }

  toHtml() {
    let html = ``;
    let value = this.command.value || ``;
    const blockClasses = this.blockClasses.join(" ");
    const contentClasses =  this.contentClasses.join(" ");

    switch (this.command.name) {
      case "image":
        let size = "";
        if (this.command.attributes.size) {
          size = `width="${this.command.attributes.size}%"`;
        }

        html += `<div class="${blockClasses} img"><img src="${this.command.attributes.src}" ${size}></div>`;
        break;
      case "line":
        if (this.precedingLine && this.precedingLine.command.name == "text") {
          html += `<br>`
        } else {
          html += `<div class="${blockClasses}"><span class="${contentClasses}">${value}</span></div>`;
        }
        break;
      case "text":
        html += `<span class="${contentClasses}">${value}</span>`;
        break;
      case "rule":
        const charCount = this.builder.chars;
        if (this.command.attributes.line == "dashed") {
          let char = this.command.attributes.style == "double" ? "=" : "-";
          html += `<div class="${blockClasses} rule rule-dashed"><span class="${contentClasses}">${char.repeat(this.command.attributes.width || charCount)}</span></div>`;
        } else {
          let width = "100%";
          if (this.command.attributes.width) {
            width = `${(this.command.attributes.width / charCount) * 100.0}%`;
          }
          let cls = ` ${this.command.attributes.style == "double" ? "border-bottom: 1px solid black; height: 3px;" : ""}`;
          html += `<div class="${blockClasses} rule" style="position:relative;"><div class="rule-solid${cls}" style="width: ${width};"></div></div>`;
        }
        break;
      case "table":
        html += `<table>`;

        for (const row of this.command.attributes.rows) {
          html += `<tr>`;

          for (const [index, cell] of row.entries()) {
            let width, widthStyle="", widthPX, marginColumn="", alignment = "left";
            let margin = this.command.attributes.margin || 0;
            margin = parseInt(margin);

            if (this.command.attributes.align) {
              alignment = this.command.attributes.align[index];
            }

            if (this.command.attributes.width) {
              width = this.command.attributes.width[index];

              if (width == "*") {
                width = this.builder.chars;
                this.command.attributes.width.filter(w => w != "*").forEach(w => width -= parseInt(w) + margin);
              } else {
                width = parseInt(width);
              }
            } else {
              // no widths set so split evenly, factoring in margin
              let splitWidth = parseInt(this.builder.chars / this.command.attributes.cols);
              width = splitWidth - margin;
            }

            widthPX = (this.builder.docWidth / this.builder.chars) * width;
            widthStyle = `width: ${widthPX}px; max-width: ${widthPX}px; min-width: ${widthPX}px;`;

            if (index < row.length - 1) {
              widthPX = (this.builder.docWidth / this.builder.chars) * margin;
              marginColumn = `<td data-cols="${margin}" class="${contentClasses}" style="${`width: ${widthPX}px; max-width: ${widthPX}px; min-width: ${widthPX}px;`}">&nbsp;</td>`;
            }

            html += `<td data-cols="${width}" class="${contentClasses}" style="text-align: ${alignment}; ${widthStyle}">${cell}</td>${marginColumn}`;
          }

          html += "</tr>";
        }

        html += "</table>";
        break;
      case "barcode":
        html += `<div class="${blockClasses} barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${this.command.attributes.data}&code=${this.command.attributes.type}" width="100%"></div>`;
        break;
      case "qrcode":
        // super rough implementation of sizing
        let dims = parseInt(21 * this.command.attributes.size);
        html += `<div class="${blockClasses} qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=${dims}x${dims}&data=${this.command.attributes.data}"></div>`;
        break;

    }

    return html;
  }
}
