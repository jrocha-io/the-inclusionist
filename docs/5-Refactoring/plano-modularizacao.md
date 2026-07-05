# Plano — Modularização de `game.js` guiada por boas práticas de sênior

Pedido do José em 2026-07-03, após estabilização. Base: arXiv:2409.15152v1 — *Predicting Expert
Evaluations in Software Code Reviews* (Denisov-Blanch et al., Stanford, 2024). Objetivo: **portar para JS as
características que os sêniores Java associam a bom código** e, ao aplicá-las, **modularizar** o `game.js`
(3838 linhas, arquivo único) — **sem bundler** (ES Modules nativos; mantém o offline/PWA e o "sem build").

> Regra-mãe do paper para nós: **maximizar coesão, minimizar acoplamento e complexidade.** Todo o resto
> (padrões, IoC, camada de persistência, adapters de API) é meio para chegar nesses três.

---

## 1. Do paper → prática em JS neste projeto

| Dimensão (Tab. 1–4) | Java | Como aplicamos aqui |
|---|---|---|
| **Coesão alta** | classe de responsabilidade única | **1 módulo ES = 1 responsabilidade** (física, quiz, áudio, render, input, UI…) |
| **Acoplamento baixo** | interfaces + DI | fim dos globais lidos/escritos de todo lado → **um módulo de estado** + imports explícitos |
| **Complexidade baixa** | métodos curtos | quebrar `update`/`draw`/`pollPads`/`openQuiz`/`keydown`; *guard clauses* |
| **Classes/Interfaces/Métodos** | OOP | módulos + **JSDoc `@typedef`** como contrato; **composição > herança** |
| **Injeção de Dependência (IoC)** | Spring | passar deps (quiz recebe `say()`; áudio recebe `AudioContext`) em vez de alcançar globais |
| **Padrões de projeto** | design patterns | **state machine** (`phase`), **registry** (`ACTIVITIES`), **factory** (quiz), **adapter** (APIs) |
| **Camadas de persistência** | DAO/repository | consolidar as ~19 chaves de `localStorage` num só `storage.js` (chaves+defaults num lugar) |
| **APIs consumidas** | wrappers | **adapters**: `speech`, `audio`, `gamepad`, `libras`, `dom` — o resto do código não toca a plataforma |
| Estruturas de dados / Dependências | — | já ok (Set/Map onde couber; Pixi/VLibras/Piper versionados na borda) |

**Não porta:** herança de classe à moda Java (JS prefere composição) e o modelo de ML/métricas do paper
(é a ferramenta *deles*, não uma prática de código).

---

## 2. Estado atual (mapa factual do `game.js`)

- **3838 linhas** em 1 arquivo, carregado por `<script src="game.js">`.
- **8 mega-variáveis** tocam quase tudo: `phase`, `players[]`, `coins[]`, `numPlayers`, `MODE`,
  `quizLevel`, `vizMode`/`CENARIO`, `wheelchair`. → maior atrito da modularização.
- **APIs de plataforma cruas** espalhadas: `speechSynthesis`, `AudioContext`, `localStorage` (~19 chaves),
  `getGamepads`, `PIXI`, `document.querySelector` (~200×), VLibras (`window.plugin`), `WebGazer`.
- **Funções-monstro:** `update(dt)` (~130 L), `draw()` (~150 L), `pollPads()` (~grande), `openQuiz()`
  (~100 L), listener `keydown` (~70 L), render direto de alto contraste (~150 L).
- **Export único** `window.__incl` com 25+ getters/setters (é a API de debug/teste — **preservar intacta**).

---

## 3. Alvo de arquitetura (ES Modules nativos, sem bundler)

`index.html` passa a `<script type="module" src="main.js">`. `main.js` orquestra; cada pasta é uma
responsabilidade. **`window.__incl` continua existindo** (montado em `main.js` a partir dos módulos) para
não quebrar testes/preview.

