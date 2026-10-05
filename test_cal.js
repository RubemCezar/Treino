const {build,esperar,clique,mem,t,fim} = require("./harness.js");
(async()=>{
  console.log("== navegação do calendário ==");
  const d=new Date(), mp=new Date(d.getFullYear(), d.getMonth()-1, 10).getTime();
  mem.set("treino:v1",JSON.stringify({custom:[],active:null,meta:{},routines:[],
    cardio:[{id:"c",tipo:"Esteira",min:30,km:5,intensidade:"",nota:"",t:mp+86400000}],
    sessions:[{id:"b",name:"Pull",start:mp,end:mp+3e6,entries:[{exId:"barra_fixa",sets:[{w:0,r:8,done:true}]}]}]}));
  const dom=build(true); const w=dom.window; await esperar(200);
  clique(w,'[data-act="abrirCal"]'); await esperar(30);
  const titulo=()=>[...w.document.querySelectorAll('#view h2')][0].textContent;
  const chips=[...w.document.querySelectorAll('.mes-chip')];
  t(chips.length===19,"faixa com 12 meses para trás, o atual e 6 à frente ("+chips.length+")");
  t(w.document.querySelector('.mes-chip.on.atual')!==null,"abre marcando o mês atual");
  const comAtiv=w.document.querySelector('.mes-chip.tem');
  t(comAtiv && comAtiv.textContent.includes("2"),"mês passado mostra 2 atividades (treino + cardio)");
  comAtiv.dispatchEvent(new w.MouseEvent("click",{bubbles:true})); await esperar(30);
  t(w.document.querySelectorAll('.dia.treino').length===1 && w.document.querySelectorAll('.dia.cardio').length>=1,"tocar no mês leva até ele, com o treino e o cardio marcados");
  clique(w,'[data-act="irMes"]',18); await esperar(30);
  t(!w.document.querySelector('[data-act="mes"][data-d="1"]').disabled,"dá para ir aos meses futuros");
  for(let k=0;k<10;k++){ clique(w,'[data-act="mes"][data-d="1"]'); await esperar(10); }
  t(w.document.querySelector('[data-act="mes"][data-d="1"]').disabled,"mas com limite de 12 meses à frente");
  // deslizar
  clique(w,'[data-act="irMes"]',12); await esperar(30);
  const antes=titulo();
  const toque=(tipo,x)=>{ const grade=w.document.querySelector("#gradeCal");   // a grade é recriada a cada mês
    const ev=new w.Event(tipo,{bubbles:true}); ev.changedTouches=[{clientX:x,clientY:300}];
    Object.defineProperty(ev,"target",{value:grade}); grade.dispatchEvent(ev); };
  toque("touchstart",100); toque("touchend",300); await esperar(30);
  t(titulo()!==antes,"deslizar para a direita volta um mês ("+antes+" → "+titulo()+")");
  toque("touchstart",300); toque("touchend",100); await esperar(30);
  t(titulo()===antes,"deslizar para a esquerda avança");
  toque("touchstart",300); toque("touchend",280); await esperar(30);
  t(titulo()===antes,"deslize curto é ignorado");
  fim();
})();
