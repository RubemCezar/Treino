const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== acabamento: sugestões de máquina ==");
  let dom=build(); let w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  for(const maq of ["Technogym","technogym ","Matrix"]){
    clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(20);
    clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
    clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
    digitar(w,w.document.querySelector('[data-maquina="0"]'),maq);
    clique(w,'[data-act="fecharMenu"]'); await esperar(25);
    digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[0],"10");
    digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0],"40");
    clique(w,'[data-act="check"][data-i="0"][data-j="0"]'); await esperar(20);
    clique(w,'[data-act="finish"]'); await esperar(40);
  }
  clique(w,'[data-act="nav"][data-v="progresso"]'); await esperar(30);
  t(w.document.querySelectorAll('[data-act="progMaq"]').length===3,"Technogym escrito de dois jeitos conta como uma máquina só");

  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(20);
  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(25);
  const sug=[...w.document.querySelectorAll('[data-act="usarMaquina"]')].map(e=>e.textContent);
  t(sug.length===1 && sug[0].toLowerCase()==="technogym","sugere as outras máquinas já usadas, sem repetir a atual (viu: "+sug.join(", ")+")");
  clique(w,'[data-act="usarMaquina"]'); await esperar(30);
  t(w.document.querySelector('[data-maquina="0"]').value.toLowerCase()==="technogym","um toque preenche o campo");
  clique(w,'[data-act="fecharMenu"]'); await esperar(25);
  t(w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0].placeholder==="40","e a sugestão de carga acompanha a troca");
  fim();
})();
