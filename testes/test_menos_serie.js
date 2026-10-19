const {build,esperar,clique,digitar,txt,lista,mem,t,fim} = require("./harness.js");
(async () => {
  console.log("== botão − (menos uma série) baixa o plano do treino ==");
  const agora = Date.now(), EX = "supino_reto_com_barra", erros = [];
  const dados = (sets, pad, active) => ({custom:[], cardio:[], meta:{}, sessions:[], active:active||null,
    routines:[{id:"rA", name:"Push", items:[{exId:EX, sets, reps:"8-12", rest:90, padraoTipos:pad}]}]});
  const T = () => ({w:"", r:"", done:false, sug:null});
  const ativo = (sets, exId, routineId) => ({routineId: routineId===undefined?"rA":routineId, name:"Push",
    start:agora-1e6, entries:[{exId:exId||EX, rest:90, reps:"", note:"", maquina:"", sets}]});
  const abrir = async d => { mem.set("treino:v1", JSON.stringify(d)); const w=build(true).window;
    w.console.error=(...a)=>erros.push(a.join(" ")); await esperar(200); return w; };
  // o app grava com 350 ms de atraso; "pagehide" força a gravação na hora
  const gravar = async w => { w.dispatchEvent(new w.Event("pagehide")); await esperar(15); };
  const estado = async w => { await gravar(w); return JSON.parse(mem.get("treino:v1")); };
  const plano = async w => (await estado(w)).routines[0].items[0].sets;
  const padrao = async w => JSON.stringify((await estado(w)).routines[0].items[0].padraoTipos);
  // fecha a janela para ela não gravar por cima do cenário seguinte
  const encerrar = async w => { await gravar(w); w.close(); };
  const linhas = w => w.document.querySelectorAll('[data-act="check"][data-i="0"]').length;
  const iniciar = async w => { clique(w,'[data-act="start"]'); await esperar(40); await lista(w); };
  const retomar = async w => { clique(w,'[data-act="retomar"]'); await esperar(40); await lista(w); };
  const abreMenu = async w => { if(!w.document.querySelector('[data-act="delSet"][data-i="0"]')){
    clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(25); } };
  const fechaMenu = async w => { if(w.document.querySelector('[data-act="fecharMenu"]')){
    clique(w,'[data-act="fecharMenu"]'); await esperar(20); } };
  const tocar = async (w, acao, n) => { await abreMenu(w);
    for(let k=0;k<n;k++){ clique(w,`[data-act="${acao}"][data-i="0"]`); await esperar(20); } };
  const menos = (w,n) => tocar(w,"delSet",n), mais = (w,n) => tocar(w,"addSet",n);

  // 1) o caso real: plano com 5 válidas (+2 A +2 P); tirar 2 e concluir
  let w = await abrir(dados(5,{A:2,P:2}));
  await iniciar(w);
  t(linhas(w)===9, "treino abre com 2 A + 2 P + 5 válidas (viu "+linhas(w)+")");
  await menos(w,1);
  t(/Próximos treinos: 4 séries válidas/.test(txt(w)), "aviso diz quantas séries os próximos treinos terão");
  let p = await plano(w);
  t(p===4, "tirar 1 válida baixa o plano para 4 (viu "+p+")");
  await menos(w,1);
  p = await plano(w);
  t(linhas(w)===7 && p===3, "tirar mais 1: 7 linhas hoje e plano 3 (viu "+linhas(w)+"/"+p+")");
  const pd = await padrao(w);
  t(pd==='{"A":2,"P":2}', "A e P não mudam ao tirar válidas (viu "+pd+")");
  await fechaMenu(w);
  for(let j=0;j<7;j++){   // faz as 7 linhas (A,A,P,P,1,2,3) para o app reaprender A/P ao concluir
    digitar(w, w.document.querySelectorAll('[data-e="0"][data-f="r"]')[j], "10");
    digitar(w, w.document.querySelectorAll('[data-e="0"][data-f="w"]')[j], "60");
    clique(w,`[data-act="check"][data-i="0"][data-j="${j}"]`); await esperar(20);
    if(w.document.querySelector(".dialogo")){ clique(w,'[data-act="fecharResumo"]'); await esperar(15); }
  }
  clique(w,'[data-act="finish"]'); await esperar(40);
  if(w.document.querySelector(".dialogo")){ clique(w,'[data-act="fecharResumo"]'); await esperar(15); }
  const dep = await estado(w);
  t(dep.sessions.length===1, "treino concluído virou histórico");
  t(dep.routines[0].items[0].sets===3, "depois de concluir, o plano continua 3 (viu "+dep.routines[0].items[0].sets+")");
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(30);
  await iniciar(w);
  t(linhas(w)===7, "próximo treino abre com 2 A + 2 P + 3 válidas (viu "+linhas(w)+")");
  await encerrar(w);

  // 2) "+" nunca sobe o plano; "+" e depois "−" não encolhe; "−" abaixo do plano baixa
  w = await abrir(dados(3,{A:0,P:0}));
  await iniciar(w);
  await mais(w,1);
  p = await plano(w);
  t(linhas(w)===4 && p===3, "+ vale só para o dia, plano segue 3 (viu "+linhas(w)+"/"+p+")");
  await menos(w,1);
  p = await plano(w);
  t(linhas(w)===3 && p===3, "+ e depois −: o plano não encolhe (viu "+linhas(w)+"/"+p+")");
  await menos(w,1);
  p = await plano(w);
  t(linhas(w)===2 && p===2, "− abaixo do plano baixa o plano (viu "+linhas(w)+"/"+p+")");
  await encerrar(w);

  // 3) tirar uma linha P (a última) não mexe no plano; a válida seguinte sim
  w = await abrir(dados(3,{A:0,P:1}, ativo([T(),T(),T(),Object.assign(T(),{tipo:"P"})])));
  await retomar(w);
  const rot = [...w.document.querySelectorAll('[data-act="tipoSerie"]')].map(e=>e.textContent.trim()).join(",");
  t(linhas(w)===4, "treino em andamento retomado com 4 linhas (viu "+linhas(w)+", tipos "+rot+")");
  await menos(w,1);
  p = await plano(w);
  t(linhas(w)===3 && p===3, "tirar uma série P não muda o plano (viu "+linhas(w)+"/"+p+", tipos antes "+rot+")");
  await menos(w,1);
  p = await plano(w);
  t(p===2, "tirar uma válida em seguida baixa o plano (viu "+p+")");
  await encerrar(w);

  // 4) piso: nunca abaixo de 1 série válida
  w = await abrir(dados(1,{A:1,P:0}));
  await iniciar(w);
  await menos(w,2);
  p = await plano(w);
  t(p===1 && linhas(w)===1, "plano nunca fica abaixo de 1 (viu "+p+", "+linhas(w)+" linha)");
  await encerrar(w);

  // 5) treino livre e exercício avulso: nada muda no treino salvo, sem erro
  w = await abrir(dados(3,{A:0,P:0}, ativo([T(),T(),T()], EX, null)));
  await retomar(w);
  await menos(w,1);
  p = await plano(w);
  t(linhas(w)===2 && p===3, "treino livre não mexe em nenhum treino salvo (viu "+linhas(w)+"/"+p+")");
  await encerrar(w);
  w = await abrir(dados(3,{A:0,P:0}, ativo([T(),T(),T()], "agachamento_livre")));
  await retomar(w);
  await menos(w,1);
  p = await plano(w);
  t(linhas(w)===2 && p===3, "exercício que não está no treino não mexe no plano (viu "+linhas(w)+"/"+p+")");
  await encerrar(w);

  t(erros.length===0, "nenhum erro no console ("+(erros[0]||"")+")");
  fim();
})();
