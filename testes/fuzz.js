const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(process.argv[2]||require("path").join(__dirname,"..","index.html"),"utf8");
const PASSOS=+(process.argv[3]||600), SEMENTE=+(process.argv[4]||1);
let sem=SEMENTE; const rnd=()=>{ sem=(sem*1103515245+12345)&0x7fffffff; return sem/0x7fffffff; };
const mem=new Map();
const dom=new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`,{
  runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.test/",
  beforeParse(w){ w.storage={get:async k=>{if(!mem.has(k))throw new Error("v");return{key:k,value:mem.get(k)}},
                             set:async(k,v)=>{mem.set(k,v);return{key:k,value:v}}};
    w.scrollTo=()=>{}; }});
const w=dom.window; const prob=[]; const hist=[];
w.console.error=(...a)=>prob.push("console: "+a.join(" "));
w.addEventListener("error",e=>prob.push("erro: "+e.message+" | "+((e.error&&e.error.stack)||"").split("\n")[1]));
w.URL.createObjectURL=()=>"blob:x"; w.URL.revokeObjectURL=()=>{};
w.HTMLAnchorElement.prototype.click=function(){};
(async()=>{
  await new Promise(r=>setTimeout(r,150));
  for(let i=0;i<PASSOS;i++){
    const alvos=[...w.document.querySelectorAll('[data-act]:not([disabled])')];
    const campos=[...w.document.querySelectorAll('input:not([type=file]),textarea')];
    if(!alvos.length){ prob.push("sem controles no passo "+i); break; }
    if(rnd()<0.28 && campos.length){
      const el=campos[Math.floor(rnd()*campos.length)];
      const v=["","5","12,5","abc","-3","999999","8.88","  ","Máquina X"][Math.floor(rnd()*9)];
      el.value=v; el.dispatchEvent(new w.Event("input",{bubbles:true}));
      hist.push("digitou "+(el.id||el.dataset.f||Object.keys(el.dataset)[0]||"campo")+"="+JSON.stringify(v));
    } else {
      const el=alvos[Math.floor(rnd()*alvos.length)];
      hist.push(el.dataset.act+(el.dataset.i!==undefined?"["+el.dataset.i+"]":""));
      el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
    }
    await new Promise(r=>setTimeout(r,3));
    const v=w.document.querySelector("#view");
    if(v && !v.textContent.trim() && !w.document.querySelector(".overlay")){ prob.push("tela em branco no passo "+i); }
    if(prob.length){ prob.push("últimas: "+hist.slice(-8).join(" → ")); break; }
  }
  const bruto=mem.get("treino:v1");
  if(bruto){ try{ const d=JSON.parse(bruto);
    (d.sessions||[]).forEach((se,i)=>(se.entries||[]).forEach(en=>(en.sets||[]).forEach(st=>{
      if(typeof st.w!=="number"||!isFinite(st.w)||st.w<0) prob.push("sessão "+i+" com carga inválida: "+st.w);
      if(typeof st.r!=="number"||!isFinite(st.r)||st.r<0) prob.push("sessão "+i+" com reps inválidas: "+st.r);
    })));
    (d.cardio||[]).forEach((c,i)=>{ if(!(c.min>0)) prob.push("cardio "+i+" sem duração"); if(!isFinite(c.km)||c.km<0) prob.push("cardio "+i+" km inválido: "+c.km); });
  }catch(e){ prob.push("JSON inválido"); } }
  console.log(prob.length ? [...new Set(prob)].slice(0,4).join("\n") : `semente ${SEMENTE}: ${PASSOS} passos, íntegro`);
  process.exit(prob.length?1:0);
})();
