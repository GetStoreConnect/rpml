(()=>{var x={document:{attributes:{wordWrap:{type:"boolean",default:!1}}},center:{},image:{attributes:{dither:{type:"keyword",options:["threshold","bayer","floydsteinberg","atkinson"],default:"threshold"},height:{type:"number"},size:{type:"number"},src:{type:"string"},width:{type:"number"}}},left:{},right:{},line:{},rule:{attributes:{width:{type:"number"},line:{type:"keyword",options:["solid","dashed"],default:"dashed"},style:{type:"keyword",options:["single","double"],default:"single"}}},table:{attributes:{align:{type:"keyword",options:["left","right"],split:!0},cols:{type:"number"},row:{type:"string",split:!0,multiple:!0,key:"rows"},margin:{type:"number"},width:{type:"number",split:!0}}},text:{param:{type:"string"}},bold:{toggle:!0},italic:{toggle:!0},underline:{toggle:!0},invert:{toggle:!0},small:{toggle:!0},size:{param:{type:"number",options:[1,2,3,4,5,6],default:1}},barcode:{attributes:{type:{type:"keyword",options:["upca","ean13","ean8","code39","code128"]},data:{type:"string"},height:{type:"number",default:50},position:{type:"keyword",options:["none","above","below","both"],default:"none"}}},qrcode:{attributes:{data:{type:"string"},level:{type:"keyword",options:["l","m","q","h"],default:"l"},model:{type:"keyword",options:["1","2"],default:"1"},size:{type:"number",options:[1,2,3,4,5,6,7,8],default:6}}}},b=x;function h(e){let t=[],r=/(?:\s*(?<!\\)(?:\\\\)*{\s*(?<key>\w+)[\s\n]*(?<attrs>(?:[^}]|\\})*)(?<!\\)(?:\\\\)*})|(?<comment>\s*{#[^}]+\s*})|(?<line>[^\n]+)/gim,s=[...e.matchAll(r)];for(let n of s){if(n.groups.comment)continue;let i=k(n,b);i&&t.push(i)}return t}function k(e,t){let r;if(e.groups.key){let s=f(e.groups.key);if(t[s])t[s].attributes?r=$(s,e,t):t[s].param?r=C(s,e,t):r={name:s};else{let n=s.substring(3);s.startsWith("end")&&t[n]&&t[n].toggle?r=v(n):r=W(e)}}else e.groups.line&&(r=z(e));return r}function $(e,t,r){let s={name:e},n=q(t.groups.attrs,r[e]);return n&&(s.attributes=n),s}function C(e,t,r){return{name:e,value:m(t.groups.attrs,r[e].param)||r[e].param.default}}function v(e){return{name:e,off:!0}}function z(e){return{name:"line",value:e.groups.line}}function W(e){return{name:"unknown",key:e.groups.key,attributes:e.groups.attrs}}function q(e,t){let r={},s=/\s*(?<key>[^=\s]+)\s*=\s*(?:(?<number>[\d]+)|(?<keyword>[\w\-]+)|(["'])(?<string>.*?(?<!\\))\4|\[(?<array>.*(?<!\\))\])/gi,n=[...e.matchAll(s)];for(let i of n){let l=f(i.groups.key);if(!t.attributes[l])continue;let a=i.groups.number||i.groups.keyword||i.groups.string||i.groups.array,o=m(a,t.attributes[l]);o!==null&&(t.attributes[l].multiple?(l=t.attributes[l].key||l,r[l]||(r[l]=[]),r[l].push(o)):r[l]=o)}for(let i in t.attributes)t.attributes[i].default!==void 0&&r[i]===void 0&&(r[i]=t.attributes[i].default);return r}function m(e,t){return e?(e=e.replace(/\\(.)/g,(r,s)=>s),t.split?e.match(/(['"].*?['"]|[^"',\s]+)(?=\s*,|\s*$)/g).map(r=>g(r,t.type,t.options)):g(e,t.type,t.options)):""}function g(e,t,r){switch(f(t)){case"number":return e==="*"?e:r?r.includes(Number(e))?Number(e):null:Number(e);case"boolean":return e==="true";case"keyword":return r?r.includes(e.toLowerCase())?e.toLowerCase():null:e;case"string":return e.trim().replace(/^"|"$/g,"").replace(/^'|'$/g,"")}}function f(e){return e.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g,(t,r)=>r.toUpperCase())}function w({commands:e,createCanvas:t,chars:r=32,fontFamily:s="monospace",fontSize:n="14px",lineHeight:i="1.3em",wordWrap:l=!1}){let a={alignment:"left",size:1,bold:!1,italic:!1,underline:!1,invert:!1,small:!1},o=A({createCanvas:t,chars:r,fontFamily:s,fontSize:n}),d={html:"",previousContentCommand:null,styles:a,chars:r,docWidth:o,wordWrap:l};for(let u of e)I({command:u,state:d});return R({state:d,fontFamily:s,fontSize:n,lineHeight:i})}function A({createCanvas:e,chars:t,fontFamily:r,fontSize:s}){let i=e(200,50).getContext("2d");return i.font=`${s} ${r}`,i.measureText("W".repeat(t)).width}function I({command:e,state:t}){switch(e.name){case"document":t.wordWrap=e.attributes.wordWrap;break;case"left":t.styles.alignment=e.name;break;case"right":t.styles.alignment=e.name;break;case"center":t.styles.alignment=e.name;break;case"size":t.styles.size=e.value;break;case"bold":t.styles.bold=e.off!==!0;break;case"italic":t.styles.italic=e.off!==!0;break;case"underline":t.styles.underline=e.off!==!0;break;case"invert":t.styles.invert=e.off!==!0;break;case"small":t.styles.small=e.off!==!0;break;case"line":case"text":y({command:e,state:t});break;default:t.styles.size=1,y({command:e,state:t});break}}function y({command:e,state:t}){t.html+=S({command:e,state:t})+`
`,t.previousContentCommand=e}function S({command:e,state:t}){let r=t.styles;switch(e.name){case"image":return T({command:e,styles:r});case"line":return L({command:e,state:t});case"text":return N({command:e,styles:r});case"rule":return B({command:e,state:t});case"table":return E({command:e,state:t});case"barcode":return j({command:e,styles:r});case"qrcode":return D({command:e,styles:r});default:throw new Error(`Unknown command: ${e.name}`)}}function T({command:e,styles:t}){let r=e.attributes.size?`width="${e.attributes.size}%"`:"";return`<div class="${p({command:e,styles:t})} rpml-img-wrapper"><img class="rpml-img" src="${e.attributes.src}" ${r}></div>`}function L({command:e,state:t}){if(t.previousContentCommand?.name=="text")return"<br>";let r=p({command:e,styles:t.styles}),s=c({styles:t.styles}),n=e.value||"";return`<div class="${r}"><span class="${s}">${n}</span></div>`}function N({command:e,styles:t}){let r=c({styles:t}),s=e.value||"";return`<span class="${r}">${s}</span>`}function B({command:e,state:t}){let r=t.chars,s=p({command:e,styles:t.styles});if(e.attributes.line=="dashed"){let n=e.attributes.styles=="double"?"=":"-",i=c({styles:t.styles});return`<div class="${s} rpml-rule rpml-rule-dashed"><span class="${i}">${n.repeat(e.attributes.width||r)}</span></div>`}else{let n="100%";e.attributes.width&&(n=`${e.attributes.width/r*100}%`);let i=` ${e.attributes.style=="double"?"border-bottom: 1px solid black; height: 3px;":""}`;return`<div class="${s} rpml-rule" style="position:relative;"><div class="rpml-rule-solid" style="width: ${n};${i}"></div></div>`}}function E({command:e,state:t}){let r='<table class="rpml-table">',s=c({styles:t.styles}),n=parseInt(e.attributes.margin||0);for(let i of e.attributes.rows){r+='<tr class="rpml-tr">';for(let[l,a]of i.entries())r+=H({content:a,index:l,contentClasses:s,margin:n,command:e,state:t}),l<i.length-1&&(r+=P({contentClasses:s,margin:n,state:t}));r+="</tr>"}return r+="</table>",r}function H({content:e,index:t,contentClasses:r,margin:s,command:n,state:i}){let l;n.attributes.width?(l=n.attributes.width[t],l=="*"?(l=i.chars,n.attributes.width.filter(u=>u!="*").forEach(u=>l-=parseInt(u)+s)):l=parseInt(l)):l=parseInt(i.chars/n.attributes.cols)-s;let a=n.attributes.align?n.attributes.align[t]:"left",o=i.docWidth/i.chars*l,d=`width: ${o}px; max-width: ${o}px; min-width: ${o}px;`;return`<td data-cols="${l}" class="${r} rpml-td" style="text-align: ${a}; ${d}">${e}</td>`}function P({contentClasses:e,margin:t,state:r}){let s=r.docWidth/r.chars*t,n=`width: ${s}px; max-width: ${s}px; min-width: ${s}px;`;return`<td data-cols="${t}" class="${e} rpml-td" style="${n}">&nbsp;</td>`}function j({command:e,styles:t}){return`<div class="${p({command:e,styles:t})} rpml-barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${e.attributes.data}&code=${e.attributes.type}" width="100%"></div>`}function D({command:e,styles:t}){let r=parseInt(21*e.attributes.size);return`<div class="${p({command:e,styles:t})} rpml-qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=${r}x${r}&data=${e.attributes.data}"></div>`}function c({styles:e}){let t=[];return e.small&&t.push("rpml-small"),e.bold&&t.push("rpml-bold"),e.italic&&t.push("rpml-italic"),e.underline&&t.push("rpml-underline"),e.invert&&t.push("rpml-invert"),t.join(" ")}function p({command:e,styles:t}){let r=["rpml-block",`rpml-${t.alignment}`];return t.size&&(e.name=="line"||e.name=="text")&&r.push(`rpml-size-${t.size}`),r.join(" ")}function R({state:e,fontFamily:t,fontSize:r,lineHeight:s}){let n=`width: ${e.docWidth}px; margin: 0 auto;`,i=e.wordWrap?"word-wrap: break-word;":"",l=`font-family: ${t}; font-size: ${r}; line-height: ${s};`;return`
    <html>
      <head>
        <style>${U()}</style>
      </head>
      <body>
        <div class="rpml-receipt" style="${n}${i}${l}">
          ${e.html}
        </div>
      </body>
    </html>
  `}function U(){return`
    body {
      background-color: transparent;
      margin: 0;
      padding: 0;
    }

    .rpml-receipt {
      padding: 1em;
      background-color: white;
      color: black;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-all;
    }

    .rpml-block {
      min-height: 1.3em;
      text-align: left;
    }

    .rpml-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
    }

    .rpml-tr {
      border: none;
      margin: 0;
      padding: 0;
    }

    .rpml-td {
      border: none;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      vertical-align: top;
    }

    .rpml-img {
      filter: grayscale(100%);
    }

    .rpml-small {
      font-size: 80%;
    }

    .rpml-size-1 {
      line-height: 100%;
      font-size: 100%;
    }

    .rpml-size-2 {
      line-height: 100%;
      font-size: 200%;
    }

    .rpml-size-3 {
      line-height: 100%;
      font-size: 300%;
    }

    .rpml-size-4 {
      line-height: 100%;
      font-size: 400%;
    }

    .rpml-size-5 {
      line-height: 100%;
      font-size: 500%;
    }

    .rpml-size-6 {
      line-height: 100%;
      font-size: 600%;
    }

    .rpml-bold {
      font-weight: bold;
    }

    .rpml-italic {
      font-style: italic;
    }

    .rpml-underline {
      text-decoration: underline;
    }

    .rpml-invert {
      background-color: black;
      color: white;
    }

    .rpml-center {
      text-align: center;
    }

    .rpml-left {
      text-align: left;
    }

    .rpml-right {
      text-align: right;
    }

    .rpml-img-wrapper {
      width: 100%;
    }

    .rpml-rule {
      position:relative;
    }

    .rpml-rule .rpml-rule-solid {
      border: none;
      margin: 0;
      padding: 0;
      border-top: 1px solid black;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }

    .rpml-barcode, .rpml-qrcode {
      width: 100%;
    }
  `}function G(e,t={}){let r=h(e);return w({commands:r,createCanvas:(n,i)=>{let l=document.createElement("canvas");return l.width=n,l.height=i,l},...t})}})();
