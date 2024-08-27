import { expect } from 'chai';
import { parseTPML } from '../src/index.js';

describe('TPML Parser', () => {
  it('should parse basic commands', () => {
    const input = "{document word-wrap=true}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'document',
        attributes: {
          wordWrap: true
        }
      }
    ]);
  });

  it('should ignore comments', () => {
    const input = "{# this is a comment }\n{document word-wrap=true}";
    const output = parseTPML(input);

    expect(output.length).to.equal(1);
    expect(output[0].name).to.equal('document');
  });

  it('should handle unknown commands', () => {
    const input = "{unknownCommand}";
    const output = parseTPML(input);

    expect(output[0].name).to.equal('unknown');
  });

  // Image Tag
  it('should parse image tag with multiple attributes', () => {
    const input = "{image src='image.png' width=200 height=100 dither='bayer'}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'image',
        attributes: {
          src: 'image.png',
          width: 200,
          height: 100,
          dither: 'bayer'
        }
      }
    ]);
  });

  // Rule Tag
  it('should parse rule tag with keyword options', () => {
    const input = "{rule width=2 line='solid' style='double'}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'rule',
        attributes: {
          width: 2,
          line: 'solid',
          style: 'double'
        }
      }
    ]);
  });

  // Text Tag
  it('should parse text tag with string parameter', () => {
    const input = "{text This is a sample text}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is a sample text'
      }
    ]);
  });

  // Height Tag
  it('should parse height tag with numeric parameter', () => {
    const input = "{height 3}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'height',
        value: 3
      }
    ]);
  });

  // Barcode Tag
  it('should parse barcode tag with multiple attributes', () => {
    const input = "{barcode type='upca' data='012345678905' height=75 position='below'}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'barcode',
        attributes: {
          type: 'upca',
          data: '012345678905',
          height: 75,
          position: 'below'
        }
      }
    ]);
  });

  // QRCode Tag
  it('should parse qrcode tag with multiple attributes', () => {
    const input = "{qrcode data='https://example.com' level='m' model='2' size=7}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'qrcode',
        attributes: {
          data: 'https://example.com',
          level: 'm',
          model: '2',
          size: 7
        }
      }
    ]);
  });

  // Escaped Braces
  it('should handle escaped braces inside tags', () => {
    const input = "{text This is \\{escaped\\} text}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is {escaped} text'
      }
    ]);
  });

  // Escaped Quotes
  it('should handle escaped quote inside attributes', () => {
    const input = `{text "This is a string with an escaped quote: \"quote\" inside"}`;
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is a string with an escaped quote: "quote" inside'
      }
    ]);
  });

  // Unknown Command
  it('should handle unknown commands gracefully', () => {
    const input = "{unknownCommand someValue}";
    const output = parseTPML(input);

    expect(output).to.deep.equal([
      {
        name: 'unknown',
        key: 'unknownCommand',
        attributes: 'someValue'
      }
    ]);
  });

    // Document Tag
    it('should parse document tag with boolean attribute', () => {
      const input = `{document
        word-wrap=true
      }`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'document',
          attributes: {
            wordWrap: true
          }
        }
      ]);
    });

    // Comment Handling
    it('should ignore comments in the template', () => {
      const input = `{# this is a comment }`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([]);
    });

    // Center Tag
    it('should parse center tag without attributes', () => {
      const input = `{center}`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([{ name: 'center' }]);
    });

    // Image Tag with Complex Attributes
    it('should parse image tag with multiple attributes including data URLs', () => {
      const input = `{image
        src="data:image/svg+xml,%3Csvg ... %3C/svg%3E"
        width=360
        height=192
        dither=atkinson
      }`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'image',
          attributes: {
            src: "data:image/svg+xml,%3Csvg ... %3C/svg%3E",
            width: 360,
            height: 192,
            dither: "atkinson"
          }
        }
      ]);
    });

    // Line Tag
    it('should parse line tag correctly', () => {
      const input = `{line}`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([{ name: 'line' }]);
    });

    // Text Lines
    it('should parse plain text lines correctly', () => {
      const input = `LAYBY DOCKET`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        { name: 'line', value: 'LAYBY DOCKET' }
      ]);
    });

    // Left Tag
    it('should parse left tag without attributes', () => {
      const input = `{left}`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([{ name: 'left' }]);
    });

    // Table Tag with Rows
    it('should parse table tag with multiple rows and attributes', () => {
      const input = `{table
        cols=2
        margin=1
        width=[10,*]
        row=["Date/Time","08/09/23 12:34 PM"]
        row=["Sale ID","_6P20R3R05"]
        row=["Staff ID","John Smith"]
        row=["Customer","CHIN MORPH"]
        row=["Phone","_6P20Q4DJU"]
      }`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'table',
          attributes: {
            cols: 2,
            margin: 1,
            width: [10, "*"],
            rows: [
              ["Date/Time", "08/09/23 12:34 PM"],
              ["Sale ID", "_6P20R3R05"],
              ["Staff ID", "John Smith"],
              ["Customer", "CHIN MORPH"],
              ["Phone", "_6P20Q4DJU"]
            ]
          }
        }
      ]);
    });

    // Rule Tag
    it('should parse rule tag correctly', () => {
      const input = `{rule}`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          "attributes": {
            "line": "dashed",
            "style": "single"
          },
          "name": "rule"
        }
      ]);
    });

    // Bold Tag and EndBold
    it('should parse bold tag and its closing endBold tag', () => {
      const input = `{bold}LAYBY TERMS AND CONDITIONS\n{endBold}`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        { name: 'bold' },
        { name: 'line', value: 'LAYBY TERMS AND CONDITIONS' },
        { name: 'bold', off: true }
      ]);
    });

    // Nested Table with Multiple Rows
    it('should parse nested table with bold and alignment attributes', () => {
      const input = `{bold}
      {table
        cols=4
        margin=1
        align=[left,left,right,right]
        width=[*,4,8,8]
        row=["Item","Qty","Unit","Total"]
      }
      {endBold}`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        { name: 'bold' },
        {
          name: 'table',
          attributes: {
            cols: 4,
            margin: 1,
            align: ['left', 'left', 'right', 'right'],
            width: ['*', 4, 8, 8],
            rows: [["Item", "Qty", "Unit", "Total"]]
          }
        },
        { name: 'bold', off: true }
      ]);
    });

    // Parsing List Items in Text
    it('should parse plain text with line breaks', () => {
      const input = `i) Maximum 3 months lay-by period\nii) Payments must be made every 2 weeks\niii) Cancellation will incur a 10% fee`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        { name: 'line', value: 'i) Maximum 3 months lay-by period' },
        { name: 'line', value: 'ii) Payments must be made every 2 weeks' },
        { name: 'line', value: 'iii) Cancellation will incur a 10% fee' }
      ]);
    });

    it('should parse tags with empty attributes correctly', () => {
      const input = "{image src='' width=100}";
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'image',
          attributes: {
            src: '',
            width: 100,
            dither: "threshold"
          }
        }
      ]);
    });

    it('should handle multiple escaped characters within a value', () => {
      const input = "{text This is \\{escaped\\}, and this is \\[escaped\\]}";
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'text',
          value: 'This is {escaped}, and this is [escaped]'
        }
      ]);
    });

    it('should handle mixed case keywords correctly', () => {
      const input = "{DoCuMeNt WoRd-WrAp=true}";
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'document',
          attributes: {
            wordWrap: true
          }
        }
      ]);
    });

    it('should handle whitespace around commas in splittable attributes', () => {
      const input = "{table align='left , right'}";
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'table',
          attributes: {
            align: ['left', 'right']
          }
        }
      ]);
    });

    it('should handle unusual but valid attribute values', () => {
      const input = "{rule width=0 line='solid' style='single'}";
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        {
          name: 'rule',
          attributes: {
            width: 0,
            line: 'solid',
            style: 'single'
          }
        }
      ]);
    });

    it('should handle adjacent tags on separate lines correctly', () => {
      const input = `
{bold}
{italic}
Some text
{endItalic}
{endBold}
`;
      const output = parseTPML(input);

      expect(output).to.deep.equal([
        { name: 'bold' },
        { name: 'italic' },
        { name: 'line', value: 'Some text' },
        { name: 'italic', off: true },
        { name: 'bold', off: true }
      ]);
    });


    it('should correctly parse the entire TPML input', () => {
      const input = `
{document
  word-wrap=true
}
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
Boulder Megastore
{line}
ABN 123456789
{line}
123 Boulder Rd, Boulder, WA 6432
Ph: 08 9022 1234
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
3) Cancellations incur 10% fee
`;

      const output = parseTPML(input);

      const expectedOutput = [
        {
          "name": "document",
          "attributes": {
            "wordWrap": true
          }
        },
        {
          "name": "center"
        },
        {
          "name": "image",
          "attributes": {
            "src": "https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189",
            "size": 80,
            "dither": "atkinson"
          }
        },
        {
          "name": "line"
        },
        {
          "name": "line",
          "value": "LAYBY DOCKET"
        },
        {
          "name": "line"
        },
        {
          "name": "bold"
        },
        {
          "name": "line",
          "value": "Mountain Outfitters"
        },
        {
          "name": "bold",
          "off": true
        },
        {
          "name": "line",
          "value": "Boulder Megastore"
        },
        {
          "name": "line"
        },
        {
          "name": "line",
          "value": "ABN 123456789"
        },
        {
          "name": "line"
        },
        {
          "name": "line",
          "value": "123 Boulder Rd, Boulder, WA 6432"
        },
        {
          "name": "line",
          "value": "Ph: 08 9022 1234"
        },
        {
          "name": "left"
        },
        {
          "name": "line"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 2,
            "margin": 1,
            "align": [
              "left",
              "right"
            ],
            "rows": [
              [
                "09/09/2023",
                "12:34:56PM"
              ]
            ]
          }
        },
        {
          "name": "line"
        },
        {
          "name": "bold"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 3,
            "margin": 1,
            "align": [
              "left",
              "right",
              "right"
            ],
            "width": [
              "*",
              4,
              8
            ],
            "rows": [
              [
                "Item",
                "Qty",
                "Total"
              ]
            ]
          }
        },
        {
          "name": "bold",
          "off": true
        },
        {
          "name": "rule",
          "attributes": {
            "line": "dashed",
            "style": "single"
          }
        },
        {
          "name": "table",
          "attributes": {
            "cols": 3,
            "margin": 1,
            "align": [
              "left",
              "right",
              "right"
            ],
            "width": [
              "*",
              4,
              8
            ],
            "rows": [
              [
                "Plain T-Shirt",
                "1",
                "$10.99"
              ],
              [
                "123456 @$10.99 ea.",
                "",
                ""
              ],
              [
                "Black Jeans",
                "1",
                "$29.99"
              ],
              [
                "654321 @$29.99 ea.",
                "",
                ""
              ],
              [
                "Baseball Cap",
                "12",
                "$9.99"
              ],
              [
                "987654 @$9.99 ea.",
                "",
                ""
              ],
              [
                "Shoes",
                "2",
                "$99.98"
              ],
              [
                "456789 @$49.99 ea.",
                "",
                ""
              ],
              [
                "Socks",
                "1",
                "$1.99"
              ],
              [
                "987654 @$1.99 ea.",
                "",
                ""
              ]
            ]
          }
        },
        {
          "name": "center"
        },
        {
          "name": "rule",
          "attributes": {
            "line": "dashed",
            "style": "single"
          }
        },
        {
          "name": "left"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 2,
            "margin": 1,
            "align": [
              "left",
              "right"
            ],
            "width": [
              "*",
              8
            ],
            "rows": [
              [
                "Subtotal",
                "$102.95"
              ],
              [
                "Tax",
                "$10.30"
              ]
            ]
          }
        },
        {
          "name": "bold"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 2,
            "margin": 1,
            "align": [
              "left",
              "right"
            ],
            "width": [
              "*",
              8
            ],
            "rows": [
              [
                "Total",
                "$113.25"
              ]
            ]
          }
        },
        {
          "name": "bold",
          "off": true
        },
        {
          "name": "line"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 2,
            "margin": 1,
            "align": [
              "left",
              "right"
            ],
            "width": [
              "*",
              8
            ],
            "rows": [
              [
                "Cash",
                "$120.00"
              ],
              [
                "Change",
                "-$6.75"
              ]
            ]
          }
        },
        {
          "name": "bold"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 2,
            "margin": 1,
            "align": [
              "left",
              "right"
            ],
            "width": [
              "*",
              8
            ],
            "rows": [
              [
                "Balance",
                "$0.00"
              ]
            ]
          }
        },
        {
          "name": "bold",
          "off": true
        },
        {
          "name": "line"
        },
        {
          "name": "table",
          "attributes": {
            "cols": 2,
            "margin": 1,
            "align": [
              "left",
              "right"
            ],
            "width": [
              10,
              "*"
            ],
            "rows": [
              [
                "Reference",
                "SC1234567890"
              ],
              [
                "Staff",
                "JD"
              ],
              [
                "Customer",
                "Jane Smith"
              ],
              [
                "Email",
                "js@example.com"
              ],
              [
                "Phone",
                "0400 123 456"
              ]
            ]
          }
        },
        {
          "name": "line"
        },
        {
          "name": "center"
        },
        {
          "name": "qrcode",
          "attributes": {
            "data": "https://example.com/orders/1234567890",
            "size": 6,
            "model": "1",
            "level": "l"
          }
        },
        {
          "name": "line"
        },
        {
          "name": "rule",
          "attributes": {
            "line": "dashed",
            "style": "single"
          }
        },
        {
          "name": "line"
        },
        {
          "name": "bold"
        },
        {
          "name": "left"
        },
        {
          "name": "line",
          "value": "Layby Terms & Conditions"
        },
        {
          "name": "bold",
          "off": true
        },
        {
          "name": "line",
          "value": "1) Maximum layby period 3 months"
        },
        {
          "name": "line",
          "value": "2) Payments due every 2 weeks"
        },
        {
          "name": "line",
          "value": "3) Cancellations incur 10% fee"
        }
      ];

      expect(output).to.deep.equal(expectedOutput);
    });

});
