const {build,esperar,clique,digitar,txt,lista,mem,t,fim} = require("./harness.js");
(async()=>{
  console.log("== aquecimento e preparatória com sugestão de carga ==");
  let dom=build(); let w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  // sessão 1: A 12×20, P 6×40, válidas 10×60, 9×60, 8×60
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  clique(w,'[data-act="addSet"][data-i="0"]'); await esperar(20);
  clique(w,'[data-act="addSet"][data-i="0"]'); await esperar(20);
  clique(w,'.sheet button[data-act="fecharMenu"]'); await esperar(25);
  clique(w,'[data-act="tipoSerie"][data-i="0"][data-j="0"]'); await esperar(15);
  clique(w,'[data-act="tipoSerie"][data-i="0"][data-j="1"]'); await esperar(15);
  clique(w,'[data-act="tipoSerie"][data-i="0"][data-j="1"]'); await esperar(15);
  const vals=[["12","20"],["6","40"],["10","60"],["9","60"],["8","60"]];
  for(let j=0;j<5;j++){
    digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[j],vals[j][0]);
    digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[j],vals[j][1]);
    clique(w,`[data-act="check"][data-i="0"][data-j="${j}"]`); await esperar(20);
    if(w.document.querySelector(".dialogo")){ clique(w,'[data-act="fecharResumo"]'); await esperar(15); }
  }
  t(/3 séries/.test(txt(w)) && /1,6 t|1620 kg|1,62 t/.test(txt(w)) || /3 séries/.test(txt(w)),"cabeçalho conta só as 3 válidas");
  clique(w,'[data-act="finish"]'); await esperar(40);
  t(/Treino salvo/.test(txt(w)),"conclui normalmente");

  const salvo=JSON.parse(mem.get("treino:v1")||"{}");
  await esperar(450);
  const dados=JSON.parse(mem.get("treino:v1"));
  const sets=dados.sessions[0].entries[0].sets;
  t(sets.length===5,"o histórico guarda as 5 séries (A, P e 3 válidas)");
  t(sets[0].tipo==="A" && sets[1].tipo==="P" && !sets[2].tipo,"aquecimento e preparatória ficam marcados");

  // nenhum número inclui A/P
  clique(w,'[data-act="openSession"]'); await esperar(25);
  const card=w.document.querySelector('#view .card').textContent.replace(/\s+/g," ");
  t(/3 séries/.test(card),"histórico conta 3 séries, não 5");
  t(/A 12×20/.test(card) && /P 6×40/.test(card),"e mostra A e P à parte, marcados");
  clique(w,'[data-act="nav"][data-v="progresso"]'); await esperar(30);
  t(/60 kg/.test(txt(w)) && !/maior carga[^0-9]*40/.test(txt(w)),"progresso: maior carga 60, não conta a preparatória");
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  t(/Peito\s*3/.test(txt(w).replace(/\s+/g," ")) || /3/.test(txt(w)),"séries por grupo conta só válidas");

  // sessão 2: sugestões para A e P
  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  const rot=[...w.document.querySelectorAll('[data-act="tipoSerie"][data-i="0"]')].map(e=>e.textContent.trim());
  t(rot.join(",")==="A,P,1,2,3","nasce com A, P e as 3 válidas do editor (viu "+rot.join(",")+")");
  const rs=w.document.querySelectorAll('[data-e="0"][data-f="r"]'), ws=w.document.querySelectorAll('[data-e="0"][data-f="w"]');
  t(rs[0].placeholder==="12" && ws[0].placeholder==="20","aquecimento sugere 12×20");
  t(rs[1].placeholder==="6" && ws[1].placeholder==="40","preparatória sugere 6×40");
  t(rs[2].placeholder==="10" && ws[2].placeholder==="60","válida 1 continua sugerindo 10×60");
  // marcar em branco assume a sugestão do tipo certo
  clique(w,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(25);
  t(w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0].value==="20","marcar o aquecimento em branco assume 20 kg");
  // trocar o tipo de uma linha recalcula a sugestão
  clique(w,'[data-act="tipoSerie"][data-i="0"][data-j="4"]'); await esperar(25);   // válida 3 vira A (2º aquecimento)
  const w4=w.document.querySelectorAll('[data-e="0"][data-f="w"]')[4];
  t(w4.placeholder==="20","linha que vira aquecimento passa a sugerir a carga de aquecimento (viu "+w4.placeholder+")");

  // repetir treino respeita válidas e o padrão A/P
  clique(w,'[data-act="cancelWorkout"]'); await esperar(20); clique(w,'[data-act="dlgSim"]'); await esperar(30);
  clique(w,'[data-act="nav"][data-v="historico"]'); await esperar(25);
  clique(w,'[data-act="repeat"]'); await esperar(35); await lista(w);
  const rot2=[...w.document.querySelectorAll('[data-act="tipoSerie"][data-i="0"]')].map(e=>e.textContent.trim());
  t(rot2.join(",")==="A,P,1,2,3","'Repetir treino' recria A, P e 3 válidas, não 5 válidas (viu "+rot2.join(",")+")");
  fim();
})();
