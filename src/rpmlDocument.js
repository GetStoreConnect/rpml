import { createCanvas } from 'canvas';
import { parse } from './parser.js';

export class RPMLDocument {
  constructor(source, chars) {
    this.source = source;
    this.commands;
    this.html;
    this.elemWidth;

    this.chars = chars || 32;
  }

  toCommands() {
    return (this.commands ||= parse(this.source));
  }

  toHtml() {
    return (this.html ||= new RPMLDocumentBuilder(this.toCommands(), this.chars).build());
  }
}

class RPMLDocumentBuilder {
  constructor(commands, chars) {
    this.commands = commands;
    this.lines = [];
    this.styles = this.defaultStyles;
    this.fontFamily = 'monospace';
    this.fontSize = '14px';
    this.lineHeight = '1.3em';
    this.chars = chars;
    this.docWidth;
    this.wordWrap = false;
  }

  defaultStyles() {
    return {
      alignment: 'left',
      size: 1,
      bold: false,
      italic: false,
      underline: false,
      invert: false,
      small: false,
    };
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
      if (command.name === 'document') {
        this.docWidth = this.calculateWidth(this.chars, this.fontFamily, this.fontSize);
        this.wordWrap = command.attributes.wordWrap;

        continue;
      }

      this.applyCommand(command);
    }

    return this.wrapDocument(this.lines.map((line) => line.toHtml()).join(`\n`));
  }

  wrapDocument(content) {
    const docStyles = `width: ${this.docWidth}px; margin: 0 auto;`;
    const wordWrap = this.wordWrap ? 'word-wrap: break-word;' : '';

    return `<html><head>${this.bodyCss()}</head><body><article style="${docStyles}${wordWrap}">\n${content}\n</article></body></html>`;
  }

  applyCommand(command) {
    switch (command.name) {
      case 'left':
        this.styles.alignment = command.name;
        break;
      case 'right':
        this.styles.alignment = command.name;
        break;
      case 'center':
        this.styles.alignment = command.name;
        break;
      case 'size':
        this.styles.size = command.value;
        break;
      case 'bold':
        this.styles.bold = command.off === true ? false : true;
        break;
      case 'italic':
        this.styles.italic = command.off === true ? false : true;
        break;
      case 'underline':
        this.styles.underline = command.off === true ? false : true;
        break;
      case 'invert':
        this.styles.invert = command.off === true ? false : true;
        break;
      case 'small':
        this.styles.small = command.off === true ? false : true;
        break;
      case 'line':
      case 'text':
        this.addLine(command, { ...this.styles });
        break;
      default:
        this.styles.size = 1;
        this.addLine(command, { ...this.styles });
        break;
    }
  }

  addLine(command, styles) {
    this.lines.push(new RPMLDocumentLine(command, styles, this, this.lines[this.lines.length - 1]));
  }

  calculateWidth(chars, fontFamily, fontSize) {
    const canvas = createCanvas(200, 50); // The size here doesn't matter for measuring text width
    const context = canvas.getContext('2d');

    context.font = `${fontSize} ${fontFamily}`;

    return context.measureText('W'.repeat(chars)).width;
  }
}

class RPMLDocumentLine {
  constructor(command, styles, builder, precedingLine) {
    this.command = command;
    this.styles = styles;
    this.builder = builder;
    this.precedingLine = precedingLine;
    this.blockClasses = [];
    this.contentClasses = [];

    if (this.styles.small) this.contentClasses.push('small');

    if (this.styles.bold) this.contentClasses.push('bold');

    if (this.styles.italic) this.contentClasses.push('italic');

    if (this.styles.underline) this.contentClasses.push('underline');

    if (this.styles.invert) this.contentClasses.push('invert');

    if (this.styles.size && (this.command.name == 'line' || this.command.name == 'text')) {
      this.blockClasses.push('size-' + this.styles.size);
    }

    this.blockClasses.push(this.styles.alignment);
  }

  toHtml() {
    let html = ``;
    let value = this.command.value || ``;
    const blockClasses = this.blockClasses.join(' ');
    const contentClasses = this.contentClasses.join(' ');

    switch (this.command.name) {
      case 'image':
        let size = '';
        if (this.command.attributes.size) {
          size = `width="${this.command.attributes.size}%"`;
        }

        html += `<div class="${blockClasses} img"><img src="${this.command.attributes.src}" ${size}></div>`;
        break;
      case 'line':
        if (this.precedingLine && this.precedingLine.command.name == 'text') {
          html += `<br>`;
        } else {
          html += `<div class="${blockClasses}"><span class="${contentClasses}">${value}</span></div>`;
        }
        break;
      case 'text':
        html += `<span class="${contentClasses}">${value}</span>`;
        break;
      case 'rule':
        const charCount = this.builder.chars;
        if (this.command.attributes.line == 'dashed') {
          let char = this.command.attributes.style == 'double' ? '=' : '-';
          html += `<div class="${blockClasses} rule rule-dashed"><span class="${contentClasses}">${char.repeat(this.command.attributes.width || charCount)}</span></div>`;
        } else {
          let width = '100%';
          if (this.command.attributes.width) {
            width = `${(this.command.attributes.width / charCount) * 100.0}%`;
          }
          let cls = ` ${this.command.attributes.style == 'double' ? 'border-bottom: 1px solid black; height: 3px;' : ''}`;
          html += `<div class="${blockClasses} rule" style="position:relative;"><div class="rule-solid${cls}" style="width: ${width};"></div></div>`;
        }
        break;
      case 'table':
        html += `<table>`;

        for (const row of this.command.attributes.rows) {
          html += `<tr>`;

          for (const [index, cell] of row.entries()) {
            let width,
              widthStyle = '',
              widthPX,
              marginColumn = '',
              alignment = 'left';
            let margin = this.command.attributes.margin || 0;
            margin = parseInt(margin);

            if (this.command.attributes.align) {
              alignment = this.command.attributes.align[index];
            }

            if (this.command.attributes.width) {
              width = this.command.attributes.width[index];

              if (width == '*') {
                width = this.builder.chars;
                this.command.attributes.width
                  .filter((w) => w != '*')
                  .forEach((w) => (width -= parseInt(w) + margin));
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

          html += '</tr>';
        }

        html += '</table>';
        break;
      case 'barcode':
        html += `<div class="${blockClasses} barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${this.command.attributes.data}&code=${this.command.attributes.type}" width="100%"></div>`;
        break;
      case 'qrcode':
        // super rough implementation of sizing
        let dims = parseInt(21 * this.command.attributes.size);
        html += `<div class="${blockClasses} qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=${dims}x${dims}&data=${this.command.attributes.data}"></div>`;
        break;
    }

    return html;
  }
}
