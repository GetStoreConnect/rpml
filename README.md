Documentation
=============

Overview
--------

Receipt Printer Markup Language (RPML) is a lightweight markup language designed for formatting and generating receipt print documents, eg receipts. RPML provides a set of tags and attributes to control text alignment, styling, and the inclusion of elements like images, barcodes, and tables.

Basic Syntax
------------

*   **Tags**: Enclosed in curly braces `{}`. Each tag must start on a new line.
*   **Attributes**: Specified as `key=value` pairs within a tag.
*   **Parameters**: Some tags take parameters instead of attributes.
*   **Comments**: Lines starting with `{# ... }` are treated as comments and have no effect on the output.
*   **Blank Lines**: Blank lines in the markup are ignored.

Tag Reference
-------------

### document

Defines the start of a document with optional configuration attributes. This tag is required at the beginning of the document.

**Attributes:**

*   `word-wrap`: Enables word wrapping. Accepts `true` or `false`. Default is `false`.
*   `bottom-margin`: The number of blank lines before the final cut. Default is `6`.
*   `cut`: The type of final cut. Can be `full`, `partial`, or `none`. Default is `partial`.


**Example:**

    {document word-wrap=true bottom-margin=5 cut=full}


### line

Inserts a blank line.

**Examples:**
```rpml
This has a blank line after it
{line}
This has a blank line before it
```

### newline

Adds a number of new lines.

**Examples:**
```rpml
This has three blank lines after it
{newline 3}
This has three blank lines before it
```


### bold, italic, underline, invert, small

These tags toggle text styles on or off. To turn off the style, use the corresponding `end` tag (e.g., `{endBold}`).

**Examples:**

    {bold}
    This text is bold
    {endBold}

    {italic}
    This text is italic
    {endItalic}


### left, center, right

These align the subsequent content to the left, center, or right. The alignment remains in effect until changed.

**Examples:**

    {center}
    CENTERED TEXT
    {left}
    LEFT ALIGNED TEXT


### text

The `text` tag is used to insert a line of text into the document. The content of the text is provided as a parameter to the tag.

**Parameter:**

*   A string of text to be displayed.

**Example:**

    {text This is some sample text}

**Description:**

*   The `text` tag directly inserts the provided string into the document as a line of text.
*   If the string contains braces, they should be escaped (e.g. `\{`).

### size

This sets the text size. This only applies to normal line text. It does not apply to tables or images etc. The setting remains in effect until changed or turned off by a tag that does not support size.

**Parameter:**

*   A numeric value representing the size. Options are: 1 - 6. Defaults to 1. Size 2 is double the font size of size 1, and so on.

**Example:**

    {size 3}
    I am 3 times as big!
    {size 1}
    I am normal size again.


### image

Inserts an image into the document.

**Attributes:**

*   `src`: The source URL or base64-encoded data URL of the image. **(Required)**
*   `width`: The width of the image in pixels. Must be a multiple of 8. **(Optional)**
*   `height`: The height of the image in pixels. Must be a multiple of 8. **(Optional)**
*   `dither`: Dithering method for the image. Options are:
    *   `"threshold"`
    *   `"bayer"`
    *   `"floydsteinberg"`
    *   `"atkinson"` (Default)

**Example:**

    {image
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAA..."
      width=320
      height=240
      dither=atkinson
    }


### barcode

Generates a barcode in the document.

**Attributes:**

*   `type`: Barcode type. **(Required)** Options are:
    *   `"upca"`
    *   `"ean13"`
    *   `"ean8"`
    *   `"code39"`
    *   `"code128"`
*   `data`: The data to encode in the barcode. **(Required)**
*   `height`: Height of the barcode in printer dots. Default is `50`.
*   `position`: Where to display text relative to the barcode. Options are:
    *   `"none"` (Default)
    *   `"above"`
    *   `"below"`
    *   `"both"`

**Example:**

    {barcode type='upca' data='012345678905' height=100 position='below'}

**Note:** Barcodes are highly dependent on the printer used. If the barcode is not supported, the barcode will not be printed, or the raw data will be printed instead, depending on the model and manufacturer of the printer. Length and validity of the barcode may also affect whether the printer can print it.

### qrcode

Generates a QR code in the document.

**Attributes:**

*   `data`: The data to encode in the QR code. **(Required)**
*   `level`: Error correction level. Options are:
    *   `"l"` (Default)
    *   `"m"`
    *   `"q"`
    *   `"h"`
*   `model`: QR code model version. Options are:
    *   `"1"` (Default)
    *   `"2"`
*   `size`: The size of the QR code in printer dots. Options are from `1` to `8`. Default is `6`.

**Example:**

    {qrcode data='https://example.com' level='m' model='2' size=7}

**Note:** QR codes are highly dependent on the printer used. If the QR code is not supported, the QR code will not be printed, or the raw data will be printed instead, depending on the model and manufacturer of the printer.

### table

Creates a table with specified rows and columns, as well as other formatting options.

