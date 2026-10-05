const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(process.argv[2]||require("path").join(__dirname,"..","index.html"),"utf8");
const mem=new Map();
let ok=0, falhas=0;
const t=(c,m)=>{ if(c) ok++; else {falhas++; console.log("  ✗ "+m);} };
function build(manterMem){
  if(!manterMem) mem.clear();   // por padrão cada build() começa do zero (app "recém-instalado")
  return new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`,{
    runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.test/",
    beforeParse(w){ w.storage={
      get:async k=>{ if(!mem.has(k)) throw new Error("v"); return {key:k,value:mem.get(k)}; },
      set:async (k,v)=>{ mem.set(k,v); return {key:k,value:v}; }
    }; }
  });
}
const esperar=ms=>new Promise(r=>setTimeout(r,ms||30));
const clique=(w,sel,i)=>{ const e=w.document.querySelectorAll(sel)[i||0];
  if(!e){ console.log("faltou:",sel); return false; }
  e.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); return true; };
const digitar=(w,el,v)=>{ el.value=v; el.dispatchEvent(new w.Event("input",{bubbles:true})); };
const txt=w=>["#top","#view","#float"].map(s=>{const e=w.document.querySelector(s);return e?e.textContent:""}).join(" ").replace(/\s+/g," ");
const lista=async w=>{ const b=w.document.querySelector('[data-act="modoLista"]');
  if(b){ b.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await esperar(25); } };
module.exports={build,esperar,clique,digitar,txt,lista,mem,t,fim:()=>{console.log(`\n${ok} ok, ${falhas} falhas`); process.exit(falhas?1:0);}};
