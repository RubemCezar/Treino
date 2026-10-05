const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== casos de borda da memória de tipos ==");

  // exercício novo (sem histórico): não deve quebrar
  let dom=build(); let w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);
  const n0 = w.document.querySelectorAll('[data-e="0"][data-f="r"]').length;
  t(n0===3, "exercício sem histórico continua com o padrão de 3 séries (viu "+n0+")");

  // treino livre (sem rotina) não tem onde aprender — não pode quebrar
  clique(w,'[data-act="cancelWorkout"]'); await esperar(25);
  clique(w,'[data-act="dlgSim"]'); await esperar(30);

  // sessão em que TUDO é aquecimento (nenhuma válida) — não deve travar a próxima
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);
  for(let j=0;j<3;j++) { clique(w,`[data-act="tipoSerie"][data-i="0"][data-j="${j}"]`); await esperar(15); }
  for(let j=0;j<3;j++){
    digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[j],"15");
    digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[j],"10");
    clique(w,`[data-act="check"][data-i="0"][data-j="${j}"]`); await esperar(20);
  }
  clique(w,'[data-act="finish"]'); await esperar(40);
  t(/Treino salvo/.test(txt(w)), "conclui mesmo com um exercício 100% aquecimento");

  await esperar(500);
  dom=build(true); w=dom.window; await esperar(200);
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);
  const n1 = w.document.querySelectorAll('[data-e="0"][data-f="r"]').length;
  t(n1>=1, "mesmo sem nenhuma válida anterior, a próxima sessão ainda cria alguma série (viu "+n1+")");
  const tipos = [...w.document.querySelectorAll('[data-act="tipoSerie"][data-i="0"]')].map(e=>e.textContent.trim());
  t(tipos.filter(x=>x==="A").length===3, "lembra as 3 de aquecimento (viu "+tipos.join(",")+")");
  t(tipos.some(x=>/^\d+$/.test(x)), "e ainda oferece ao menos 1 válida para preencher, mesmo sem sugestão de carga");

  fim();
})();
