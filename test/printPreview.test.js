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
    const expectedOutput = `<html><head><style>
  body {
    font-family: monospace;
    font-size: 14px;
    line-height: 1.3em;
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
</style></head><body><article style="width: 269.71875px; margin: 0 auto;word-wrap: break-word;">
<div class="center img"><img src="https://cdn.glitch.com/4c9ebeb9-8b9a-4adc-ad0a-238d9ae00bb5%2Fmdn_logo-only_color.svg?1535749917189" width="80%"></div>
<div class="size-1 center"><span class=""></span></div>
<div class="size-1 center"><span class="">LAYBY DOCKET</span></div>
<div class="size-1 center"><span class=""></span></div>
<div class="size-1 center"><span class="bold">Mountain Outfitters</span></div>
<div class="size-1 center"><span class="">Boulder Megastore</span></div>
<div class="size-1 center"><span class=""></span></div>
<div class="size-1 center"><span class="">ABN 123456789</span></div>
<div class="size-1 center"><span class=""></span></div>
<div class="size-1 center"><span class="">123 Boulder Rd, Boulder, WA 6432</span></div>
<div class="size-1 center"><span class="">Ph: 08 9022 1234</span></div>
<div class="size-1 left"><span class=""></span></div>
<table><tr><td data-cols="15" class="" style="text-align: left; width: 126.4306640625px; max-width: 126.4306640625px; min-width: 126.4306640625px;">09/09/2023</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="15" class="" style="text-align: right; width: 126.4306640625px; max-width: 126.4306640625px; min-width: 126.4306640625px;">12:34:56PM</td></tr></table>
<div class="size-1 left"><span class=""></span></div>
<table><tr><td data-cols="18" class="bold" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Item</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="bold" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">Qty</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="bold" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">Total</td></tr></table>
<div class="left rule rule-dashed"><span class="">--------------------------------</span></div>
<table><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Plain T-Shirt</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$10.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">123456 @$10.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Black Jeans</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$29.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">654321 @$29.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Baseball Cap</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">12</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$9.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">987654 @$9.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Shoes</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">2</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$99.98</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">456789 @$49.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Socks</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$1.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">987654 @$1.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr></table>
<div class="center rule rule-dashed"><span class="">--------------------------------</span></div>
<table><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Subtotal</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$102.95</td></tr><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Tax</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$10.30</td></tr></table>
<table><tr><td data-cols="23" class="bold" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Total</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="bold" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$113.25</td></tr></table>
<div class="size-1 left"><span class=""></span></div>
<table><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Cash</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$120.00</td></tr><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Change</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">-$6.75</td></tr></table>
<table><tr><td data-cols="23" class="bold" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Balance</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="bold" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$0.00</td></tr></table>
<div class="size-1 left"><span class=""></span></div>
<table><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Reference</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">SC1234567890</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Staff</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">JD</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Customer</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">Jane Smith</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Email</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">js@example.com</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Phone</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">0400 123 456</td></tr></table>
<div class="size-1 left"><span class=""></span></div>
<div class="center qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=126x126&data=https://example.com/orders/1234567890"></div>
<div class="size-1 center"><span class=""></span></div>
<div class="center rule rule-dashed"><span class="">--------------------------------</span></div>
<div class="size-1 center"><span class=""></span></div>
<div class="size-1 left"><span class="bold">Layby Terms & Conditions</span></div>
<div class="size-1 left"><span class="">1) Maximum layby period 3 months</span></div>
<div class="size-1 left"><span class="">2) Payments due every 2 weeks</span></div>
<div class="size-1 left"><span class="">3) Cancellations incur 10% fee</span></div>
</article></body></html>`;

    expect(output).to.equal(expectedOutput);
  });
});
