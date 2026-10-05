const {build,esperar,clique,digitar,txt,lista,mem,t,fim} = require("./harness.js");
(async () => {
  console.log("== rodada 3: interface ==");
  const agora=Date.now();
  mem.set("treino:v1",JSON.stringify({custom:[],cardio:[],active:null,meta:{},
    routines:[{id:"rA",name:"Push",items:[{exId:"supino_reto_com_barra",sets:3,reps:"8-12",rest:90,padraoTipos:{A:1,P:1}}]}],
    // de propósito fora de ordem, como poderia vir de um backup
    sessions:[{id:"novo",routineId:"rA",name:"Push",start:agora-86400000,end:agora-86000000,entries:[{exId:"supino_reto_com_barra",sets:[{w:63,r:10,done:true},{w:65,r:9,done:true},{w:68,r:8,done:true}]}]},
              {id:"velho",routineId:"rA",name:"Push",start:agora-9*86400000,end:agora-9*86000000,entries:[{exId:"supino_reto_com_barra",sets:[{w:50,r:10,done:true}]}]}]}));
  const dom=build(true); const w=dom.window; await esperar(200);

  clique(w,'[data-act="start"]'); await esperar(35);
  const hist=[...w.document.querySelectorAll('.hist')].map(e=>e.textContent);
  const rot=[...w.document.querySelectorAll('[data-act="tipoSerie"]')].map(e=>e.textContent.trim());
  t(rot.join(",")==="A,P,1,2,3","ordem das linhas: A, P, depois válidas 1-3 (viu "+rot.join(",")+")");
  t(hist[0]==="—" && hist[1]==="—","aquecimento e preparatória não mostram referência de outra série");
  t(hist[2]==="10×63" && hist[3]==="9×65" && hist[4]==="8×68","'última' alinhada às válidas certas (viu "+hist.join(" | ")+")");
  const r0=w.document.querySelectorAll('[data-f="r"]')[0], w0=w.document.querySelectorAll('[data-f="w"]')[0];
  t(r0.placeholder==="—" && w0.placeholder==="—","aquecimento não sugere a faixa das válidas nem 0 kg");
  t(w.document.querySelectorAll('[data-f="w"]')[2].placeholder==="63","válida 1 sugere 63");

  clique(w,'[data-act="voltarTreino"]'); await esperar(30);
  t(w.document.body.classList.contains("com-barra"),"com treino em andamento, a tela reserva espaço para a barra");
  t(/&nbsp;[▲▼]|\u00a0[▲▼]/.test(w.document.querySelector('[data-act="abrirRotina"] p').innerHTML),"a seta fica presa à última palavra");

  clique(w,'[data-act="nav"][data-v="historico"]'); await esperar(30);
  const datas=[...w.document.querySelectorAll('[data-act="openSession"] p')].map(e=>e.textContent);
  t(/Ontem/.test(datas[0]),"histórico mostra o mais recente primeiro, mesmo com dados fora de ordem (viu: "+datas[0]+")");

  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
  clique(w,'[data-act="abrirCal"]'); await esperar(30);
  const titulo=[...w.document.querySelectorAll('#view h2')].map(e=>e.textContent)[0]||"";
  t(/^[A-ZÀ-Ú][a-zà-ú]+ de \d{4}$/.test(titulo),"título do mês com 'de' minúsculo (viu: "+titulo+")");

  clique(w,'[data-act="voltarConfig"]'); await esperar(25);
  clique(w,'[data-act="retomar"]'); await esperar(30);
  t(!w.document.body.classList.contains("com-barra"),"dentro do treino, sem espaço extra");
  fim();
})();
