const {build,esperar,clique,digitar,txt,lista,mem,t,fim} = require("./harness.js");
const ponteiro=(w,tipo,alvo,y)=>{ const ev=new w.Event(tipo,{bubbles:true}); ev.clientY=y; ev.clientX=100;
  Object.defineProperty(ev,"target",{value:alvo}); alvo.dispatchEvent(ev); };
(async () => {
  console.log("== rodada 2: fluxos sem cobertura ==");
  // --- arraste de treinos na tela inicial
  let dom=build(); let w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  w.Element.prototype.getBoundingClientRect=function(){ const i=+(this.dataset&&this.dataset.arrastar);
    return isNaN(i)?{top:0,height:0,bottom:0,left:0,right:0,width:0}:{top:100+i*120,height:110,bottom:210+i*120,left:0,right:360,width:360}; };
  const nomes=()=>[...w.document.querySelectorAll('[data-lista="rotinas"] h3')].map(e=>e.textContent.replace("Próximo","").trim());
  const antes=nomes();
  const alvo=w.document.querySelectorAll('[data-lista="rotinas"]')[2];
  ponteiro(w,"pointerdown",alvo,100+2*120+55); await esperar(360);
  ponteiro(w,"pointermove",w.document,110); await esperar(20);
  ponteiro(w,"pointerup",w.document,110); await esperar(60);
  t(nomes()[0]===antes[2],"arrastar treino para o topo funciona");
  await esperar(400);   // o app ignora de propósito o toque logo após soltar o arraste

  // --- arraste de exercícios no editor
  clique(w,'[data-act="abrirRotina"]'); await esperar(20);
  if(!w.document.querySelector('[data-act="editRoutine"]')){ clique(w,'[data-act="abrirRotina"]'); await esperar(20); }
  clique(w,'[data-act="editRoutine"]'); await esperar(30);
  const exs=()=>[...w.document.querySelectorAll('[data-lista="itens"] h3')].map(e=>e.textContent);
  const a2=exs(); const al2=w.document.querySelectorAll('[data-lista="itens"]')[3];
  ponteiro(w,"pointerdown",al2,100+3*120+55); await esperar(360);
  ponteiro(w,"pointermove",w.document,110); await esperar(20);
  ponteiro(w,"pointerup",w.document,110); await esperar(60);
  t(exs()[0]===a2[3],"arrastar exercício no editor funciona");

  // --- migração de dados de versões antigas
  mem.set("treino:v1",JSON.stringify({custom:[],routines:[{id:"r1",name:"Legs",items:[{exId:"agachamento_livre",sets:"4",reps:8,rest:"90",padraoTipos:{A:1,P:0,T:2}}]}],
    sessions:[{id:"s",routineId:"r1",name:"Legs",start:Date.now()-9e6,end:Date.now()-8e6,entries:[{exId:"agachamento_livre",sets:[{w:80,r:8,done:true,warm:false}]}]}],
    active:{routineId:"r1",name:"Legs",start:Date.now()-2e6,entries:[{exId:"agachamento_livre",sets:[{w:"40",r:"12",done:true,warm:true},{w:"80",r:"8",done:false,sug:true}]}]}}));
  dom=build(true); w=dom.window; const errs=[]; w.console.error=(...a)=>errs.push(a.join(" "));
  await esperar(200);
  t(errs.length===0,"dados antigos abrem sem erro ("+(errs[0]||"")+")");
  clique(w,'[data-act="retomar"]'); await esperar(30); await lista(w);
  const rot=[...w.document.querySelectorAll('[data-act="tipoSerie"]')].map(e=>e.textContent.trim());
  t(rot[0]==="A","aquecimento do formato antigo (warm) vira A");
  const s2=w.document.querySelectorAll('[data-f="w"]')[1];
  t(s2.value==="" && s2.placeholder==="80","sugestão antiga vira sugestão, não valor preenchido");
  clique(w,'[data-act="finish"]'); await esperar(40);
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  t(w.document.querySelectorAll('[data-e="0"][data-f="r"]').length===5,"séries do editor ('4' em texto) + aquecimento lembrado = 5");

  // --- backup: copiar em uma instalação, colar em outra
  clique(w,'[data-act="voltarTreino"]'); await esperar(25);
  clique(w,'[data-act="abrirConfig"]'); await esperar(30);
  clique(w,'[data-act="copyBackup"]'); await esperar(30);
  const backup=(w.document.querySelector("#bkTa")||{}).value;
  t(!!backup && /"app":"treino"/.test(backup),"backup gerado");
  dom=build(); w=dom.window; await esperar(150);
  clique(w,'[data-act="abrirConfig"]'); await esperar(30);
  clique(w,'[data-act="pasteOpen"]'); await esperar(25);
  w.document.querySelector("#bkTa").value=backup;
  clique(w,'[data-act="pasteApply"]'); await esperar(40);
  clique(w,'[data-act="nav"][data-v="historico"]'); await esperar(25);
  t(w.document.querySelectorAll('[data-act="openSession"]').length===2,"backup restaurado traz os treinos");
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  t(/em andamento/i.test(txt(w)),"e o treino em andamento também");
  fim();
})();
