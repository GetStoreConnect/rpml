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

  .height1 { transform: scaleY(1); line-height: 100%; display: inline-block;}
  .height2 { transform: scaleY(2); line-height: 200%; display: inline-block;}
  .height3 { transform: scaleY(3); line-height: 300%; display: inline-block;}
  .height4 { transform: scaleY(4); line-height: 400%; display: inline-block;}
  .height5 { transform: scaleY(5); line-height: 500%; display: inline-block;}
  .height6 { transform: scaleY(6); line-height: 600%; display: inline-block;}

  .width1 { transform: scaleX(1); display: inline-block;}
  .width2 { transform: scaleX(2); display: inline-block;}
  .width3 { transform: scaleX(3); display: inline-block;}
  .width4 { transform: scaleX(4); display: inline-block;}
  .width5 { transform: scaleX(5); display: inline-block;}
  .width6 { transform: scaleX(6); display: inline-block;}

  .height1.width1 { transform: scale(1, 1); line-height: 100%; display: inline-block; }
  .height1.width2 { transform: scale(2, 1); line-height: 100%; display: inline-block; }
  .height1.width3 { transform: scale(3, 1); line-height: 100%; display: inline-block; }
  .height1.width4 { transform: scale(4, 1); line-height: 100%; display: inline-block; }
  .height1.width5 { transform: scale(5, 1); line-height: 100%; display: inline-block; }
  .height1.width6 { transform: scale(6, 1); line-height: 100%; display: inline-block; }

  .height2.width1 { transform: scale(1, 2); line-height: 200%; display: inline-block; }
  .height2.width2 { transform: scale(2, 2); line-height: 200%; display: inline-block; }
  .height2.width3 { transform: scale(3, 2); line-height: 200%; display: inline-block; }
  .height2.width4 { transform: scale(4, 2); line-height: 200%; display: inline-block; }
  .height2.width5 { transform: scale(5, 2); line-height: 200%; display: inline-block; }
  .height2.width6 { transform: scale(6, 2); line-height: 200%; display: inline-block; }

  .height3.width1 { transform: scale(1, 3); line-height: 300%; display: inline-block; }
  .height3.width2 { transform: scale(2, 3); line-height: 300%; display: inline-block; }
  .height3.width3 { transform: scale(3, 3); line-height: 300%; display: inline-block; }
  .height3.width4 { transform: scale(4, 3); line-height: 300%; display: inline-block; }
  .height3.width5 { transform: scale(5, 3); line-height: 300%; display: inline-block; }
  .height3.width6 { transform: scale(6, 3); line-height: 300%; display: inline-block; }

  .height4.width1 { transform: scale(1, 4); line-height: 400%; display: inline-block; }
  .height4.width2 { transform: scale(2, 4); line-height: 400%; display: inline-block; }
  .height4.width3 { transform: scale(3, 4); line-height: 400%; display: inline-block; }
  .height4.width4 { transform: scale(4, 4); line-height: 400%; display: inline-block; }
  .height4.width5 { transform: scale(5, 4); line-height: 400%; display: inline-block; }
  .height4.width6 { transform: scale(6, 4); line-height: 400%; display: inline-block; }

  .height5.width1 { transform: scale(1, 5); line-height: 500%; display: inline-block; }
  .height5.width2 { transform: scale(2, 5); line-height: 500%; display: inline-block; }
  .height5.width3 { transform: scale(3, 5); line-height: 500%; display: inline-block; }
  .height5.width4 { transform: scale(4, 5); line-height: 500%; display: inline-block; }
  .height5.width5 { transform: scale(5, 5); line-height: 500%; display: inline-block; }
  .height5.width6 { transform: scale(6, 5); line-height: 500%; display: inline-block; }

  .height6.width1 { transform: scale(1, 6); line-height: 600%; display: inline-block; }
  .height6.width2 { transform: scale(2, 6); line-height: 600%; display: inline-block; }
  .height6.width3 { transform: scale(3, 6); line-height: 600%; display: inline-block; }
  .height6.width4 { transform: scale(4, 6); line-height: 600%; display: inline-block; }
  .height6.width5 { transform: scale(5, 6); line-height: 600%; display: inline-block; }
  .height6.width6 { transform: scale(6, 6); line-height: 600%; display: inline-block; }


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
<div class="center"><span class=""></span></div>
<div class="center"><span class="">LAYBY DOCKET</span></div>
<div class="center"><span class=""></span></div>
<div class="center"><span class="bold">Mountain Outfitters</span></div>
<div class="center"><span class="">Boulder Megastore</span></div>
<div class="center"><span class=""></span></div>
<div class="center"><span class="">ABN 123456789</span></div>
<div class="center"><span class=""></span></div>
<div class="center"><span class="">123 Boulder Rd, Boulder, WA 6432</span></div>
<div class="center"><span class="">Ph: 08 9022 1234</span></div>
<div class="left"><span class=""></span></div>
<table><tr><td data-cols="15" class="" style="text-align: left; width: 126.4306640625px; max-width: 126.4306640625px; min-width: 126.4306640625px;">09/09/2023</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="15" class="" style="text-align: right; width: 126.4306640625px; max-width: 126.4306640625px; min-width: 126.4306640625px;">12:34:56PM</td></tr></table>
<div class="left"><span class=""></span></div>
<table><tr><td data-cols="18" class="bold" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Item</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="bold" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">Qty</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="bold" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">Total</td></tr></table>
<div class="left rule rule-dashed"><span class="">--------------------------------</span></div>
<table><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Plain T-Shirt</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$10.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">123456 @$10.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Black Jeans</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$29.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">654321 @$29.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Baseball Cap</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">12</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$9.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">987654 @$9.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Shoes</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">2</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$99.98</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">456789 @$49.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">Socks</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;">1</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$1.99</td></tr><tr><td data-cols="18" class="" style="text-align: left; width: 151.716796875px; max-width: 151.716796875px; min-width: 151.716796875px;">987654 @$1.99 ea.</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="4" class="" style="text-align: right; width: 33.71484375px; max-width: 33.71484375px; min-width: 33.71484375px;"></td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;"></td></tr></table>
<div class="center rule rule-dashed"><span class="">--------------------------------</span></div>
<table><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Subtotal</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$102.95</td></tr><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Tax</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$10.30</td></tr></table>
<table><tr><td data-cols="23" class="bold" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Total</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="bold" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$113.25</td></tr></table>
<div class="left"><span class=""></span></div>
<table><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Cash</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$120.00</td></tr><tr><td data-cols="23" class="" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Change</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">-$6.75</td></tr></table>
<table><tr><td data-cols="23" class="bold" style="text-align: left; width: 193.8603515625px; max-width: 193.8603515625px; min-width: 193.8603515625px;">Balance</td><td data-cols="1" class="bold" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="8" class="bold" style="text-align: right; width: 67.4296875px; max-width: 67.4296875px; min-width: 67.4296875px;">$0.00</td></tr></table>
<div class="left"><span class=""></span></div>
<table><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Reference</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">SC1234567890</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Staff</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">JD</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Customer</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">Jane Smith</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Email</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">js@example.com</td></tr><tr><td data-cols="10" class="" style="text-align: left; width: 84.287109375px; max-width: 84.287109375px; min-width: 84.287109375px;">Phone</td><td data-cols="1" class="" style="width: 8.4287109375px; max-width: 8.4287109375px; min-width: 8.4287109375px;">&nbsp;</td><td data-cols="21" class="" style="text-align: right; width: 177.0029296875px; max-width: 177.0029296875px; min-width: 177.0029296875px;">0400 123 456</td></tr></table>
<div class="left"><span class=""></span></div>
<div class="center qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=126x126&data=https://example.com/orders/1234567890"></div>
<div class="center"><span class=""></span></div>
<div class="center rule rule-dashed"><span class="">--------------------------------</span></div>
<div class="center"><span class=""></span></div>
<div class="left"><span class="bold">Layby Terms & Conditions</span></div>
<div class="left"><span class="">1) Maximum layby period 3 months</span></div>
<div class="left"><span class="">2) Payments due every 2 weeks</span></div>
<div class="left"><span class="">3) Cancellations incur 10% fee</span></div>
</article></body></html>`;

    expect(output).to.equal(expectedOutput);
  });
});
