const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== treino lembra tipos de série ==");
  const dom=build(); const w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);

  // sessão 1: 1 aquecimento + 2 válidas
  clique(w,'[data-act="tipoSerie"][data-i="0"][data-j="0"]'); await esperar(20);
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[0],"12");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0],"10");
  clique(w,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(25);
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[1],"11");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[1],"20");
  clique(w,'[data-act="check"][data-i="0"][data-j="1"]'); await esperar(25);
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[2],"9");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[2],"22,5");
  clique(w,'[data-act="check"][data-i="0"][data-j="2"]'); await esperar(25);
  clique(w,'[data-act="finish"]'); await esperar(40);

  await esperar(500);
  const dom2=build(true); const w2=dom2.window; await esperar(200);
  clique(w2,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  clique(w2,'[data-act="start"]'); await esperar(30);
  await lista(w2);

  const n = w2.document.querySelectorAll('[data-e="0"][data-f="r"]').length;
  t(n===4, "aquecimento lembrado + 3 válidas do editor, sem encolher (viu "+n+")");

  const rot0 = w2.document.querySelectorAll('[data-act="tipoSerie"][data-i="0"]')[0].textContent.trim();
  const rot1 = w2.document.querySelectorAll('[data-act="tipoSerie"][data-i="0"]')[1].textContent.trim();
  const rot2 = w2.document.querySelectorAll('[data-act="tipoSerie"][data-i="0"]')[2].textContent.trim();
  t(rot0==="A", "a primeira série já vem marcada como aquecimento (viu "+rot0+")");
  t(rot1==="1" && rot2==="2", "e as duas seguintes são válidas 1 e 2 (viu "+rot1+","+rot2+")");

  const r1=w2.document.querySelectorAll('[data-e="0"][data-f="r"]')[1];
  const w1=w2.document.querySelectorAll('[data-e="0"][data-f="w"]')[1];
  t(r1.placeholder==="11" && w1.placeholder==="20", "a sugestão de carga vai para a série válida certa (viu "+r1.placeholder+"×"+w1.placeholder+")");

  // a série de aquecimento pré-criada não atrapalha volume/recorde se ficar sem preencher
  t(!/2 séries/.test(txt(w2).replace(/\s+/g," ")), "ainda sem marcar nada, não conta como 2 séries feitas");

  fim();
})();
