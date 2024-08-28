import { expect } from 'chai';
import { printPreview } from '../src/index.js';

describe('Print Preview', () => {
  it('should correctly parse the entire TPML tpml', () => {
    const tpml = `
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

    const output = printPreview(tpml);
    const expectedOutput = "";

    expect(output).to.equal(expectedOutput);
  });
});
