(()=>{var H=Object.create;var z=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,D=Object.prototype.hasOwnProperty;var C=(a,t)=>()=>(t||a((t={exports:{}}).exports,t),t.exports);var L=(a,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of S(t))!D.call(a,i)&&i!==e&&z(a,i,{get:()=>t[i],enumerable:!(s=R(t,i))||s.enumerable});return a};var N=(a,t,e)=>(e=a!=null?H(j(a)):{},L(t||!a||!a.__esModule?z(e,"default",{value:a,enumerable:!0}):e,a));var I=C((tt,q)=>{"use strict";var O="bold|bolder|lighter|[1-9]00",P="italic|oblique",T="small-caps",U="ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded",X="px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q",W=`'([^']+)'|"([^"]+)"|[\\w\\s-]+`,Y=new RegExp(`(${O}) +`,"i"),Z=new RegExp(`(${P}) +`,"i"),G=new RegExp(`(${T}) +`,"i"),J=new RegExp(`(${U}) +`,"i"),K=new RegExp(`([\\d\\.]+)(${X}) *((?:${W})( *, *(?:${W}))*)`),f={},Q=16;q.exports=a=>{if(f[a])return f[a];let t=K.exec(a);if(!t)return;let e={weight:"normal",style:"normal",stretch:"normal",variant:"normal",size:parseFloat(t[1]),unit:t[2],family:t[3].replace(/["']/g,"").replace(/ *, */g,",")},s,i,r,l,n=a.substring(0,t.index);switch((s=Y.exec(n))&&(e.weight=s[1]),(i=Z.exec(n))&&(e.style=i[1]),(r=G.exec(n))&&(e.variant=r[1]),(l=J.exec(n))&&(e.stretch=l[1]),e.unit){case"pt":e.size/=.75;break;case"pc":e.size*=16;break;case"in":e.size*=96;break;case"cm":e.size*=96/2.54;break;case"mm":e.size*=96/25.4;break;case"%":break;case"em":case"rem":e.size*=Q/.75;break;case"q":e.size*=96/25.4/4;break}return f[a]=e}});var E=C(u=>{var _=I();u.parseFont=_;u.createCanvas=function(a,t){return Object.assign(document.createElement("canvas"),{width:a,height:t})};u.createImageData=function(a,t,e){switch(arguments.length){case 0:return new ImageData;case 1:return new ImageData(a);case 2:return new ImageData(a,t);default:return new ImageData(a,t,e)}};u.loadImage=function(a,t){return new Promise(function(e,s){let i=Object.assign(document.createElement("img"),t);function r(){i.onload=null,i.onerror=null}i.onload=function(){r(),e(i)},i.onerror=function(){r(),s(new Error('Failed to load the image "'+a+'"'))},i.src=a})}});var V={document:{attributes:{wordWrap:{type:"boolean",default:!1}}},center:{},image:{attributes:{dither:{type:"keyword",options:["threshold","bayer","floydsteinberg","atkinson"],default:"threshold"},height:{type:"number"},size:{type:"number"},src:{type:"string"},width:{type:"number"}}},left:{},right:{},line:{},rule:{attributes:{width:{type:"number"},line:{type:"keyword",options:["solid","dashed"],default:"dashed"},style:{type:"keyword",options:["single","double"],default:"single"}}},table:{attributes:{align:{type:"keyword",options:["left","right"],split:!0},cols:{type:"number"},row:{type:"string",split:!0,multiple:!0,key:"rows"},margin:{type:"number"},width:{type:"number",split:!0}}},text:{param:{type:"string"}},bold:{toggle:!0},italic:{toggle:!0},underline:{toggle:!0},invert:{toggle:!0},small:{toggle:!0},size:{param:{type:"number",options:[1,2,3,4,5,6],default:1}},barcode:{attributes:{type:{type:"keyword",options:["upca","ean13","ean8","code39","code128"]},data:{type:"string"},height:{type:"number",default:50},position:{type:"keyword",options:["none","above","below","both"],default:"none"}}},qrcode:{attributes:{data:{type:"string"},level:{type:"keyword",options:["l","m","q","h"],default:"l"},model:{type:"keyword",options:["1","2"],default:"1"},size:{type:"number",options:[1,2,3,4,5,6,7,8],default:6}}}},v=V;var F=N(E(),1),p=class{constructor(t,e){this.markup=t,this.commands,this.html,this.elemWidth,this.chars=e||32}toCommands(){return this.commands||=new g(this.markup).parse()}toHtml(){return this.html||=new y(this.toCommands(),this.chars).build()}},g=class{constructor(t){this.markup=t}parse(){let t=[],e=/(?:\s*(?<!\\)(?:\\\\)*{\s*(?<key>\w+)[\s\n]*(?<attrs>(?:[^}]|\\})*)(?<!\\)(?:\\\\)*})|(?<comment>\s*{#[^}]+\s*})|(?<line>[^\n]+)/gmi,s=[...this.markup.matchAll(e)];for(let i of s){if(i.groups.comment)continue;let r=this.parseCommand(i,v);r&&t.push(r)}return t}parseCommand(t,e){let s;if(t.groups.key){let i=this.camelize(t.groups.key);if(e[i])e[i].attributes?s=this.commandWithAttributes(i,t,e):e[i].param?s=this.commandWithParam(i,t,e):s={name:i};else{let r=i.substring(3);i.startsWith("end")&&e[r]&&e[r].toggle?s=this.endCommand(r):s=this.unknownCommand(t)}}else t.groups.line&&(s=this.lineCommand(t));return s}commandWithAttributes(t,e,s){let i={name:t},r=this.parseAttributes(e.groups.attrs,s[t]);return r&&(i.attributes=r),i}commandWithParam(t,e,s){return{name:t,value:this.castValue(e.groups.attrs,s[t].param)||s[t].param.default}}endCommand(t){return{name:t,off:!0}}lineCommand(t){return{name:"line",value:t.groups.line}}unknownCommand(t){return{name:"unknown",key:t.groups.key,attributes:t.groups.attrs}}parseAttributes(t,e){let s={},i=/\s*(?<key>[^=\s]+)\s*=\s*(?:(?<number>[\d]+)|(?<keyword>[\w\-]+)|(["'])(?<string>.*?(?<!\\))\4|\[(?<array>.*(?<!\\))\])/gi,r=[...t.matchAll(i)];for(let l of r){let n=this.camelize(l.groups.key);if(!e.attributes[n])continue;let o=l.groups.number||l.groups.keyword||l.groups.string||l.groups.array,d=this.castValue(o,e.attributes[n]);d!==null&&(e.attributes[n].multiple?(n=e.attributes[n].key||n,s[n]||(s[n]=[]),s[n].push(d)):s[n]=d)}for(let l in e.attributes)e.attributes[l].default!==void 0&&s[l]===void 0&&(s[l]=e.attributes[l].default);return s}castValue(t,e){return t?(t=t.replace(/\\(.)/g,(s,i)=>i),e.split?t.match(/(['"].*?['"]|[^"',\s]+)(?=\s*,|\s*$)/g).map(s=>this.cast(s,e.type,e.options)):this.cast(t,e.type,e.options)):""}cast(t,e,s){switch(this.camelize(e)){case"number":return t==="*"?t:s?s.includes(Number(t))?Number(t):null:Number(t);case"boolean":return t==="true";case"keyword":return s?s.includes(t.toLowerCase())?t.toLowerCase():null:t;case"string":return t.trim().replace(/^"|"$/g,"").replace(/^'|'$/g,"")}}camelize(t){return t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g,(e,s)=>s.toUpperCase())}},y=class{constructor(t,e){this.commands=t,this.lines=[],this.styles=this.defaultStyles,this.fontFamily="monospace",this.fontSize="14px",this.lineHeight="1.3em",this.chars=e,this.docWidth,this.wordWrap=!1}defaultStyles(){return{alignment:"left",size:1,bold:!1,italic:!1,underline:!1,invert:!1,small:!1}}bodyCss(){return`<style>
  body {
    font-family: ${this.fontFamily};
    font-size: ${this.fontSize};
    line-height: ${this.lineHeight};
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
</style>`}build(){for(let t of this.commands){if(t.name==="document"){this.docWidth=this.calculateWidth(this.chars,this.fontFamily,this.fontSize),this.wordWrap=t.attributes.wordWrap;continue}this.applyCommand(t)}return this.wrapDocument(this.lines.map(t=>t.toHtml()).join(`
`))}wrapDocument(t){let e=`width: ${this.docWidth}px; margin: 0 auto;`,s=this.wordWrap?"word-wrap: break-word;":"";return`<html><head>${this.bodyCss()}</head><body><article style="${e}${s}">
${t}
</article></body></html>`}applyCommand(t){switch(t.name){case"left":this.styles.alignment=t.name;break;case"right":this.styles.alignment=t.name;break;case"center":this.styles.alignment=t.name;break;case"size":this.styles.size=t.value;break;case"bold":this.styles.bold=t.off!==!0;break;case"italic":this.styles.italic=t.off!==!0;break;case"underline":this.styles.underline=t.off!==!0;break;case"invert":this.styles.invert=t.off!==!0;break;case"small":this.styles.small=t.off!==!0;break;case"line":case"text":this.addLine(t,{...this.styles});break;default:this.styles.size=1,this.addLine(t,{...this.styles});break}}addLine(t,e){this.lines.push(new w(t,e,this,this.lines[this.lines.length-1]))}calculateWidth(t,e,s){let r=(0,F.createCanvas)(200,50).getContext("2d");return r.font=`${s} ${e}`,r.measureText("W".repeat(t)).width}},w=class{constructor(t,e,s,i){this.command=t,this.styles=e,this.builder=s,this.precedingLine=i,this.blockClasses=[],this.contentClasses=[],this.styles.small&&this.contentClasses.push("small"),this.styles.bold&&this.contentClasses.push("bold"),this.styles.italic&&this.contentClasses.push("italic"),this.styles.underline&&this.contentClasses.push("underline"),this.styles.invert&&this.contentClasses.push("invert"),this.styles.size&&(this.command.name=="line"||this.command.name=="text")&&this.blockClasses.push("size-"+this.styles.size),this.blockClasses.push(this.styles.alignment)}toHtml(){let t="",e=this.command.value||"",s=this.blockClasses.join(" "),i=this.contentClasses.join(" ");switch(this.command.name){case"image":let r="";this.command.attributes.size&&(r=`width="${this.command.attributes.size}%"`),t+=`<div class="${s} img"><img src="${this.command.attributes.src}" ${r}></div>`;break;case"line":this.precedingLine&&this.precedingLine.command.name=="text"?t+="<br>":t+=`<div class="${s}"><span class="${i}">${e}</span></div>`;break;case"text":t+=`<span class="${i}">${e}</span>`;break;case"rule":let l=this.builder.chars;if(this.command.attributes.line=="dashed"){let o=this.command.attributes.style=="double"?"=":"-";t+=`<div class="${s} rule rule-dashed"><span class="${i}">${o.repeat(this.command.attributes.width||l)}</span></div>`}else{let o="100%";this.command.attributes.width&&(o=`${this.command.attributes.width/l*100}%`);let d=` ${this.command.attributes.style=="double"?"border-bottom: 1px solid black; height: 3px;":""}`;t+=`<div class="${s} rule" style="position:relative;"><div class="rule-solid${d}" style="width: ${o};"></div></div>`}break;case"table":t+="<table>";for(let o of this.command.attributes.rows){t+="<tr>";for(let[d,A]of o.entries()){let c,k="",h,$="",x="left",m=this.command.attributes.margin||0;m=parseInt(m),this.command.attributes.align&&(x=this.command.attributes.align[d]),this.command.attributes.width?(c=this.command.attributes.width[d],c=="*"?(c=this.builder.chars,this.command.attributes.width.filter(b=>b!="*").forEach(b=>c-=parseInt(b)+m)):c=parseInt(c)):c=parseInt(this.builder.chars/this.command.attributes.cols)-m,h=this.builder.docWidth/this.builder.chars*c,k=`width: ${h}px; max-width: ${h}px; min-width: ${h}px;`,d<o.length-1&&(h=this.builder.docWidth/this.builder.chars*m,$=`<td data-cols="${m}" class="${i}" style="${`width: ${h}px; max-width: ${h}px; min-width: ${h}px;`}">&nbsp;</td>`),t+=`<td data-cols="${c}" class="${i}" style="text-align: ${x}; ${k}">${A}</td>${$}`}t+="</tr>"}t+="</table>";break;case"barcode":t+=`<div class="${s} barcode"><img src="https://barcode.tec-it.com/barcode.ashx?data=${this.command.attributes.data}&code=${this.command.attributes.type}" width="100%"></div>`;break;case"qrcode":let n=parseInt(21*this.command.attributes.size);t+=`<div class="${s} qrcode"><img src="https://api.qrserver.com/v1/create-qr-code/?size=${n}x${n}&data=${this.command.attributes.data}"></div>`;break}return t}};function rt(a,t){return new p(a,t).toCommands()}function nt(a,t){return new p(a,t).toHtml()}})();
