const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== fluxo básico ==");
  const dom=build(); const w=dom.window; await esperar(150);
  t(/Monte seu treino/.test(txt(w)),"tela inicial vazia");
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  t(w.document.querySelectorAll('[data-act="abrirRotina"]').length===3,"três treinos criados");
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);
  digitar(w,w.document.querySelectorAll('[data-f="r"]')[0],"10");
  digitar(w,w.document.querySelectorAll('[data-f="w"]')[0],"60");
  clique(w,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(25);
  t(w.document.querySelector(".chk.on")!==null,"série marcada");
  clique(w,'[data-act="finish"]'); await esperar(40);
  t(/Treino salvo/.test(txt(w)),"treino concluído");
  fim();
})();
