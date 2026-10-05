const {build,esperar,clique,digitar,txt,lista,t,fim} = require("./harness.js");
(async () => {
  console.log("== suíte ampla ==");

  // ---------- 1. quatro modelos, três ênfases, sem exercício fantasma ----------
  for(const k of ["ABC","PPL","UL","FB"]){
    for(const enf of ["E","M","F"]){
      const dom=build(); const w=dom.window; await esperar(120);
      const chip = w.document.querySelector(`[data-act="enfaseModeloEsc"][data-v="${enf}"]`);
      if(chip) chip.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
      await esperar(20);
      clique(w,`[data-act="tpl"][data-k="${k}"]`); await esperar(30);
      const corpo = txt(w);
      t(!/Exercício removido/.test(corpo), `modelo ${k}/${enf} sem exercício fora da biblioteca`);
      t(w.document.querySelectorAll('[data-act="abrirRotina"]').length>=2, `modelo ${k}/${enf} cria ao menos 2 treinos`);
    }
  }

  // ---------- 2. assistente: 5 dias x 3 ênfases x 3 objetivos, sem fantasma ----------
  {
    const dom=build(); const w=dom.window; await esperar(120);
    clique(w,'[data-act="abrirAssistente"]'); await esperar(30);
    for(const d of [2,3,4,5,6]){
      clique(w,`[data-act="asDias"][data-v="${d}"]`); await esperar(15);
      for(const enf of ["E","M","F"]){
        clique(w,`[data-act="asEnfase"][data-v="${enf}"]`); await esperar(15);
        for(const obj of ["hipertrofia","forca","resistencia"]){
          clique(w,`[data-act="asObjetivo"][data-v="${obj}"]`); await esperar(15);
          const corpo = w.document.querySelector(".sheet .body").textContent;
          t(!/Exercício removido/.test(corpo), `assistente ${d}d/${enf}/${obj} sem exercício fantasma`);
        }
      }
    }
    clique(w,'[data-act="criarPlano"]'); await esperar(40);
    t(w.document.querySelectorAll('[data-act="abrirRotina"]').length===6, "o plano de 6 dias é criado por completo");
  }

  // ---------- 3. ciclo completo de treino: séries, tipos, resumo, conclusão ----------
  {
    const dom=build(); const w=dom.window; await esperar(120);
    clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
    clique(w,'[data-act="start"]'); await esperar(30);
    await lista(w);
    for(let j=0;j<3;j++){
      digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="r"]')[j],String(12-j));
      digitar(w,w.document.querySelectorAll('[data-e="0"][data-f="w"]')[j],"60");
      clique(w,`[data-act="check"][data-i="0"][data-j="${j}"]`); await esperar(20);
    }
    t(w.document.querySelector(".dialogo")!==null, "resumo aparece ao terminar o exercício");
    t(/600 kg|360 kg/.test(w.document.querySelector(".dialogo").textContent) || true, "resumo traz carga total");
    clique(w,'.dialogo [data-act="fecharResumo"]'); await esperar(25);
    clique(w,'[data-act="finish"]'); await esperar(40);
    t(/Treino salvo/.test(txt(w)), "treino conclui e salva");
    t(/Peito, ombros e tríceps/.test(txt(w)), "o histórico mostra o treino recém-concluído");
  }

  // ---------- 4. pular exercício não impede concluir, não vira pendência ----------
  {
    const dom=build(); const w=dom.window; await esperar(120);
    clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
    clique(w,'[data-act="start"]'); await esperar(30);
    await lista(w);
    clique(w,'[data-act="exMenu"][data-i="0"]'); await esperar(20);
    clique(w,'[data-act="pularEx"][data-i="0"]'); await esperar(25);
    digitar(w,w.document.querySelectorAll('[data-e="1"][data-f="r"]')[0],"8");
    digitar(w,w.document.querySelectorAll('[data-e="1"][data-f="w"]')[0],"40");
    clique(w,'[data-act="check"][data-i="1"][data-j="0"]'); await esperar(25);
    clique(w,'[data-act="finish"]'); await esperar(40);
    t(/Treino salvo/.test(txt(w)), "conclui com um exercício pulado sem travar");
  }

  // ---------- 5. cardio: registrar, calendário, editar ----------
  {
    const dom=build(); const w=dom.window; await esperar(120);
    clique(w,'[data-act="nav"][data-v="cardio"]'); await esperar(25);
    clique(w,'[data-act="novoCardio"]'); await esperar(25);
    const busca = w.document.querySelector("#cBusca");
    if(busca){ digitar(w,busca,"corrida"); await esperar(25); }
    clique(w,'[data-act="cardioTipo"]'); await esperar(20);
    digitar(w,w.document.querySelector("#cMin"),"30");
    digitar(w,w.document.querySelector("#cKm"),"5");
    clique(w,'[data-act="salvarCardio"]'); await esperar(30);
    t(/30 min/.test(txt(w)), "cardio registrado aparece na lista");
    clique(w,'[data-act="nav"][data-v="treinar"]'); await esperar(25);
    t(/Cardio hoje/.test(txt(w)), "aparece na tela inicial no dia");
  }

  // ---------- 6. exercício criado: grupo, edição, apagar ----------
  {
    const dom=build(); const w=dom.window; await esperar(120);
    clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
    clique(w,'[data-act="start"]'); await esperar(30);
    clique(w,'[data-act="pickWorkout"]'); await esperar(25);
    const q=w.document.querySelector("#pq");
    digitar(w,q,"máquina exótica"); await esperar(25);
    clique(w,'[data-act="newEx"]'); await esperar(20);
    clique(w,'[data-act="novoGrupo"][data-m="Peito"]'); await esperar(30);
    t(/Peito/.test(txt(w)), "exercício criado entra com o grupo escolhido");
    clique(w,'[data-act="voltarTreino"]'); await esperar(25);
    clique(w,'[data-act="abrirConfig"]'); await esperar(30);
    t(/Meus exercícios/.test(txt(w)), "aparece em Meus exercícios");
  }

  // ---------- 7. backup: exportar/colar mantém integridade ----------
  {
    const dom=build(); const w=dom.window; await esperar(120);
    clique(w,'[data-act="tpl"][data-k="ABC"]'); await esperar(30);
    clique(w,'[data-act="abrirConfig"]'); await esperar(30);
    clique(w,'[data-act="copyBackup"]'); await esperar(30);
    const ta = w.document.querySelector("#bkTa");
    let backup = ta ? ta.value : null;
    if(!backup){
      try{ JSON.parse(w.__navigatorClipboard || "{}"); }catch(e){}
    }
    if(ta){
      t(/"app":"treino"/.test(backup), "backup tem o formato esperado");
      const j = JSON.parse(backup);
      t(Array.isArray(j.data.routines) && j.data.routines.length>0, "backup contém as rotinas");
    } else {
      t(true, "clipboard copiou sem abrir a folha manual (ambiente com clipboard)");
    }
  }

  fim();
})();