```
v4.0.0/
├─ index.html            # <script type="module" src="main.js">  (+ import map p/ pixi)
├─ main.js               # composição raiz: cria adapters, injeta deps, monta loop e __incl
├─ core/
│  ├─ constants.js       # TUNE, TILE, TILE_TYPES, EASY, LOGICAL_W/H  (puro, zero deps)
│  ├─ state.js           # players, phase, coins, numPlayers, MODE, quizLevel… + eventos
│  ├─ world.js           # CLARITY_MAP, buildWorld, tileAt, solidAt, surfTop, rampSurfaceY (puro)
│  └─ physics.js         # makePlayer, resolveX/Y, update de movimento (recebe state+world)
├─ render/
│  ├─ pixi-app.js        # adapter PIXI: app, camera, containers, ticker
│  ├─ viewport.js        # drawViewport (1 tela); draw() vira orquestrador de N viewports
│  ├─ direct-viz.js      # alto contraste / daltonismo (CVD/filtros)
│  └─ parallax.js        # updateParallax, cenários, temas
├─ gameplay/
│  ├─ quiz.js            # factory de quiz (somasub/silabas/frações) + render/move/confirm/erase
│  ├─ coleta.js          # takeCoin/takePu, vitória, respawn
│  ├─ powerups.js        # powers, setupExtras, elevadores/rampas (cadeirante)
│  └─ vida.js            # spawnCreature/car, stepLife
├─ a11y/
│  ├─ viz-modes.js       # setPlayerViz, applyViz, VIZ_MODES
│  ├─ adaptive.js        # oneButton, wheelchair, modoCego, movimento reduzido
│  └─ narracao.js        # gameSay + narrate (usa adapter speech)
├─ input/
│  ├─ keyboard.js        # keydown/keyup, KB_SCHEMES, remap
│  ├─ gamepad.js         # pollPads, padWiz  (quebrar em poll/map/apply)
│  └─ touch.js           # joystick virtual, D-pad, remap
├─ ui/
│  ├─ menus.js           # buildTitleMenus, navegação, ACTIVITIES (registry)
│  └─ pause.js           # menu de pausa, diálogos de a11y
└─ platform/             # ADAPTERS de API externa (a "camada" do paper)
   ├─ storage.js         # ÚNICO acesso a localStorage: chaves+defaults+validação
   ├─ speech.js          # Web Speech / Piper TTS (ptbrVoice, fila)
   ├─ audio.js           # AudioContext (osc/gain/filtro/pan), SFX, ambiente
   ├─ gamepad-api.js     # navigator.getGamepads
   ├─ libras.js          # VLibras (window.plugin.translate, gloss:end, CSS entra/sai)
   └─ dom.js             # $()/$$ centralizados (fim dos 200 querySelector soltos)
```

**Injeção de dependência (IoC) na prática:** módulos de domínio **não importam** os adapters de plataforma
diretamente; recebem o que precisam por parâmetro. Ex.: `quiz.js` exporta `createQuiz({ say, sfx, storage })`.
`main.js` cria os adapters uma vez e injeta. Isso torna cada módulo testável isolado e derruba o acoplamento.

**Estado compartilhado (a mega-barreira):** `core/state.js` vira a **fonte única**. Exporta o objeto de
estado + funções mutadoras (`setPhase`, `addCoin`…) + um **event bus mínimo** (`on('phase', cb)`) para os
poucos casos que hoje leem o global "de longe". Sem framework: um `Map<string, Set<fn>>` de ~15 linhas.

---

## 4. Estratégia de migração — incremental, **sem mudança de comportamento**

Princípio: o jogo tem que **continuar rodando e passar a verificação a cada commit**. Nada de "big bang".
Cada etapa extrai um pedaço, o arquivo antigo passa a importar dele, verifica-se no Preview, commita.

**Localizar JUNTO (i18n):** cada módulo com UI extraído aqui já sai com seus literais trocados por
`t()`/`data-i18n` e as chaves no `pt.js` — modulariza e localiza na MESMA passada (evita garimpar o monólito e
re-tocar o código). Ver `../1-Discovery/plano-i18n.md` §4.2. A fundação de i18n (`core/i18n.js`) já foi feita.

**Etapa 0 — Andaime (baixo risco).** Trocar `index.html` para `type="module"`; criar `main.js` que só
faz `import './game.js'` (ainda monólito) e adicionar `import map` do Pixi. Bump `sw.js` incluindo os novos
arquivos no SHELL. *Verificar: jogo idêntico.* → 1 commit.

**Etapa 1 — Folhas puras primeiro (zero acoplamento).** Extrair `core/constants.js` e `core/world.js`
(funções puras, sem estado global). `game.js` importa de volta. *Verificar.* → 1 commit por módulo.

