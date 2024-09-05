# **Thermal Printer Markup Language (TPML)**

## **Overview**

Thermal Printer Markup Language (TPML) is a lightweight markup language designed for formatting and generating thermal print documents, eg receipts. TPML provides a set of tags and attributes to control text alignment, styling, and the inclusion of elements like images, barcodes, and tables.

## **Basic Syntax**

- **Tags**: Enclosed in curly braces `{}`. Each tag must start on a new line.
- **Attributes**: Specified as `key=value` pairs within a tag.
- **Parameters**: Some tags take parameters instead of attributes.
- **Comments**: Lines starting with `{# ... }` are treated as comments and have no effect on the output.
- **Blank Lines**: Blank lines in the markup are ignored.

## **Tag Reference**

### **`document`**

Defines the start of a document with optional configuration attributes. This tag is required at the beginning of the document.

**Attributes:**
- `word-wrap`: Enables word wrapping. Accepts `true` or `false`. Default is `false`.

**Example:**

```tpml
{document word-wrap=true}
```

### **`line`**

Inserts a blank line.

**Examples:**

```tpml
This has a blank line after it
{line}
This has a blank line before it
```

### **`bold`, `italic`, `underline`, `invert`, `small`**

These tags toggle text styles on or off. To turn off the style, use the corresponding `end` tag (e.g., `{endBold}`).

**Examples:**

```tpml
{bold}
This text is bold
{endBold}

{italic}
This text is italic
{endItalic}
```

### **`left`, `center`, `right`**

These align the subsequent content to the left, center, or right. The alignment remains in effect until changed.

**Examples:**

```tpml
{center}
CENTERED TEXT
{left}
LEFT ALIGNED TEXT
```
### **`text`**

The `text` tag is used to insert a line of text into the document. The content of the text is provided as a parameter to the tag.

**Parameter:**
- A string of text to be displayed.

**Example:**

```tpml
{text This is some sample text}
```

**Description:**
- The `text` tag directly inserts the provided string into the document as a line of text.
- If the string contains braces, they should be escaped (e.g. `\{`).

### **`size`**

This sets the text size. This only applies to normal line text. It does not apply to tables or images etc. The setting remains in effect until changed or turned off by a tag that does not support size.

**Parameter:**
- A numeric value representing the size. Options are: 1 - 6. Defaults to 1. Size 2 is double the font size of size 1, and so on.

**Example:**

```tpml
{size 3}
I am 3 times as big!
{size 1}
I am normal size again.
```

### **`image`**

Inserts an image into the document.

**Attributes:**
- `src`: The source URL or base64-encoded data URL of the image. **(Required)**
- `width`: The width of the image in pixels. Must be a multiple of 8. **(Optional)**
- `height`: The height of the image in pixels. Must be a multiple of 8. **(Optional)**
- `dither`: Dithering method for the image. Options are:
  - `"threshold"`
  - `"bayer"`
  - `"floydsteinberg"`
  - `"atkinson"` (Default)

**Example:**

```tpml
{image
  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAA..."
  width=320
  height=240
  dither=atkinson
}
```

### **`barcode`**

Generates a barcode in the document.

**Attributes:**
- `type`: Barcode type. **(Required)** Options are:
  - `"upca"`
  - `"ean13"`
  - `"ean8"`
  - `"code39"`
  - `"code128"`
- `data`: The data to encode in the barcode. **(Required)**
- `height`: Height of the barcode in printer dots. Default is `50`.
- `position`: Where to display text relative to the barcode. Options are:
  - `"none"` (Default)
  - `"above"`
  - `"below"`
  - `"both"`

**Example:**

```tpml
{barcode type='upca' data='012345678905' height=100 position='below'}
```

**Note:** Barcodes are highly dependent on the printer used. If the barcode is not supported, the barcode will not be printed, or the raw data will be printed instead, depending on the model and manufacturer of the printer. Length and validity of the barcode may also affect whether the printer can print it.

### **`qrcode`**

Generates a QR code in the document.

**Attributes:**
- `data`: The data to encode in the QR code. **(Required)**
- `level`: Error correction level. Options are:
  - `"l"` (Default)
  - `"m"`
  - `"q"`
  - `"h"`
- `model`: QR code model version. Options are:
  - `"1"` (Default)
  - `"2"`
- `size`: The size of the QR code in printer dots. Options are from `1` to `8`. Default is `6`.

**Example:**

```tpml
{qrcode data='https://example.com' level='m' model='2' size=7}
```

**Note:** QR codes are highly dependent on the printer used. If the QR code is not supported, the QR code will not be printed, or the raw data will be printed instead, depending on the model and manufacturer of the printer.

### **`table`**

Creates a table with specified rows and columns, as well as other formatting options.

**Attributes:**
- `cols`: Number of columns in the table. This is optional and can be deduced from the first row if not provided.
- `margin`: The margin between columns in printer dots.
- `width`: Column widths in printer dots, separated by commas. One column can be set to maximum remaining width by using the `*` character. This allows layouts to work for both narrow and wide paper rolls. If not supplied, the columns will be equally spaced.
- `align`: Alignment of text in each column. Options are:
  - `"left"` (Default)
  - `"right"`
- `row`: Defines a row in the table, with values separated by commas. **(Required)**

**Examples:**

The simplest table definition:
```tpml
{table
  row=["Total", "$89.99"]
}
```
A fuller table definition:
```tpml
{table
  cols=3
  width=[8,5,*]
  margin=1
  align=[left,right,right]
  row=["Item", "Qty", "Total"]
  row=["T-Shirt", "1", "$19.99"]
  row=["Shoes", "2", "$89.98"]
}
```

### **`rule`**

Creates a horizontal rule with optional style and width.

**Attributes:**
- `width`: Thickness of the rule in characters. **(Optional)**
- `line`: Line style. Options are:
  - `"solid"`
  - `"dashed"` (Default)
- `style`: Options are:
  - `"single"` (Default)
  - `"double"`

**Example:**

```tpml
{rule width=2 line='dashed' style='single'}
```

## **Comments**

Comments can be added using `{# ... }`. Anything inside a comment block will be ignored by the parser.

**Example:**

```tpml
{# This is a comment and will be ignored }
```

## **Escaping Special Characters**

You can escape characters using a backslash `\`.

**Examples:**

```tpml
{text These braces are \{escaped\}}
```

## **Complete Example**

Below is a complete example of a TPML document:

```tpml
{document word-wrap=true}

{center}
INVOICE
{left}

{line}
{bold}
{center}
Mountain Outfitters
{endBold}
{left}
123 Boulder Rd, Boulder, WA 6432
Ph: 08 9022 1234
{line}

{table
  cols=2
  width=[10,*]
  row=["Date/Time", "08/09/2023 12:34 PM"]
  row=["Invoice #", "INV-12345"]
  row=["Customer", "John Doe"]
}

{rule width=1 line='solid'}

{bold}
{table
  cols=4
  align=[left,left,right,right]
  row=["Item", "Qty", "Price", "Total"]
}
{endBold}

{table
  cols=4
  align=[left,left,right,right]
  row=["T-Shirt", "2", "$19.99", "$39.98"]
  row=["Shoes", "1", "$89.99", "$89.99"]
}

{rule width=2 line='dashed'}

{table
  cols=2
  width=[*,10]
  align=[left,right]
  row=["Subtotal", "$129.97"]
  row=["Tax", "$12.99"]
  row=["Total", "$142.96"]
}

{center}
Thank you for your purchase!
{qrcode data='https://example.com' level='m' model='2' size=7}
```
