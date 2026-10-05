const {build,esperar,clique,digitar,txt,t,fim} = require("./harness.js");
(async () => {
  console.log("== distância do cardio com 2 casas decimais ==");
  const dom=build(); const w=dom.window; await esperar(150);
  clique(w,'[data-act="nav"][data-v="cardio"]'); await esperar(25);
  clique(w,'[data-act="novoCardio"]'); await esperar(25);
  digitar(w,w.document.querySelector("#cBusca"),"corrida na rua"); await esperar(25);
  clique(w,'[data-act="cardioTipo"]'); await esperar(20);
  digitar(w,w.document.querySelector("#cMin"),"30");
  digitar(w,w.document.querySelector("#cKm"),"8,88");
  clique(w,'[data-act="salvarCardio"]'); await esperar(30);
  t(/8,88 km/.test(txt(w)), "duas casas decimais aparecem na lista (viu: "+(txt(w).match(/[\d,]+ km/)||["?"])[0]+")");

  clique(w,'[data-act="novoCardio"]'); await esperar(25);
  digitar(w,w.document.querySelector("#cBusca"),"bicicleta erg"); await esperar(25);
  clique(w,'[data-act="cardioTipo"]'); await esperar(20);
  digitar(w,w.document.querySelector("#cMin"),"20");
  digitar(w,w.document.querySelector("#cKm"),"5.5");
  clique(w,'[data-act="salvarCardio"]'); await esperar(30);
  t(/5,5 km/.test(txt(w)) && !/5,50 km/.test(txt(w)), "uma casa decimal não ganha zero à toa (viu: "+(txt(w).match(/5,5\d* km/)||["?"])[0]+")");

  clique(w,'[data-act="novoCardio"]'); await esperar(25);
  digitar(w,w.document.querySelector("#cBusca"),"caminhada"); await esperar(25);
  clique(w,'[data-act="cardioTipo"]'); await esperar(20);
  digitar(w,w.document.querySelector("#cMin"),"40");
  digitar(w,w.document.querySelector("#cKm"),"3");
  clique(w,'[data-act="salvarCardio"]'); await esperar(30);
  t(/3 km/.test(txt(w)) && !/3,0/.test(txt(w)) && !/3,00/.test(txt(w)), "número inteiro não vira 3,0 (viu: "+(txt(w).match(/\d[,.]?\d* km/)||["?"])[0]+")");

  fim();
})();
