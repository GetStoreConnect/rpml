export function renderHtml({
  commands,
  createCanvas,
  chars = 32,
  fontFamily = 'monospace',
  fontSize = '14px',
  lineHeight = '1.3em',
  wordWrap = false,
}) {
  const styles = {
    alignment: 'left',
    size: 1,
    bold: false,
    italic: false,
    underline: false,
    invert: false,
    small: false,
  };

  const docWidth = calculateDocWidth({ createCanvas, chars, fontFamily, fontSize });

  const state = {
    html: '',
    previousContentCommand: null,
    styles,
    chars,
    docWidth,
    wordWrap,
  };

  for (const command of commands) {
    applyCommand({ command, state });
  }

  return wrapDocument({ state, fontFamily, fontSize, lineHeight });
}

export function calculateDocWidth({ createCanvas, chars, fontFamily, fontSize }) {
  const canvas = createCanvas(200, 50); // The size here doesn't matter for measuring text width
  const context = canvas.getContext('2d');

  context.font = `${fontSize} ${fontFamily}`;

  return context.measureText('W'.repeat(chars)).width;
}

export function applyCommand({ command, state }) {
  switch (command.name) {
    case 'document':
      state.wordWrap = command.attributes.wordWrap;
      break;
    case 'left':
      state.styles.alignment = command.name;
      break;
    case 'right':
      state.styles.alignment = command.name;
      break;
    case 'center':
      state.styles.alignment = command.name;
      break;
    case 'size':
      state.styles.size = command.value;
      break;
    case 'bold':
      state.styles.bold = command.off === true ? false : true;
      break;
    case 'italic':
      state.styles.italic = command.off === true ? false : true;
      break;
    case 'underline':
      state.styles.underline = command.off === true ? false : true;
      break;
    case 'invert':
      state.styles.invert = command.off === true ? false : true;
      break;
    case 'small':
      state.styles.small = command.off === true ? false : true;
      break;
    case 'line':
    case 'text':
      applyContentCommand({ command, state });
      break;
    default:
      state.styles.size = 1;
      applyContentCommand({ command, state });
      break;
  }
}

export function applyContentCommand({ command, state }) {
  state.html += renderContent({ command, state }) + '\n';
  state.previousContentCommand = command;
}

export function renderContent({ command, state }) {
  const styles = state.styles;

  switch (command.name) {
    case 'image':
      return renderImage({ command, styles });
    case 'line':
      return renderLine({ command, state });
    case 'text':
      return renderText({ command, styles });
    case 'rule':
      return renderRule({ command, state });
    case 'table':
      return renderTable({ command, state });
    case 'barcode':
      return renderBarcode({ command, styles });
    case 'qrcode':
      return renderQRCode({ command, styles });
    default:
      throw new Error(`Unknown command: ${command.name}`);
  }
}

export function renderImage({ command, styles }) {
  const widthAttribute = command.attributes.size ? `width="${command.attributes.size}%"` : '';
  const blockClasses = buildBlockClasses({ command, styles });
  return `<div class="${blockClasses} img"><img src="${command.attributes.src}" ${widthAttribute}></div>`;
}

export function renderLine({ command, state }) {
  if (state.previousContentCommand?.name == 'text') {
    return '<br>';
  }

  const blockClasses = buildBlockClasses({ command, styles: state.styles });
  const contentClasses = buildContentClasses({ styles: state.styles });
  const value = command.value || '';
  return `<div class="${blockClasses}"><span class="${contentClasses}">${value}</span></div>`;
}

export function renderText({ command, styles }) {
  const contentClasses = buildContentClasses({ styles });
  const value = command.value || '';
  return `<span class="${contentClasses}">${value}</span>`;
}

export function renderRule({ command, state }) {
  const charCount = state.chars;
  const blockClasses = buildBlockClasses({ command, styles: state.styles });

  if (command.attributes.line == 'dashed') {
    const char = command.attributes.styles == 'double' ? '=' : '-';
    const contentClasses = buildContentClasses({ styles: state.styles });
    return `<div class="${blockClasses} rule rule-dashed"><span class="${contentClasses}">${char.repeat(command.attributes.width || charCount)}</span></div>`;
  } else {
    let width = '100%';
    if (command.attributes.width) {
      width = `${(command.attributes.width / charCount) * 100.0}%`;
    }
    const doubleStyle = ` ${command.attributes.style == 'double' ? 'border-bottom: 1px solid black; min-height: 3px; height: 3px;' : ''}`;
    return `<div class="${blockClasses} rule" style="position:relative;"><div class="rule-solid" style="width: ${width};${doubleStyle}"></div></div>`;
  }
}

