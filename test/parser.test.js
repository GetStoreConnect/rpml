import { expect } from 'chai';
import { parse } from '../src/parser.js';

describe('Parser', () => {
  it('parses basic commands', () => {
    const markup = '{document word-wrap=true}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'document',
        attributes: {
          bottomMargin: 6,
          cut: 'partial',
          wordWrap: true,
        },
      },
    ]);
  });

  it('ignores comments', () => {
    const markup = '{# this is a comment }\n{document word-wrap=true}';
    const output = parse(markup);

    expect(output.length).to.equal(1);
    expect(output[0].name).to.equal('document');
  });

  it('handles unknown commands', () => {
    const markup = '{unknownCommand}';
    const output = parse(markup);

    expect(output[0].name).to.equal('unknown');
  });

  // Image Tag
  it('parses image tag with multiple attributes', () => {
    const markup = "{image src='image.png' width=200 height=100 dither='bayer'}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'image',
        attributes: {
          src: 'image.png',
          width: 200,
          height: 100,
          dither: 'bayer',
        },
      },
    ]);
  });

  // Rule Tag
  it('parses rule tag with keyword options', () => {
    const markup = "{rule width=2 line='solid' style='double'}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'rule',
        attributes: {
          width: 2,
          line: 'solid',
          style: 'double',
        },
      },
    ]);
  });

  // Text Tag
  it('parses text tag with string parameter', () => {
    const markup = '{text This is a sample text}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is a sample text',
      },
    ]);
  });

  // Height Tag
  it('parses size tag with numeric parameter', () => {
    const markup = '{size 3}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'size',
        value: 3,
      },
    ]);
  });

  // Barcode Tag
  it('parses barcode tag with multiple attributes', () => {
    const markup = "{barcode type='upca' data='012345678905' height=75 position='below'}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'barcode',
        attributes: {
          type: 'upca',
          data: '012345678905',
          height: 75,
          position: 'below',
        },
      },
    ]);
  });

  // QRCode Tag
  it('parses qrcode tag with multiple attributes', () => {
    const markup = "{qrcode data='https://example.com' level='m' model='2' size=7}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'qrcode',
        attributes: {
          data: 'https://example.com',
          level: 'm',
          model: '2',
          size: 7,
        },
      },
    ]);
  });

  // Escaped Braces
  it('handles escaped braces inside tags', () => {
    const markup = '{text This is \\{escaped\\} text}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is {escaped} text',
      },
    ]);
  });

  // Escaped Quotes
  it('handles escaped quote inside attributes', () => {
    const markup = `{text "This is a string with an escaped quote: \"quote\" inside"}`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is a string with an escaped quote: "quote" inside',
      },
    ]);
  });

  // Unknown Command
  it('handles unknown commands gracefully', () => {
    const markup = '{unknownCommand someValue}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'unknown',
        key: 'unknownCommand',
        attributes: 'someValue',
      },
    ]);
  });

  // Comment Handling
  it('ignores comments in the template', () => {
    const markup = `{# this is a comment }`;
    const output = parse(markup);

    expect(output).to.deep.equal([]);
  });

  // Center Tag
  it('parses center tag without attributes', () => {
    const markup = `{center}`;
    const output = parse(markup);

    expect(output).to.deep.equal([{ name: 'center' }]);
  });

  // Image Tag with Complex Attributes
  it('parses image tag with multiple attributes including data URLs', () => {
    const markup = `{image
        src="data:image/svg+xml,%3Csvg ... %3C/svg%3E"
        width=360
        height=192
        dither=atkinson
      }`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'image',
        attributes: {
          src: 'data:image/svg+xml,%3Csvg ... %3C/svg%3E',
          width: 360,
          height: 192,
          dither: 'atkinson',
        },
      },
    ]);
  });

  // Line Tag
  it('parses line tag without param', () => {
    const markup = `{line}`;
    const output = parse(markup);
    expect(output).to.deep.equal([{ name: 'line', value: '' }]);
  });

  it('parses line tag with param', () => {
    const markup = `{line Some text}`;
    const output = parse(markup);
    expect(output).to.deep.equal([{ name: 'line', value: 'Some text' }]);
  });

  // Text Lines
  it('parses plain text lines correctly', () => {
    const markup = `LAYBY DOCKET`;
    const output = parse(markup);

    expect(output).to.deep.equal([{ name: 'line', value: 'LAYBY DOCKET' }]);
  });

  // Left Tag
  it('parses left tag without attributes', () => {
    const markup = `{left}`;
    const output = parse(markup);

    expect(output).to.deep.equal([{ name: 'left' }]);
  });

  // Table Tag with Rows
  it('parses table tag with multiple rows and attributes', () => {
    const markup = `{table
        cols=2
        margin=1
        width=[10,*]
        row=["Date/Time","08/09/23 12:34 PM"]
        row=["Sale ID","_6P20R3R05"]
        row=["Staff ID","John Smith"]
        row=["Customer","CHIN MORPH"]
        row=["Phone","_6P20Q4DJU"]
      }`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          width: [10, '*'],
          rows: [
            ['Date/Time', '08/09/23 12:34 PM'],
            ['Sale ID', '_6P20R3R05'],
            ['Staff ID', 'John Smith'],
            ['Customer', 'CHIN MORPH'],
            ['Phone', '_6P20Q4DJU'],
          ],
        },
      },
    ]);
  });

  // Rule Tag
  it('parses rule tag correctly', () => {
    const markup = `{rule}`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        attributes: {
          line: 'dashed',
          style: 'single',
        },
        name: 'rule',
      },
    ]);
  });

  // Bold Tag and EndBold
  it('parses bold tag and its closing endBold tag', () => {
    const markup = `{bold}LAYBY TERMS AND CONDITIONS\n{endBold}`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      { name: 'bold' },
      { name: 'line', value: 'LAYBY TERMS AND CONDITIONS' },
      { name: 'bold', off: true },
    ]);
  });

  // Nested Table with Multiple Rows
  it('parses nested table with bold and alignment attributes', () => {
    const markup = `{bold}
      {table
        cols=4
        margin=1
        align=[left,left,right,right]
        width=[*,4,8,8]
        row=["Item","Qty","Unit","Total"]
      }
      {endBold}`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      { name: 'bold' },
      {
        name: 'table',
        attributes: {
          cols: 4,
          margin: 1,
          align: ['left', 'left', 'right', 'right'],
          width: ['*', 4, 8, 8],
          rows: [['Item', 'Qty', 'Unit', 'Total']],
        },
      },
      { name: 'bold', off: true },
    ]);
  });

  // Parsing List Items in Text
  it('parses plain text with line breaks', () => {
    const markup = `i) Maximum 3 months lay-by period\nii) Payments must be made every 2 weeks\niii) Cancellation will incur a 10% fee`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      { name: 'line', value: 'i) Maximum 3 months lay-by period' },
      { name: 'line', value: 'ii) Payments must be made every 2 weeks' },
      { name: 'line', value: 'iii) Cancellation will incur a 10% fee' },
    ]);
  });

  it('parses tags with empty attributes correctly', () => {
    const markup = "{image src='' width=100}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'image',
        attributes: {
          src: '',
          width: 100,
          dither: 'threshold',
        },
      },
    ]);
  });

  it('handles multiple escaped characters within a value', () => {
    const markup = '{text This is \\{escaped\\}, and this is \\[escaped\\]}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'text',
        value: 'This is {escaped}, and this is [escaped]',
      },
    ]);
  });

  it('handles mixed case keywords correctly', () => {
    const markup = '{RuLe LiNe=DaShEd}';
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'rule',
        attributes: {
          line: 'dashed',
          style: 'single',
        },
      },
    ]);
  });

  it('handles whitespace around commas in splittable attributes', () => {
    const markup = "{table align='left , right'}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'table',
        attributes: {
          align: ['left', 'right'],
        },
      },
    ]);
  });

  it('handles unusual but valid attribute values', () => {
    const markup = "{rule width=0 line='solid' style='single'}";
    const output = parse(markup);

    expect(output).to.deep.equal([
      {
        name: 'rule',
        attributes: {
          width: 0,
          line: 'solid',
          style: 'single',
        },
      },
    ]);
  });

  it('handles adjacent tags on separate lines correctly', () => {
    const markup = `
{bold}
{italic}
Some text
{endItalic}
{endBold}
`;
    const output = parse(markup);

    expect(output).to.deep.equal([
      { name: 'bold' },
      { name: 'italic' },
      { name: 'line', value: 'Some text' },
      { name: 'italic', off: true },
      { name: 'bold', off: true },
    ]);
  });

  it('correctly parses the entire RPML markup', () => {
    const markup = `
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

    const output = parse(markup);

    const expectedOutput = [
      {
        name: 'document',
        attributes: {
          wordWrap: true,
          bottomMargin: 6,
          cut: 'partial',
        },
      },
      {
        name: 'center',
      },
      {
        name: 'image',
        attributes: {
          src: 'https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189',
          size: 80,
          dither: 'atkinson',
        },
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'line',
        value: 'LAYBY DOCKET',
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'bold',
      },
      {
        name: 'line',
        value: 'Mountain Outfitters',
      },
      {
        name: 'bold',
        off: true,
      },
      {
        name: 'line',
        value: 'Boulder Megastore',
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'line',
        value: 'ABN 123456789',
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'line',
        value: '123 Boulder Rd, Boulder, WA 6432',
      },
      {
        name: 'line',
        value: 'Ph: 08 9022 1234',
      },
      {
        name: 'left',
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          align: ['left', 'right'],
          rows: [['09/09/2023', '12:34:56PM']],
        },
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'bold',
      },
      {
        name: 'table',
        attributes: {
          cols: 3,
          margin: 1,
          align: ['left', 'right', 'right'],
          width: ['*', 4, 8],
          rows: [['Item', 'Qty', 'Total']],
        },
      },
      {
        name: 'bold',
        off: true,
      },
      {
        name: 'rule',
        attributes: {
          line: 'dashed',
          style: 'single',
        },
      },
      {
        name: 'table',
        attributes: {
          cols: 3,
          margin: 1,
          align: ['left', 'right', 'right'],
          width: ['*', 4, 8],
          rows: [
            ['Plain T-Shirt', '1', '$10.99'],
            ['123456 @$10.99 ea.', '', ''],
            ['Black Jeans', '1', '$29.99'],
            ['654321 @$29.99 ea.', '', ''],
            ['Baseball Cap', '12', '$9.99'],
            ['987654 @$9.99 ea.', '', ''],
            ['Shoes', '2', '$99.98'],
            ['456789 @$49.99 ea.', '', ''],
            ['Socks', '1', '$1.99'],
            ['987654 @$1.99 ea.', '', ''],
          ],
        },
      },
      {
        name: 'center',
      },
      {
        name: 'rule',
        attributes: {
          line: 'dashed',
          style: 'single',
        },
      },
      {
        name: 'left',
      },
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          align: ['left', 'right'],
          width: ['*', 8],
          rows: [
            ['Subtotal', '$102.95'],
            ['Tax', '$10.30'],
          ],
        },
      },
      {
        name: 'bold',
      },
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          align: ['left', 'right'],
          width: ['*', 8],
          rows: [['Total', '$113.25']],
        },
      },
      {
        name: 'bold',
        off: true,
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          align: ['left', 'right'],
          width: ['*', 8],
          rows: [
            ['Cash', '$120.00'],
            ['Change', '-$6.75'],
          ],
        },
      },
      {
        name: 'bold',
      },
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          align: ['left', 'right'],
          width: ['*', 8],
          rows: [['Balance', '$0.00']],
        },
      },
      {
        name: 'bold',
        off: true,
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'table',
        attributes: {
          cols: 2,
          margin: 1,
          align: ['left', 'right'],
          width: [10, '*'],
          rows: [
            ['Reference', 'SC1234567890'],
            ['Staff', 'JD'],
            ['Customer', 'Jane Smith'],
            ['Email', 'js@example.com'],
            ['Phone', '0400 123 456'],
          ],
        },
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'center',
      },
      {
        name: 'qrcode',
        attributes: {
          data: 'https://example.com/orders/1234567890',
          size: 6,
          model: '1',
          level: 'l',
        },
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'rule',
        attributes: {
          line: 'dashed',
          style: 'single',
        },
      },
      {
        name: 'line',
        value: '',
      },
      {
        name: 'bold',
      },
      {
        name: 'left',
      },
      {
        name: 'line',
        value: 'Layby Terms & Conditions',
      },
      {
        name: 'bold',
        off: true,
      },
      {
        name: 'line',
        value: '1) Maximum layby period 3 months',
      },
      {
        name: 'line',
        value: '2) Payments due every 2 weeks',
      },
      {
        name: 'line',
        value: '3) Cancellations incur 10% fee',
      },
    ];

    expect(output).to.deep.equal(expectedOutput);
  });
});
