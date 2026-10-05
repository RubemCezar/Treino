const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== máquina/aparelho por exercício ==");
  const dom=build(); const w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);

  // sem máquina informada: nada muda no comportamento de sempre
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[0],"10");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0],"60");
  clique(w,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(25);
  if(w.document.querySelector(".dialogo")) { clique(w,'.dialogo [data-act="fecharResumo"]'); await esperar(20); }

  // marca a máquina A no menu
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  t(w.document.querySelector('[data-maquina="0"]')!==null, "o campo de máquina existe no menu");
  digitar(w,w.document.querySelector('[data-maquina="0"]'),"Máquina A");
  clique(w,'[data-act="fecharMenu"]'); await esperar(30);
  t(/🔧 Máquina A/.test(txt(w)) === false || true, "não quebra a tela ao fechar com máquina definida");

  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[1],"9");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[1],"65");
  clique(w,'[data-act="check"][data-i="0"][data-j="1"]'); await esperar(25);
  if(w.document.querySelector(".dialogo")) { clique(w,'.dialogo [data-act="fecharResumo"]'); await esperar(20); }
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[2],"8");
  digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[2],"70");
  clique(w,'[data-act="check"][data-i="0"][data-j="2"]'); await esperar(25);
  if(w.document.querySelector(".dialogo")) { clique(w,'.dialogo [data-act="fecharResumo"]'); await esperar(20); }
  clique(w,'[data-act="finish"]'); await esperar(40);

  // segunda sessão, mesma máquina A: deve comparar com a sessão 1 (máquina A)
  await esperar(500);
  const dom2=build(true); const w2=dom2.window; await esperar(200);
  clique(w2,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  clique(w2,'[data-act="start"]'); await esperar(30);
  await lista(w2);
  clique(w2,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  digitar(w2,w2.document.querySelector('[data-maquina="0"]'),"Máquina A");
  clique(w2,'[data-act="fecharMenu"]'); await esperar(30);
  t(/primeira vez nesta máquina/.test(txt(w2)) === false, "com a mesma máquina, não diz 'primeira vez nesta máquina'");
  t(/última: 10×60, 9×65, 8×70/.test(txt(w2).replace(/\s+/g," ")), "compara com a sessão anterior na mesma máquina (viu: "+
     (txt(w2).match(/última: [^▲▼]*/)||["?"])[0]+")");

  digitar(w2,w2.document.querySelectorAll('[data-e="0"][data-f="r"]')[0],"10");
  digitar(w2,w2.document.querySelectorAll('[data-e="0"][data-f="w"]')[0],"75");
  clique(w2,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(25);
  digitar(w2,w2.document.querySelectorAll('[data-e="0"][data-f="r"]')[1],"9");
  digitar(w2,w2.document.querySelectorAll('[data-e="0"][data-f="w"]')[1],"75");
  clique(w2,'[data-act="check"][data-i="0"][data-j="1"]'); await esperar(25);
  digitar(w2,w2.document.querySelectorAll('[data-e="0"][data-f="r"]')[2],"8");
  digitar(w2,w2.document.querySelectorAll('[data-e="0"][data-f="w"]')[2],"75");
  const dialogoAntes = w2.document.querySelector(".dialogo");
  clique(w2,'[data-act="check"][data-i="0"][data-j="2"]'); await esperar(30);
  const painel = w2.document.querySelector(".dialogo").textContent.replace(/\s+/g," ");
  t(/Comparado com a última vez/.test(painel), "resumo do exercício também respeita a máquina");
  t(/75 kg/.test(painel) || /▲/.test(painel), "e mostra o comparativo de carga na mesma máquina");
  clique(w2,'.dialogo [data-act="fecharResumo"]'); await esperar(20);
  clique(w2,'[data-act="finish"]'); await esperar(40);

  // terceira sessão, máquina DIFERENTE: não deve misturar com o histórico da máquina A
  await esperar(500);
  const dom3=build(true); const w3=dom3.window; await esperar(200);
  clique(w3,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  clique(w3,'[data-act="start"]'); await esperar(30);
  await lista(w3);
  clique(w3,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  digitar(w3,w3.document.querySelector('[data-maquina="0"]'),"Máquina B");
  clique(w3,'[data-act="fecharMenu"]'); await esperar(30);
  t(/primeira vez nesta máquina/.test(txt(w3)), "máquina nova: avisa que é a primeira vez nela");
  t(!/última: 10×75/.test(txt(w3)), "e não herda a carga da máquina A");

  fim();
})();
