const {build,esperar,clique,txt,mem,t,fim} = require("./harness.js");
/* Visual de nov/2026: ícones na barra, início com um só botão cheio,
   histórico recolhido, barras acima da navegação e fim do treino esquecido aberto. */
(async () => {
  console.log("== visual ==");
  const agora=Date.now(), D=864e5, erros=[];
  const ses = (id,rid,nome,dias) => ({id,routineId:rid,name:nome,start:agora-dias*D-3e6,end:agora-dias*D,
    entries:[{exId:"supino_reto_com_barra",note:"",maquina:"",sets:[{w:60,r:8,done:true},{w:60,r:8,done:true}]},
             {exId:"rosca_direta_com_barra",note:"",maquina:"",sets:[{w:20,r:10,done:true}]}]});
  const dados = {custom:[],cardio:[],medidas:[],meta:{},active:null,
    routines:[{id:"rA",name:"Push",items:[{exId:"supino_reto_com_barra",sets:2,reps:"",rest:90}]},
              {id:"rB",name:"Pull",items:[{exId:"barra_fixa",sets:3,reps:"",rest:90}]},
              {id:"rC",name:"Legs",items:[{exId:"agachamento_livre",sets:3,reps:"",rest:90}]}],
    sessions:[ses("s1","rA","Push",2)]};
  mem.set("treino:v1",JSON.stringify(dados));
  let w=build(true).window;
  w.console.error=(...a)=>erros.push(a.join(" ")); w.addEventListener("error",e=>erros.push(e.message));
  await esperar(200);
  const q=s=>w.document.querySelector(s), qa=s=>[...w.document.querySelectorAll(s)];

  // barra de baixo com ícone e nome
  t(qa("#nav button").length===5 && qa("#nav button svg").length===5, "barra com 5 abas, cada uma com ícone");
  t(qa("#nav svg").every(s=>s.getAttribute("aria-hidden")==="true"), "ícones escondidos do leitor de tela (o nome já diz)");
  t(/Treino/.test(q('#nav [data-v="treinar"]').textContent), "aba mantém o nome");

  // início: só o próximo treino com botão cheio
  const cheios = qa('[data-act="start"].primary').map(b=>b.dataset.id);
  t(cheios.length===1 && cheios[0]==="rB", "só o próximo (Pull) tem botão cheio (viu "+cheios.join(",")+")");
  t(qa('[data-act="start"]').length===3, "os outros treinos continuam com botão Treinar");
  t(!/[▼▲]/.test(q('[data-act="abrirRotina"]').textContent), "seta discreta no lugar do triângulo");

  // histórico recolhido
  clique(w,'[data-act="nav"][data-v="historico"]'); await esperar(30);
  t(!/Rosca direta/.test(txt(w)), "fechado: não lista os exercícios");
  t(/Peito 2/.test(txt(w)) && /3 séries/.test(txt(w)), "fechado: mostra resumo e grupos");
  t(!!q('[data-act="repeat"]') && !q('[data-act="delSession"]'), "fechado: Repetir à mão, Apagar escondido");
  clique(w,'[data-act="openSession"]'); await esperar(30);
  t(/Rosca direta/.test(txt(w)), "aberto: lista os exercícios");
  t(!!q('[data-act="delSession"]'), "aberto: Apagar aparece");
  clique(w,'[data-act="openSession"]'); await esperar(30);
  t(!/Rosca direta/.test(txt(w)), "toque de novo recolhe");

  // um treino só: o botão dele é cheio
  w.dispatchEvent(new w.Event("pagehide")); await esperar(15); w.close();
  mem.set("treino:v1",JSON.stringify(Object.assign({},dados,{routines:[dados.routines[0]],sessions:[]})));
  w=build(true).window; await esperar(200);
  t(w.document.querySelectorAll('[data-act="start"].primary').length===1, "com um treino só, o botão dele é cheio");

  // barra "em andamento" sobe quando o descanso aparece (classe, não estilo fixo em px)
  clique(w,'[data-act="start"]'); await esperar(40);
  w.document.querySelector('[data-f="r"]').value="8"; w.document.querySelector('[data-f="r"]').dispatchEvent(new w.Event("input",{bubbles:true}));
  clique(w,'[data-act="check"]'); await esperar(30);
  if(w.document.querySelector(".dialogo")){ clique(w,'[data-act="fecharResumo"]'); await esperar(15); }
  clique(w,'[data-act="voltarTreino"]'); await esperar(30);
  const barra=w.document.querySelector(".emtreino");
  t(barra && barra.classList.contains("alto") && !barra.getAttribute("style"), "com descanso, barra usa a classe .alto");
  w.dispatchEvent(new w.Event("pagehide")); await esperar(15); w.close();

  // treino em andamento: o card dele vira "Continuar" e nenhum outro fica cheio
  mem.set("treino:v1",JSON.stringify(dados));
  w=build(true).window; await esperar(200);
  clique(w,'[data-act="start"][data-id="rC"]'); await esperar(40);
  clique(w,'[data-act="voltarTreino"]'); await esperar(30);
  const cont=w.document.querySelectorAll('[data-act="retomar"].primary');
  t(cont.length===1 && /Continuar/.test(cont[0].textContent), "card do treino em andamento mostra Continuar");
  t(!w.document.querySelector('[data-act="start"].primary'), "nenhum Treinar cheio enquanto há treino em andamento");
  t(!w.document.querySelector('[data-act="start"][data-id="rC"]'), "o treino em andamento não oferece Treinar de novo");
  w.document.querySelector('.card [data-act="retomar"]').click(); await esperar(30);
  t(!!w.document.querySelector('[data-act="finish"]'), "Continuar volta para o treino");
  w.dispatchEvent(new w.Event("pagehide")); await esperar(15); w.close();

  // treino esquecido aberto: o fim vira a hora da última série marcada
  const feito = async (inicioMin, ultimaMin) => {
    const d = Object.assign({},dados,{sessions:[]}), n=Date.now();
    d.active = {routineId:"rA",name:"Push",start:n-inicioMin*6e4,entries:[{exId:"supino_reto_com_barra",note:"",maquina:"",
      sets:[{w:"60",r:"8",done:true,ts:n-ultimaMin*6e4-5*6e4},{w:"60",r:"8",done:true,ts:n-ultimaMin*6e4}]}]};
    mem.set("treino:v1",JSON.stringify(d)); const x=build(true).window; await esperar(200);
    clique(x,'[data-act="retomar"]'); await esperar(30);
    clique(x,'[data-act="finish"]'); await esperar(40);
    x.dispatchEvent(new x.Event("pagehide")); await esperar(15);
    const se = JSON.parse(mem.get("treino:v1")).sessions[0]; x.close(); return se; };
  let se = await feito(600, 300);   // aberto há 10 h, última série há 5 h
  t(Math.abs((se.end-se.start) - 300*6e4) < 5e3, "esquecido: duração = início até a última série (viu "+Math.round((se.end-se.start)/6e4)+" min)");
  se = await feito(60, 10);          // última série há 10 min
  t(Math.abs((se.end-se.start) - 60*6e4) < 5e3, "recente: o fim continua sendo agora (viu "+Math.round((se.end-se.start)/6e4)+" min)");
  se = await feito(90, 31);
  t(Math.abs((se.end-se.start) - 59*6e4) < 5e3, "passou de 30 min: usa a última série (viu "+Math.round((se.end-se.start)/6e4)+" min)");
  t(se.entries[0].sets.every(x=>!("ts" in x)), "a hora de marcação não vai para o treino salvo");

  t(erros.length===0, "nenhum erro no console ("+(erros[0]||"")+")");
  fim();
})();