**Attributes:**

*   `cols`: Number of columns in the table. This is optional and can be deduced from the first row if not provided.
*   `margin`: The margin between columns in printer dots.
*   `width`: Column widths in printer dots, separated by commas. One column can be set to maximum remaining width by using the `*` character. This allows layouts to work for both narrow and wide paper rolls. If not supplied, the columns will be equally spaced.
*   `align`: Alignment of text in each column. Options are:
    *   `"left"` (Default)
    *   `"right"`
*   `row`: Defines a row in the table, with values separated by commas. **(Required)**

**Examples:**

The simplest table definition:

    {table
      row=["Total", "$89.99"]
    }


A fuller table definition:

    {table
      cols=3
      width=[8,5,*]
      margin=1
      align=[left,right,right]
      row=["Item", "Qty", "Total"]
      row=["T-Shirt", "1", "$19.99"]
      row=["Shoes", "2", "$89.98"]
    }


### rule

Creates a horizontal rule with optional style and width.

**Attributes:**

*   `width`: Thickness of the rule in characters. **(Optional)**
*   `line`: Line style. Options are:
    *   `"solid"`
    *   `"dashed"` (Default)
*   `style`: Options are:
    *   `"single"` (Default)
    *   `"double"`

**Example:**

    {rule width=2 line='dashed' style='single'}

### cut

Cuts the receipt tape.

**Options**
* `full`: Performs a full cut. (Default)
* `partial`: Performs  a full cut.

**Example:**

    Full cut:
    {cut}
    Partial cut:
    {cut partial}

Comments
--------

Comments can be added using `{# ... }`. Anything inside a comment block will be ignored by the parser.

**Example:**

    {# This is a comment and will be ignored }

Escaping Special Characters
---------------------------

You can escape characters using a backslash `\`.

**Examples:**

    {text These braces are \{escaped\}}

Complete Example
------------------

Below is a complete example of a RPML document:

    {document word-wrap=true}
    {# header }
    {center}
    {image
      src="https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189"
      size=80
      dither=atkinson
    }
    {line}
    LAYBY DOCKET
    {line}
    {bold}
    Mountain Outfitters
    {endBold}
    {italic}
    Boulder Megastore
    {endItalic}
    {line}
    {underline}
    ABN 123456789
    {endUnderline}
    {line}
    {small}
    123 Boulder Rd, Boulder, WA 6432
    {right}
    Ph: 08 9022 1234
    {endSmall}
    {left}
    {line}
    {table
      cols=2
      margin=1
      align=[left,right]
      row=["09/09/2023", "12:34:56PM"]
    }
    {# items }
    {line}
    {bold}
    {table
      cols=3
      margin=1
      align=[left,right,right]
      width=[*,4,8]
      row=["Item","Qty","Total"]
    }
    {endBold}
    {rule}
    {table
      cols=3
      margin=1
      align=[left,right,right]
      width=[*,4,8]
      row=["Plain T-Shirt", "1", "$10.99"]
      row=["123456 @$10.99 ea.", "", ""]
      row=["Black Jeans", "1", "$29.99"]
      row=["654321 @$29.99 ea.", "", ""]
      row=["Baseball Cap", "12", "$9.99"]
      row=["987654 @$9.99 ea.", "", ""]
      row=["Shoes", "2", "$99.98"]
      row=["456789 @$49.99 ea.", "", ""]
      row=["Socks", "1", "$1.99"]
      row=["987654 @$1.99 ea.", "", ""]
    }
    {# total }
    {center}
    {rule}
    {left}
    {table
      cols=2
      margin=1
      align=[left,right]
      width=[*,8]
      row=["Subtotal","$102.95"]
      row=["Tax","$10.30"]
    }
    {bold}
    {table
      cols=2
      margin=1
      align=[left,right]
      width=[*,8]
      row=["Total","$113.25"]
    }
    {endBold}
    {line}
    {table
      cols=2
      margin=1
      align=[left,right]
      width=[*,8]
      row=["Cash","$120.00"]
      row=["Change","-$6.75"]
    }
    {bold}
    {table
      cols=2
      margin=1
      align=[left,right]
      width=[*,8]
      row=["Balance","$0.00"]
    }
    {endBold}
    {line}
    {table
      cols=2
      margin=1
      align=[left,right]
      width=[10,*]
      row=["Reference","SC1234567890"]
      row=["Staff","JD"]
      row=["Customer","Jane Smith"]
      row=["Email","js@example.com"]
      row=["Phone","0400 123 456"]
    }
    {line}
    {center}
    {qrcode
      data="https://example.com/orders/1234567890"
      size=6
      model=1
    }
    {# layby }
    {line}
    {rule}
    {line}
    {bold}
    {left}
    Layby Terms & Conditions
    {endBold}
    1) Maximum layby period 3 months
    2) Payments due every 2 weeks
    {invert}
    3) Cancellations incur 10% fee
    {endInvert}