**Etapa 2 — Camada de plataforma (adapters).** `platform/storage.js` (consolidar as ~19 chaves),
`platform/dom.js`, `platform/speech.js`, `platform/audio.js`, `platform/gamepad-api.js`,
`platform/libras.js`. São bordas bem definidas; o resto do código passa a chamá-las. *Verificar a cada uma.*
→ ~6 commits.

**Etapa 3 — Estado único.** Criar `core/state.js` e migrar as 8 mega-variáveis para lá **uma de cada vez**
(começar por `phase`, depois `quizLevel`, `MODE`, `wheelchair`… deixar `players[]` por último por ser a mais
espalhada). Event bus onde necessário. *Verificar a cada variável.* → ~8 commits.

**Etapa 4 — Domínios.** Extrair `physics.js`, `render/*`, `gameplay/*`, `a11y/*`, `input/*`, `ui/*`,
recebendo `state` + adapters por injeção. Aqui caem as funções-monstro: `update`→`updateInput/Movement/
Collisions/Logic`; `draw`→orquestra `drawViewport`; `pollPads`→`poll/map/apply`; `openQuiz`→factory.
*Verificar a cada extração.* → vários commits pequenos.

**Etapa 5 — Fechamento.** `game.js` esvazia; `main.js` vira a composição raiz que monta `window.__incl`
a partir dos módulos. Remover `game.js`. Rodar a suíte de verificação completa (todos os modos: MP, cadeirante,
alto contraste, quiz, alfabetização). Atualizar ADR. → 1 commit + ADR.

---

## 5. Riscos e mitigação

- **`window.__incl` (testes/preview) quebrar** → montá-lo em `main.js` com exatamente os mesmos 25+ membros;
  checklist de paridade antes de remover `game.js`.
- **Ordem de carga / ciclos de import** → grafo em camadas (`platform` → `core` → domínios → `ui`/`main`);
  nada de import circular (o event bus quebra os poucos que apareceriam).
- **SW/cache servir mistura de arquivos** → cada etapa **bump do `CACHE`** + todos os módulos no `SHELL`
  (já é network-first; manter). É o velho inimigo "build velho em cache".
- **Regressão sensorial (escala/scanline)** → esses cálculos ficam intactos em `layout()`; migrados só na
  Etapa 4 e verificados com screenshot dedicado (José tem autismo; misalignment = sobrecarga).
- **Refator sem rede** → como não há testes automatizados, a "rede" é a **verificação no Preview a cada
  commit** + os contadores de a11y do `__incl`. Se algum modo divergir, reverte-se o commit isolado.

## 6. O que NÃO muda

- Zero mudança de **comportamento/arte/pedagogia** — é reorganização estrutural pura.
- Sem bundler, sem passo de build, 100% offline/PWA preservado.
- Alfabetização (etapas 6–9) e demais features seguem **depois**, já sobre a base modular (mais fácil).

---

## 7. Decisão pendente (José)

Aprovar o alvo (§3) e a ordem incremental (§4). Sugiro **intercalar**: fazer a modularização em blocos e,
entre blocos, voltar às features de alfabetização — assim a reforma não trava o roadmap pedagógico.

## 8. Testes por extração (decisão do José, 2026-07-04)

Cada extração de módulo (Fase 2.x) **acrescenta os testes do contrato do módulo** em `app/tests/suite.js` — não
se deixa para o fim. Razão: o momento da extração é quando o contrato está mais claro (teste mais barato) e dá
rede de segurança para as extrações grandes e acopladas que vêm depois.

- **Harness:** `app/tests/` roda no NAVEGADOR (ambiente real PIXI/canvas/localStorage) — sem Node/bundler, que
  não temos aqui. `suite.js` exporta `runAll()`; `index.html` mostra verde/vermelho e expõe `window.__testResults`
  (dirigível via preview). **Dev-only:** não entra no SHELL do `sw.js` nem é linkado pelo jogo → mexer só em
  testes **não** exige bump de versão.
- **Verificação de cada extração** = (a) grafo de imports×exports consistente (script Python, imune a cache) +
  (b) boot real no preview (canvasCount≥1 + `__incl`) + (c) testes do módulo verdes. Ver [[feedback-verify-game-actually-boots]].
- **Cobertura inicial (Fase 2.23):** 23 testes dos 9 módulos-folha já extraídos (constants, tiles, world,
  input/state, canvas, props, sprites, sprite-fx, storage). O harness já pegou um palpite errado (AIR=1, não 0).
