# Treino — contexto do projeto

Leia isto antes de mexer no app. Escrito para continuar o trabalho numa conversa nova sem perder decisões.

## O que é

App pessoal de musculação e cardio, em português, num único `index.html` (HTML + CSS + JS puro, sem biblioteca). Publicado no GitHub Pages em `https://rubemcezar.github.io/Treino/` (T maiúsculo) e instalado como app no Android.

Arquivos do repositório: `index.html` (o app), `sw.js` (offline), `manifest.webmanifest`, três ícones, `LEIAME.md`, este arquivo e a pasta `testes/`. Só o `index.html` costuma mudar.

## Como trabalhamos

- **Rubem manda vários feedbacks seguidos.** Implementar e acumular; **só entregar versão nova quando ele pedir** ("pode gerar", "faça a versão", "pode subir").
- Perguntar gosto pessoal **antes** de construir quando houver decisão de produto real. Decisões já tomadas: executar direto, sem reabrir debate.
- "Gauntlet loop" = três rodadas de revisão: bugs → uso real → acabamento, sempre com testes. Ele pede isso com frequência.
- Respostas objetivas, em Markdown, em português.
- Palavras reservadas: **"Concluir"** é só do treino. Usar **"treino"**, nunca "rotina", na interface.

## Modelo de dados

Tudo num objeto `S`, salvo como JSON na chave `treino:v1` (localStorage, com cópia espelho).

- `routines[]` — treinos salvos: `{id, name, items:[{exId, sets, reps, rest, padraoTipos:{A,P}}]}`. A ordem do array é a sequência (a etiqueta "Próximo" segue ela).
- `sessions[]` — treinos feitos, em ordem cronológica: `{id, routineId, name, start, end, entries:[{exId, note, maquina, sets:[{w, r, done, tipo?}]}]}`. Aquecimento e preparatória são salvos com `tipo:"A"`/`"P"` (válidas não têm `tipo`) e servem só para sugerir carga — todo cálculo filtra por `valida()`.
- `cardio[]` — `{id, tipo, min, km, intensidade, nota, t}`.
- `medidas[]` — registros corporais `{id, t, valores:{peso, gordura, cintura, braco | braco_d, braco_e, ...}}`. Quais medidas aparecem e se braço/coxa/panturrilha são medidos dos dois lados fica em `meta.medidasCfg`.
- `active` — treino em andamento (mesma forma de sessão, com `sets[].tipo`, `sug`, `skipped`).
- `custom[]` — exercícios criados pelo usuário, `{id, name, muscle}`.
- `meta` — preferências: `tema`, `modo` (foco/lista), `aba`, `semResumo`, controle de backup.

A função `migrar()` roda em toda abertura e em toda restauração de backup; qualquer formato novo de dado precisa passar por ela.

## Regras de negócio que já custaram bug

- **Tipos de série:** `T` válida, `A` aquecimento, `P` preparatória. Só `T` conta em volume, recordes, índice, séries por grupo, histórico e sugestão. A/P são numeradas por letra; as válidas por 1, 2, 3 ignorando A/P.
- **Sugestão por tipo:** cada linha sugere a partir da última série do **mesmo tipo** (aquecimento do aquecimento, válida da válida), via `recalcularSugestoes()`. Trocar tipo ou máquina recalcula.
- **Memória de tipos** (`padraoTipos`): o treino lembra só quantos **A e P** fazer. A quantidade de **válidas vem do editor** — nunca aprender isso do que foi feito, senão o planejado encolhe.
- **Botão − (menos uma série) é pedido explícito:** tirar uma série **válida** com o − no treino em andamento baixa também `items[].sets` do treino salvo (`baixarPlanoSeries`), com aviso "Próximos treinos: N séries válidas". Só baixa: o **+** vale só para o dia e nunca sobe o plano; tirar linha A/P não mexe; mínimo 1; treino livre e exercício que não está no treino não mudam nada. Não confundir com a regra acima: série **não marcada** continua sem encolher o plano — só o toque no − faz isso.
- **Comparação e sugestão:** mesmo treino primeiro; com **máquina** preenchida, só a mesma máquina. Sem máquina, comportamento antigo.
- **Máquina:** texto livre, lembrada por treino, comparação sem diferenciar maiúscula.
- **Resumo do exercício** só oferece "Concluir treino" quando nada está pendente (exercício pulado não conta como pendente).
- **Índice de força** = Epley (`carga × (1 + reps/30)`), apresentado como número sem unidade, nunca como "1RM".
- **Medidas:** variação sem cor de bom/ruim (subir ou descer depende do objetivo); gordura varia em pontos percentuais ("p.p."). Um lado e dois lados são séries separadas.
- **Ênfase** (Equilibrado / Superior / Inferior) muda a **divisão da semana**, não só exercícios. É escolhida na hora de criar, não salva em Configurações.

## Testes

Pasta `testes/`. Para rodar: `npm install jsdom` e depois `sh testes/rodar.sh`.

- 16 arquivos `test_*.js` (223 verificações) + `fuzz.js` (cliques aleatórios checando erro e integridade dos dados) + `escala.js` (desempenho com ~1,5 ano de histórico) + `telas.py` (screenshots reais via Playwright/Chromium, se disponível).
- Todo teste falha se o app escrever erro no console.
- Armadilhas conhecidas do harness: o app **recria o DOM** a cada `render()`, então nunca guarde referência de elemento entre ações; o `✓` **alterna**, então não marque de novo séries já feitas; `build()` zera o armazenamento, use `build(true)` para simular reabrir o app; o app grava com **350 ms de atraso**, então para ler `mem` force a gravação (`w.dispatchEvent(new w.Event("pagehide"))`) e, com vários cenários no mesmo arquivo, feche a janela (`w.close()`) ao fim de cada um — senão ela grava por cima do cenário seguinte.

## Lições de código

- Um bloco de 46 linhas ficou duplicado numa edição antiga (funções declaradas duas vezes; a segunda vence em silêncio). Checar duplicatas depois de edições grandes.
- Existem **dois** lugares parecidos para cada exercício: o card da sessão (`cardExercicio`) e a folha do menu ⋯ (dentro de `renderFloat`). Campos do menu ⋯ vão na folha.
- O ambiente de execução do Claude pode reiniciar e apagar arquivos de trabalho; o que importa fica no repositório.

## Ideias em aberto

- Cronômetro em segundos para prancha/isometria (hoje só reps).
- Backup em formato de tabela para colar no Notion.
- Exercícios pulados poderiam aparecer marcados no histórico.
