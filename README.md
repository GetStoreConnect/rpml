# Receipt Printer Markup Language (RPML)

## Language Overview

Receipt Printer Markup Language (RPML) is a lightweight markup language designed for formatting and generating receipt print documents, eg receipts. RPML provides a set of tags and attributes to control text alignment, styling, and the inclusion of elements like images, barcodes, and tables.

See the language reference for details.

* [Language Reference](docs/language.md)


## Usage

This JavaScript package allows you to do the following.

* Parse RPML into commands
* Render commands into an HTML preview
* Encode commands with [Receipt Printer Encoder](https://github.com/NielsLeenheer/ReceiptPrinterEncoder)

**Note:** This package is in alpha and minor updates may include breaking changes.


### Installation

```
npm install rpml
```


### Parse RPML into commands

```js
import { parse } from 'rpml'

const commands = parse('Some RPML markup')
```

This returns an array of command objects which contain the parsed information. You will likely pass these commands on to the HTML renderer or printer encoder.


### Render HTML preview

Use `renderHtml` to convert the commands into an HTML document for previewing.

This is a full HTML document that is best shown using an iframe.

```js
import { parse, renderHtml } from 'rpml'

const commands = parse('Some RPML markup')
const html = renderHtml({commands})
```

Or parse and render in one call.

```js
import { parseAndRenderHtml } from 'rpml'

const html = parseAndRenderHtml('Some RPML markup')
```

These functions accept the following parameters.

* `chars`: the width of the receipt. Defaults to `32`.
* `fontFamily`: defaults to `'monospace'`.
* `fontSize`: defaults to `'14px'`.
* `lineHeight`: defaults to `'1.3em'`.
* `createCanvas`: the function for creating a canvas. Defaults to using in-browser `document.createElement`. You will need to override this if you are calling this through Node.js.


### Encode with Receipt Printer Encoder

The `encodeReceipt` function will apply the parsed commands to Receipt Printer Encoder. It is an asynchornous function to handle loading images.

```js
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder'
import { parse, encodeReceipt } from 'rpml'

// Instantiate the encoder
let encoder = new ReceiptPrinterEncoder({
  language: 'esc-pos',
  columns: 42,
  imageMode: 'raster',
})

// Apply RPML commands to the encoder
const commands = parse('Some RPML markup')
encoder = await encodeReceipt({
  commands
  encoder,
  dots: 512,
})

// Print
await currentDevice.transferOut(1, encoder.encode());
```

Alternatively you can use `parseAndEncodeReceipt` to do it in one call.

These functions accept the following parameters.

* `encoder`: the Receipt Printer Encoder to apply the commands to. It should have `language` and `columns` set.
* `dots`: The number of dots wide for the printer.
* `createImage`: The function used to create an image tag to load the images. Defaults to `() => new Image()`. You may need to override this if you are calling through Node.js.


## Contributing

RPML is in early development. Issues and pull requests are welcome.

To set up your environment, check out this repo and run the following commands.

```
npm install
npm run test
```

Also see [codemirror-lang-rpml](https://github.com/GetStoreConnect/codemirror-lang-rpml).