export function renderTable({ command, state }) {
  let html = '<table>';

  const contentClasses = buildContentClasses({ styles: state.styles });
  const margin = parseInt(command.attributes.margin || 0);
  for (const row of command.attributes.rows) {
    html += '<tr>';

    for (const [index, content] of row.entries()) {
      html += renderTableCell({ content, index, contentClasses, margin, command, state });
      if (index < row.length - 1) {
        html += renderTableCellMargin({ contentClasses, margin, state });
      }
    }

    html += '</tr>';
  }

  html += '</table>';

  return html;
}

export function renderTableCell({ content, index, contentClasses, margin, command, state }) {
  let width;
  if (command.attributes.width) {
    width = command.attributes.width[index];

    if (width == '*') {
      width = state.chars;
      command.attributes.width
        .filter((w) => w != '*')
        .forEach((w) => (width -= parseInt(w) + margin));
    } else {
      width = parseInt(width);
    }
  } else {
    // no widths set so split evenly, factoring in margin
    const splitWidth = parseInt(state.chars / command.attributes.cols);
    width = splitWidth - margin;
  }

  const alignment = command.attributes.align ? command.attributes.align[index] : 'left';
  const widthPx = (state.docWidth / state.chars) * width;
  const widthStyle = `width: ${widthPx}px; max-width: ${widthPx}px; min-width: ${widthPx}px;`;
  return `<td data-cols="${width}" class="${contentClasses}" style="text-align: ${alignment}; ${widthStyle}">${content}</td>`;
}

export function renderTableCellMargin({ contentClasses, margin, state }) {
  const widthPx = (state.docWidth / state.chars) * margin;
  const widthStyle = `width: ${widthPx}px; max-width: ${widthPx}px; min-width: ${widthPx}px;`;
  return `<td data-cols="${margin}" class="${contentClasses}" style="${widthStyle}">&nbsp;</td>`;
}

export function renderBarcode({ command, styles }) {
  const blockClasses = buildBlockClasses({ command, styles });
  return `<div class="${blockClasses} barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${command.attributes.data}&code=${command.attributes.type}" width="100%"></div>`;
}

export function renderQRCode({ command, styles }) {
  // super rough implementation of sizing
  const size = parseInt(21 * command.attributes.size);
  const blockClasses = buildBlockClasses({ command, styles });
  return `<div class="${blockClasses} qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${command.attributes.data}"></div>`;
}

export function buildContentClasses({ styles }) {
  const classes = [];

  if (styles.small) {
    classes.push('small');
  }

  if (styles.bold) {
    classes.push('bold');
  }

  if (styles.italic) {
    classes.push('italic');
  }

  if (styles.underline) {
    classes.push('underline');
  }

  if (styles.invert) {
    classes.push('invert');
  }

  return classes.join(' ');
}

export function buildBlockClasses({ command, styles }) {
  const classes = [];

  if (styles.size && (command.name == 'line' || command.name == 'text')) {
    classes.push('size-' + styles.size);
  }

  classes.push(styles.alignment);

  return classes.join(' ');
}

export function wrapDocument({ state, fontFamily, fontSize, lineHeight }) {
  const docStyles = `width: ${state.docWidth}px; margin: 0 auto;`;
  const wordWrap = state.wordWrap ? 'word-wrap: break-word;' : '';

  return `
    <html>
      <head>
        <style>${css({ fontFamily, fontSize, lineHeight })}</style>
      </head>
      <body>
        <article style="${docStyles}${wordWrap}">
          ${state.html}
        </article>
      </body>
    </html>
  `;
}

export function css({ fontFamily, fontSize, lineHeight }) {
  return `
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize};
      line-height: ${lineHeight};
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
  `;
}
