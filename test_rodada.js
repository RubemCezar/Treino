const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== achados do gauntlet ==");
  let dom=build(); let w=dom.window; await esperar(150);
  clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
  const fazer=async(maq,kg,validas)=>{
    clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(20);
    clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
    if(maq!==null){ clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
      digitar(w,w.document.querySelector('[data-maquina="0"]'),maq);
      clique(w,'[data-act="fecharMenu"]'); await esperar(25); }
    for(let j=0;j<validas;j++){
      digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[j],"10");
      digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[j],String(kg));
      clique(w,`[data-act="check"][data-i="0"][data-j="${j}"]`); await esperar(20);
      if(w.document.querySelector(".dialogo")){ clique(w,'[data-act="fecharResumo"]'); await esperar(15); }
    }
    clique(w,'[data-act="finish"]'); await esperar(40);
  };

  // dia com série a menos não encolhe o planejado
  await fazer(null,50,2);
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(20);
  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  t(w.document.querySelectorAll('[data-e="0"][data-f="r"]').length===3,"fazer 2 de 3 séries não reduz o planejado para 2");
  clique(w,'[data-act="cancelWorkout"]'); await esperar(20); clique(w,'[data-act="dlgSim"]'); await esperar(30);

  // máquina lembrada e sugestão acompanha a máquina
  await fazer("Technogym",60,3);
  await fazer("Matrix",30,3);
  clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(20);
  clique(w,'[data-act="start"]'); await esperar(30); await lista(w);
  clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
  t(w.document.querySelector('[data-maquina="0"]').value==="Matrix","sessão nova vem com a última máquina usada");
  t(w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0].placeholder==="30","e a sugestão é a da Matrix (30)");
  digitar(w,w.document.querySelector('[data-maquina="0"]'),"Technogym");
  clique(w,'[data-act="fecharMenu"]'); await esperar(25);
  t(w.document.querySelectorAll('[data-e="0"][data-f="w"]')[0].placeholder==="60","trocar para Technogym atualiza a sugestão para 60 na hora");
  clique(w,'[data-act="cancelWorkout"]'); await esperar(20); clique(w,'[data-act="dlgSim"]'); await esperar(30);

  // histórico e progresso
  clique(w,'[data-act="nav"][data-v="historico"]'); await esperar(25);
  clique(w,'[data-act="openSession"]'); await esperar(25);
  t(/Matrix/.test(txt(w)),"histórico mostra a máquina usada");
  clique(w,'[data-act="nav"][data-v="progresso"]'); await esperar(30);
  t(w.document.querySelectorAll('[data-act="progMaq"]').length===3,"progresso oferece Todas + 2 máquinas");
  const antes=txt(w);
  clique(w,'[data-act="progMaq"][data-v="Technogym"]'); await esperar(30);
  t(txt(w)!==antes,"filtrar por máquina muda o gráfico e os números");
  t(/60 kg/.test(txt(w)) && !/Matrix.*30 kg maior/.test(txt(w)),"com filtro Technogym, maior carga é 60");
  fim();
})();
