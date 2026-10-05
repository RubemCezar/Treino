const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
const MAL = `Treino "A" <b class="injetado">x</b> & 'y' <img class="injetado" src=x onerror=alert(1)>`;
(async () => {
  console.log("== textos hostis em todos os campos ==");
  const dom=build(); const w=dom.window; await esperar(150);
  let alertou=false; w.alert=()=>{alertou=true;};
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  clique(w,'[data-act="abrirRotina"]'); await esperar(20);
  clique(w,'[data-act="editRoutine"]'); await esperar(25);
  digitar(w,w.document.querySelector("#rname"),MAL);
  clique(w,'[data-act="saveRoutine"]'); await esperar(30);
  t(w.document.querySelectorAll(".injetado").length===0,"nome do treino não vira HTML");
  t(txt(w).includes('Treino "A" <b class="injetado">x</b>'),"e aparece literalmente como texto");

  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  digitar(w,w.document.querySelector('[data-maquina="0"]'),MAL);
  digitar(w,w.document.querySelector('[data-note="0"]'),MAL);
  clique(w,'[data-act="fecharMenu"]'); await esperar(25);
  t(w.document.querySelectorAll(".injetado").length===0,"máquina e anotação não viram HTML");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[0],"10");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0],"50");
  clique(w,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(25);
  clique(w,'[data-act="pickWorkout"]'); await esperar(25);
  digitar(w,w.document.querySelector("#pq"),MAL); await esperar(25);
  t(w.document.querySelectorAll(".injetado").length===0,"busca de exercício não vira HTML");
  clique(w,'[data-act="newEx"]'); await esperar(20);
  clique(w,'[data-act="novoGrupo"][data-m="Peito"]'); await esperar(30);
  clique(w,'[data-act="finish"]'); await esperar(40);
  clique(w,'[data-act="openSession"]'); await esperar(25);
  t(w.document.querySelectorAll(".injetado").length===0,"histórico com tudo isso não vira HTML");

  clique(w,'[data-act="nav"][data-v="progresso"]'); await esperar(30);
  t(w.document.querySelectorAll(".injetado").length===0,"progresso com máquina hostil não vira HTML");

  clique(w,'[data-act="nav"][data-v="cardio"]'); await esperar(25);
  clique(w,'[data-act="novoCardio"]'); await esperar(25);
  digitar(w,w.document.querySelector("#cMin"),"20");
  digitar(w,w.document.querySelector("#cNota"),MAL);
  clique(w,'[data-act="salvarCardio"]'); await esperar(30);
  t(w.document.querySelectorAll(".injetado").length===0,"anotação do cardio não vira HTML");
  t(!alertou,"nenhum código embutido foi executado");
  fim();
})();
