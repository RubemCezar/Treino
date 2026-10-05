const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== pular exercício ==");
  const dom=build(); const w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  clique(w,'[data-act="start"]'); await esperar(30);
  await lista(w);

  clique(w,'[data-act="exMenu"][data-i="1"]'); await esperar(25);
  t(/Pular este exercício/.test(txt(w)),"opção de pular no menu");
  clique(w,'[data-act="pularEx"][data-i="1"]'); await esperar(30);
  t(w.document.querySelector(".sheet")===null,"o menu fecha ao pular");

  const cards = () => [...w.document.querySelectorAll(".ex")];
  t(cards()[1].className.includes("pulado"),"o card ganha a classe visual");
  t(/pulado/.test(cards()[1].textContent),"e o rótulo aparece no card");
  t(!/reps.*kg/.test(cards()[1].textContent.replace(/\s+/g," ")),"fica recolhido, sem mostrar as séries");

  clique(w,'[data-act="modoFoco"]'); await esperar(30);
  clique(w,'[data-act="irPara"][data-i="0"]'); await esperar(25);
  for(let j=0;j<3;j++){
    digitar(w,w.document.querySelectorAll('[data-f="r"]')[j],String(10-j));
    digitar(w,w.document.querySelectorAll('[data-f="w"]')[j],"60");
    clique(w,`[data-act="check"][data-i="0"][data-j="${j}"]`); await esperar(25);
  }
  t(w.document.querySelector(".dialogo")!==null,"o resumo aparece ao terminar o exercício 0");
  clique(w,'.dialogo [data-act="proxExercicio"]'); await esperar(35);
  t(!/2 de 6/.test(txt(w)),"o botão 'próximo' não para no exercício pulado (índice 1)");
  t(/3 de 6/.test(txt(w)),"e pula direto para o índice 2 (viu: "+(txt(w).match(/\d+ de 6/)||["?"])[0]+")");

  clique(w,'[data-act="irPara"][data-i="0"]'); await esperar(25);
  const dots = w.document.querySelectorAll(".dot");
  t(dots[1].className.includes("pulado"),"o traço do pulado tem a classe própria");
  t(!dots[1].className.includes("done"),"e não fica marcado como concluído");

  clique(w,'[data-act="irPara"][data-i="1"]'); await esperar(30);
  digitar(w,w.document.querySelectorAll('[data-f="r"]')[0],"12");
  digitar(w,w.document.querySelectorAll('[data-f="w"]')[0],"15");
  clique(w,'[data-act="check"][data-i="1"][data-j="0"]'); await esperar(30);
  await lista(w);
  t(!cards()[1].className.includes("pulado"),"marcar uma série cancela o pulo automaticamente");

  clique(w,'[data-act="exMenu"][data-i="2"]'); await esperar(25);
  clique(w,'[data-act="pularEx"][data-i="2"]'); await esperar(30);
  await lista(w);
  t(cards()[2].className.includes("pulado"),"pula o exercício 2");
  clique(w,'[data-act="exMenu"][data-i="2"]'); await esperar(25);
  t(/Cancelar pular/.test(txt(w)),"o menu oferece desfazer");
  clique(w,'[data-act="pularEx"][data-i="2"]'); await esperar(30);
  await lista(w);
  t(!cards()[2].className.includes("pulado"),"cancelar pular volta ao normal");

  clique(w,'[data-act="exMenu"][data-i="2"]'); await esperar(25);
  clique(w,'[data-act="pularEx"][data-i="2"]'); await esperar(30);
  clique(w,'[data-act="finish"]'); await esperar(40);
  t(/Treino salvo/.test(txt(w)),"conclui normalmente com um exercício pulado");

  fim();
})();
