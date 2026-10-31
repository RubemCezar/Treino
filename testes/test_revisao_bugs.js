const {build,esperar,clique,digitar,txt,lista,mem,t,fim} = require("./harness.js");
/* Bugs achados na revisão em três rodadas (out/2026). Cada bloco reproduz o
   problema como ele acontecia e confere o comportamento corrigido. */
(async () => {
  console.log("== revisão: bugs corrigidos ==");
  const EX="supino_reto_com_barra", agora=Date.now(), D=864e5, erros=[];
  const base = extra => Object.assign({custom:[],cardio:[],medidas:[],meta:{},active:null,routines:[],sessions:[]}, extra);
  const ses = (id,dias,sets,maq) => ({id,routineId:"rA",name:"Push",start:agora-dias*D-3e6,end:agora-dias*D,
    entries:[{exId:EX,note:"",maquina:maq||"",sets}]});
  const rot = (items) => [{id:"rA",name:"Push",items}];
  const abrir = async d => { mem.set("treino:v1",JSON.stringify(d)); const w=build(true).window;
    w.console.error=(...a)=>erros.push(a.join(" ")); w.addEventListener("error",e=>erros.push(e.message));
    await esperar(200); return w; };
  const estado = async w => { w.dispatchEvent(new w.Event("pagehide")); await esperar(15); return JSON.parse(mem.get("treino:v1")); };
  const fechar = async w => { w.dispatchEvent(new w.Event("pagehide")); await esperar(15); w.close(); };
  const fazer = async (w,ei,sj,r,kg) => {
    digitar(w,w.document.querySelectorAll(`[data-e="${ei}"][data-f="r"]`)[sj],r);
    digitar(w,w.document.querySelectorAll(`[data-e="${ei}"][data-f="w"]`)[sj],kg);
    clique(w,`[data-act="check"][data-i="${ei}"][data-j="${sj}"]`); await esperar(20);
    if(w.document.querySelector(".dialogo")){ clique(w,'[data-act="fecharResumo"]'); await esperar(15); } };

  // 1) ritmo do cardio não mostra "5:60"
  let w = await abrir(base({cardio:[{id:"c1",tipo:"Corrida na rua",min:30,km:5.005,intensidade:"",nota:"",t:agora}]}));
  clique(w,'[data-act="nav"][data-v="cardio"]'); await esperar(30);
  t(/6:00 \/km/.test(txt(w)) && !/:60 /.test(txt(w)), "ritmo arredonda para 6:00 /km, nunca 5:60");
  await fechar(w);

  // 2) folha "Ver progressão": variação do índice não é apresentada em kg
  w = await abrir(base({routines:rot([{exId:EX,sets:1,reps:"",rest:0}]),
    sessions:[ses("s1",3,[{w:50,r:10,done:true}]), ses("s2",1,[{w:50,r:12,done:true}])]}));
  clique(w,'[data-act="start"]'); await esperar(40);
  clique(w,'[data-act="verProg"]'); await esperar(30);
  t(/\+3 no índice desde a 1ª sessão/.test(txt(w)), "variação do índice aparece como número do índice");
  t(!/kg desde a 1ª sessão/.test(txt(w)), "e não como kg");
  await fechar(w);

  // 3) Progresso: máquina usada só no aquecimento não vira filtro vazio com "Infinity"
  w = await abrir(base({sessions:[ses("s1",3,[{w:50,r:10,done:true}]), ses("s2",1,[{w:20,r:10,done:true,tipo:"A"}],"Maq X")]}));
  clique(w,'[data-act="nav"][data-v="progresso"]'); await esperar(30);
  t(!w.document.querySelector('[data-act="progMaq"][data-v="Maq X"]'), "máquina só com aquecimento não aparece como filtro");
  t(!/Infinity|NaN/.test(txt(w)), "Progresso sem Infinity/NaN");
  await fechar(w);

  // 4) trocar exercício leva a máquina e a sugestão do exercício novo
  w = await abrir(base({routines:rot([{exId:EX,sets:1,reps:"",rest:0}]),
    sessions:[ses("s1",2,[{w:100,r:5,done:true}],"Banco 3"),
              {id:"s2",routineId:"rA",name:"Push",start:agora-D-3e6,end:agora-D,
               entries:[{exId:"rosca_direta_com_barra",note:"",maquina:"",sets:[{w:30,r:10,done:true}]}]}]}));
  clique(w,'[data-act="start"]'); await esperar(40); await lista(w);
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  clique(w,'[data-act="swapEx"][data-i="0"]'); await esperar(20);
  clique(w,'[data-act="choose"][data-id="rosca_direta_com_barra"]'); await esperar(30);
  let S = await estado(w), en = S.active.entries[0];
  t(en.exId==="rosca_direta_com_barra", "exercício trocado");
  t(en.maquina==="", "máquina do supino não passa para a rosca (viu "+JSON.stringify(en.maquina)+")");
  t(en.sets[0].sug && en.sets[0].sug.w==="30", "sugestão vem da rosca, não do supino (viu "+JSON.stringify(en.sets[0].sug)+")");
  await fechar(w);

  // 5) "Concluir" sem nada marcado não apaga a memória de A/P (mesmo descartando depois)
  w = await abrir(base({routines:rot([{exId:EX,sets:3,reps:"",rest:0,padraoTipos:{A:2,P:1}}])}));
  clique(w,'[data-act="start"]'); await esperar(40);
  clique(w,'[data-act="finish"]'); await esperar(30);
  t(/Marque ao menos uma série/.test(txt(w)), "concluir vazio avisa");
  clique(w,'[data-act="cancelWorkout"]'); await esperar(20); clique(w,'[data-act="dlgSim"]'); await esperar(30);
  S = await estado(w);
  t(JSON.stringify(S.routines[0].items[0].padraoTipos)==='{"A":2,"P":1}', "memória de A/P intacta (viu "+JSON.stringify(S.routines[0].items[0].padraoTipos)+")");
  await fechar(w);

  // 6) exercício pulado não ensina A/P = 0
  w = await abrir(base({routines:rot([{exId:EX,sets:1,reps:"",rest:0,padraoTipos:{A:2,P:1}},
                                      {exId:"rosca_direta_com_barra",sets:1,reps:"",rest:0}])}));
  clique(w,'[data-act="start"]'); await esperar(40); await lista(w);
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  clique(w,'[data-act="pularEx"][data-i="0"]'); await esperar(20);
  await fazer(w,1,0,"10","20");
  clique(w,'[data-act="finish"]'); await esperar(40);
  S = await estado(w);
  t(S.sessions.length===1, "treino concluído");
  t(JSON.stringify(S.routines[0].items[0].padraoTipos)==='{"A":2,"P":1}', "pular não apaga a memória de A/P (viu "+JSON.stringify(S.routines[0].items[0].padraoTipos)+")");
  await fechar(w);

  // 7) campos digitados não somem quando o aviso some ou o descanso acaba
  w = await abrir(base({}));
  clique(w,'[data-act="nav"][data-v="cardio"]'); await esperar(25);
  clique(w,'[data-act="novoCardio"]'); await esperar(25);
  clique(w,'[data-act="salvarCardio"]'); await esperar(25);
  t(/Informe a duração/.test(txt(w)), "cardio sem duração avisa");
  w.document.querySelector("#cMin").value="35";
  w.document.querySelector("#cNota").value="esteira 3";
  w.document.querySelector("#cMin").focus();
  await esperar(2800);
  t(w.document.querySelector("#cMin").value==="35" && w.document.querySelector("#cNota").value==="esteira 3",
    "duração e anotação continuam depois que o aviso some");
  clique(w,'[data-act="salvarCardio"]'); await esperar(30);
  S = await estado(w);
  t(S.cardio.length===1 && S.cardio[0].min===35 && S.cardio[0].nota==="esteira 3", "e o cardio é salvo com elas");
  clique(w,'[data-act="nav"][data-v="medidas"]'); await esperar(25);
  clique(w,'[data-act="novaMedida"]'); await esperar(25);
  w.document.querySelector('[data-medv="peso"]').value="82,4";
  w.document.querySelector('[data-medv="peso"]').focus();
  clique(w,'[data-act="abrirConfig"]'); await esperar(20);           // redesenho completo com a folha aberta
  const peso = w.document.querySelector('[data-medv="peso"]');
  t(peso && peso.value==="82,4", "medida digitada continua depois de um redesenho da tela");
  t(peso && w.document.activeElement===peso, "e o cursor volta para o mesmo campo");
  await fechar(w);

  // 8) backup malformado não derruba as telas
  w = await abrir(base({}));
  clique(w,'[data-act="abrirConfig"]'); await esperar(25);
  clique(w,'[data-act="pasteOpen"]'); await esperar(20);
  w.document.querySelector("#bkTa").value = JSON.stringify({sessions:[{id:"x",name:"X",start:agora,end:agora,entries:[{exId:EX}]}, null, 7],
    routines:[{id:"r",name:"R"}, {name:"Sem itens válidos", items:[null,{sets:3}]}], medidas:[{id:"m",t:agora}], cardio:[{id:"c"}], custom:[{id:"q"}]});
  const antes = erros.length;
  clique(w,'[data-act="pasteApply"]'); await esperar(40);
  for(const v of ["treinar","historico","progresso","medidas","cardio"]){ clique(w,`[data-act="nav"][data-v="${v}"]`); await esperar(25); }
  t(erros.length===antes, "nenhum erro nas telas depois do backup malformado ("+(erros[antes]||"")+")");
  S = await estado(w);
  t(S.sessions.length===1 && S.sessions[0].entries[0].sets.length===0, "sessão aproveitável fica, lixo sai");
  await fechar(w);

  // 9) descanso 0 ("desligado") no editor sobrevive a reabrir o app
  w = await abrir(base({routines:rot([{exId:EX,sets:3,reps:"",rest:90}])}));
  clique(w,'[data-act="abrirRotina"]'); await esperar(20); clique(w,'[data-act="editRoutine"]'); await esperar(25);
  digitar(w,w.document.querySelector('[data-item="0"][data-f="rest"]'),"0");
  clique(w,'[data-act="saveRoutine"]'); await esperar(30);
  await fechar(w);
  w = build(true).window; await esperar(200);
  S = await estado(w);
  t(S.routines[0].items[0].rest===0, "descanso 0 continua 0 depois de reabrir (viu "+S.routines[0].items[0].rest+")");
  clique(w,'[data-act="start"]'); await esperar(40);
  S = await estado(w);
  t(S.active.entries[0].rest===0, "e o treino abre com descanso desligado");
  await fechar(w);

  t(erros.length===0, "nenhum erro no console ("+(erros[0]||"")+")");
  fim();
})();
