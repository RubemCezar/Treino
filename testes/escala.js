const fs=require("fs"),{JSDOM}=require("jsdom");
const html=fs.readFileSync(require("path").join(__dirname,"..","index.html"),"utf8");
const exs=["supino_reto_com_barra","agachamento_livre","levantamento_terra","barra_fixa","desenvolvimento_com_barra","rosca_direta_com_barra","leg_press_45","mesa_flexora"];
const maqs=["Technogym","Matrix","Life Fitness",""];
const sessions=[], cardio=[];
for(let i=0;i<320;i++){ const t=Date.now()-i*36e5*40;
  sessions.push({id:"s"+i,routineId:"r"+(i%4),name:["Push","Pull","Legs","Upper"][i%4],start:t,end:t+4e6,
    entries:exs.slice(i%3,(i%3)+6).map((ex,k)=>({exId:ex,note:"",maquina:maqs[(i+k)%4],
      sets:[0,1,2,3].map(j=>({w:50+((i+j)%30),r:8+(j%4),done:true}))}))});
  if(i%2) cardio.push({id:"c"+i,tipo:"Esteira",min:30,km:5.25,intensidade:"Moderado",nota:"",t:t+5e6});
}
const routines=[0,1,2,3].map(i=>({id:"r"+i,name:["Push","Pull","Legs","Upper"][i],
  items:exs.map(e=>({exId:e,sets:4,reps:"8-12",rest:90,padraoTipos:{A:1,P:1}}))}));
const dados={custom:[],routines,sessions,cardio,active:null,meta:{lastBackup:0,lastBackupCount:0}};
const bruto=JSON.stringify(dados);
console.log("estado:", Math.round(bruto.length/1024),"KB |", sessions.length,"treinos,",cardio.length,"cardios");
const mem=new Map([["treino:v1",bruto]]);
const dom=new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.test/",
  beforeParse(w){ w.storage={get:async k=>({key:k,value:mem.get(k)}),set:async(k,v)=>{mem.set(k,v);return{key:k,value:v}}}; w.scrollTo=()=>{}; }});
const w=dom.window; const err=[]; w.console.error=(...a)=>err.push(a.join(" "));
const c=s=>{const e=w.document.querySelector(s); if(e) e.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};
const med=async(nome,fn)=>{const t0=performance.now(); fn(); const d=performance.now()-t0; console.log(`${nome.padEnd(34)} ${d.toFixed(0).padStart(4)} ms`); await new Promise(r=>setTimeout(r,30));};
(async()=>{
  await new Promise(r=>setTimeout(r,250));
  await med("tela Treino (inicial)",()=>c('[data-act="nav"][data-v="historico"]'));
  await med("voltar à tela Treino",()=>c('[data-act="nav"][data-v="treinar"]'));
  await med("abrir um treino salvo",()=>c('[data-act="abrirRotina"]'));
  await med("iniciar treino (máquina+tipos)",()=>c('[data-act="start"]'));
  await med("marcar uma série",()=>c('[data-act="check"][data-i="0"][data-j="2"]'));
  await med("abrir menu ⋯ (sugestões máquina)",()=>c('[data-act="exMenu"][data-i="0"]'));
  c('[data-act="fecharMenu"]'); await new Promise(r=>setTimeout(r,30));
  c('[data-act="voltarTreino"]'); await new Promise(r=>setTimeout(r,30));
  await med("Histórico",()=>c('[data-act="nav"][data-v="historico"]'));
  await med("Progresso",()=>c('[data-act="nav"][data-v="progresso"]'));
  await med("Progresso filtrado por máquina",()=>c('[data-act="progMaq"]:nth-of-type(2)'));
  await med("Cardio",()=>c('[data-act="nav"][data-v="cardio"]'));
  c('[data-act="nav"][data-v="treinar"]'); await new Promise(r=>setTimeout(r,30));
  await med("Calendário",()=>c('[data-act="abrirCal"]'));
  console.log("erros:", err.length?err.slice(0,2):"nenhum");
  process.exit(0);
})();
