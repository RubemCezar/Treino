const {build,esperar,clique,digitar,txt,mem,t,fim} = require("./harness.js");
(async()=>{
  console.log("== aba Medidas ==");
  const dom=build(); const w=dom.window; await esperar(150);
  const nav=[...w.document.querySelectorAll('nav button')].map(b=>b.textContent);
  t(nav.length===5 && nav.includes("Medidas"),"barra com 5 abas incluindo Medidas ("+nav.join("/")+")");
  clique(w,'[data-act="nav"][data-v="medidas"]'); await esperar(30);
  t(/Nenhuma medida registrada/.test(txt(w)),"estado vazio explica a aba");

  const registrar=async(valores,data)=>{
    clique(w,'[data-act="novaMedida"]'); await esperar(25);
    if(data){ digitar(w,w.document.querySelector("#mData"),data); }
    for(const [k,v] of Object.entries(valores)) digitar(w,w.document.querySelector(`[data-medv="${k}"]`),v);
    clique(w,'[data-act="salvarMedida"]'); await esperar(30);
  };
  // validações
  clique(w,'[data-act="novaMedida"]'); await esperar(25);
  clique(w,'[data-act="salvarMedida"]'); await esperar(25);
  t(/Preencha pelo menos uma medida/.test(txt(w)),"não salva registro vazio");
  digitar(w,w.document.querySelector('[data-medv="peso"]'),"8200");
  clique(w,'[data-act="salvarMedida"]'); await esperar(25);
  t(/Confira: Peso/.test(txt(w)),"recusa valor absurdo (8200 kg)");
  clique(w,'.sheet button[data-act="fecharMedida"]'); await esperar(20);

  const d=n=>{ const x=new Date(Date.now()-n*864e5); return x.toISOString().slice(0,10); };
  await registrar({peso:"84,2",cintura:"92",gordura:"19,5"}, d(40));
  await registrar({peso:"83,0"}, d(3));
  await registrar({peso:"82,6",cintura:"90,1",gordura:"18"}, d(1));
  t(/82,6/.test(txt(w)),"mostra o peso mais recente");
  t(/média 7 dias 82,8/.test(txt(w)),"média de 7 dias do peso (83,0 e 82,6)");
  t(/▼ 1,6 kg/.test(txt(w)),"variação do peso desde o início");
  t(/▼ 1,5 p\.p\./.test(txt(w)),"gordura em pontos percentuais");
  t(!/Peito/.test(w.document.querySelector("#view").textContent.split("Registros")[0]),"medida nunca registrada não vira cartão vazio");

  clique(w,'[data-act="abrirMedida"][data-k="peso"]'); await esperar(25);
  t(w.document.querySelector("#view svg polyline")!==null,"tocar no cartão abre o gráfico");

  // editar e apagar
  clique(w,'[data-act="editMedida"]'); await esperar(25);
  t(w.document.querySelector('[data-medv="peso"]').value==="82,6","edição abre com o valor salvo");
  digitar(w,w.document.querySelector('[data-medv="peso"]'),"82,4");
  clique(w,'[data-act="salvarMedida"]'); await esperar(30);
  t(/82,4/.test(txt(w)) && /Medidas atualizadas/.test(txt(w)),"edição salva");
  const nReg=w.document.querySelectorAll('[data-act="editMedida"]').length;
  clique(w,'[data-act="editMedida"]'); await esperar(25);
  clique(w,'[data-act="apagarMedida"]'); await esperar(25);
  clique(w,'[data-act="dlgSim"]'); await esperar(30);
  t(w.document.querySelectorAll('[data-act="editMedida"]').length===nReg-1,"apagar remove o registro com confirmação");

  // escolher o que medir e os dois lados
  clique(w,'[data-act="abrirCfgMed"]'); await esperar(25);
  clique(w,'[data-act="medToggle"][data-k="peito"]'); await esperar(20);
  clique(w,'[data-act="medLados"][data-v="1"]'); await esperar(20);
  clique(w,'.sheet button[data-act="fecharCfgMed"]'); await esperar(25);
  clique(w,'[data-act="novaMedida"]'); await esperar(25);
  t(w.document.querySelector('[data-medv="peito"]')===null,"medida desativada some do formulário");
  t(w.document.querySelector('[data-medv="braco_d"]')!==null && w.document.querySelector('[data-medv="braco_e"]')!==null,"com dois lados, braço vira direito e esquerdo");
  t(/Coxa direita/.test(txt(w)) && /Braço direito/.test(txt(w)),"com concordância certa (direito/direita)");
  digitar(w,w.document.querySelector('[data-medv="braco_d"]'),"38,5");
  digitar(w,w.document.querySelector('[data-medv="braco_e"]'),"37,9");
  clique(w,'[data-act="salvarMedida"]'); await esperar(30);
  t(/Braço direito/.test(txt(w)) && /Braço esquerdo/.test(txt(w)),"os dois lados viram cartões separados");

  // persistência e backup
  await esperar(450);
  const dados=JSON.parse(mem.get("treino:v1"));
  t(Array.isArray(dados.medidas) && dados.medidas.length===3,"medidas gravadas no armazenamento");
  t(dados.meta.medidasCfg && dados.meta.medidasCfg.lados===true,"preferências de medidas gravadas");
  const dom2=build(true); const w2=dom2.window; await esperar(200);
  t(/Medidas/.test(txt(w2)),"reabrir o app volta para a aba Medidas");
  t(/Braço esquerdo/.test(txt(w2)),"dados sobrevivem a fechar e abrir");
  fim();
})();
