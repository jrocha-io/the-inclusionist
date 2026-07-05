# Plano — Arquitetura da engine (sob medida, enxuta)

Pedido do José em 2026-07-03: planejar uma engine para o jogo. Decisão travada: **sob medida para ESTE jogo
agora** (não uma engine genérica dos 35+ jogos — extrai-se o núcleo comum depois, já sabendo o que se repete).
A engine **não é um rewrite**: ela é o **destino formalizado da modularização** (`../5-Refactoring/plano-modularizacao.md`),
alcançada de forma incremental. Pilares herdados: **no-build, offline/PWA, a11y-first, enxuta**.

## 1. Referências estudadas
- **R. Nystrom, "Game Programming Patterns"** (padrões: *Game Loop*, *Update Method*, *Component*, *State*,
  *Service Locator*) — a base conceitual dos subsistemas abaixo.
- **G. Fiedler, "Fix Your Timestep"** — loop de passo fixo (determinístico) + render interpolado.
- **PICO-8 / TIC-80** — prova de que uma engine 2D **minúscula e fechada** (loop + map + sprites + input +
  áudio) basta para jogos ricos. É o espírito "sob medida enxuto".
- **ECS (ex.: bitECS) / Phaser** — o caminho da engine **reutilizável/genérica**; estudado para SABER o que
  NÃO fazer agora (overhead/complexidade antes de validar o 2º jogo), e para onde migrar SE os 35+ vierem.

## 2. Decisão de estilo: sistemas-módulos + entidades simples (NÃO ECS agora)
- **Sob medida** ⇒ **entidades como objetos simples** (player, coin, powerup, creature) com um contrato mínimo
  de `update(dt)`; **subsistemas** (física, render, áudio…) operam sobre o estado. Padrões *Update Method* +
  *Component* leves, **sem** um framework ECS.
- **ECS fica reservado** para a eventual engine reutilizável (payoff só com muitos jogos/entidades). Anotado
  como caminho de migração, não de agora. (Evita o erro que o próprio paper Stanford penaliza: complexidade e
  acoplamento sem necessidade.)

## 3. Subsistemas (formalizam a modularização; alvo das próximas extrações)
| Subsistema | Módulo(s) | Responsabilidade | Estado hoje |
|---|---|---|---|
| **Loop** | `core/loop.js` | passo fixo `update(dt)` + `render()`; hoje é `app.ticker` | a extrair |
| **Estado/Cena** | `core/state.js` | fonte única: `phase` (máquina), players, coins, entidades, event bus | a extrair (era o próximo passo) |
| **Nível/Tilemap** | `core/world.js` + `core/tiles.js` + `assets/levels/*.map.txt` | grid, `tileAt`, colisão de tile, **legend/parser** | `world.js` já isolado; formato → `plano-editor-mapa.md` |
| **Física** | `core/physics.js` | `resolveX/Y`, movimento, água/escada/trampolim | a extrair |
| **Input** | `input/{keyboard,gamepad,touch}.js` | dispositivos → ações normalizadas | a extrair |
| **Render** | `render/{pixi-app,viewport,parallax,direct-viz}.js` | façade PIXI, viewports, modos visuais a11y | a extrair |
| **Áudio** | `platform/{audio,speech}.js` | WebAudio + TTS + narração | a extrair |
| **Entidades** | `entities/*.js` | player/coin/powerup/creature (objetos + `update`) | a extrair |
| **Persistência** | `platform/storage.js` | settings/save (consolidar ~19 chaves) | a extrair |
| **i18n** | `core/i18n.js` | traduções | **FEITO** |
| **Constantes** | `core/constants.js` | tunagem/tipos | **FEITO** |

Fronteiras: **injeção de dependência** (um subsistema recebe o que precisa — física recebe o tilemap; áudio
recebe o `AudioContext`), sem alcançar globais. `main.js` compõe tudo e monta o `window.__incl` (teste).

## 4. Boot e carregamento de assets (a questão que o tilemap levanta)
Hoje o boot é **síncrono** (monta menus na carga). O mapa em `.txt` (fetch) e assets tornam o boot
**assíncrono**. Decisão da engine: **um boot assíncrono explícito** —
`async function boot(){ await loadLevel(); await loadSettings(); start(); }` — com um estado `loading` na
máquina de fase (tela/curtain simples). É correto e destrava dados externos (níveis, futuros assets). O
idioma padrão continua import estático (i18n já resolvido); só os DADOS (nível) passam a ser await no boot.

## 5. Como o editor de mapas se encaixa
O editor (`tools/map-editor.html`) é o **primeiro consumidor externo** dos módulos: importa `core/tiles.js`
(legend + cores) e `core/world.js` (`parseLevel`). Se o editor consegue reusar esses módulos sem arrastar o
jogo inteiro, as **fronteiras da engine estão certas**. Ou seja: o editor valida a modularização na prática.

## 6. Sequência (encaixa na Fase B da modularização, sem rewrite)
1. **Tilemap primeiro** (`plano-editor-mapa.md`): `core/tiles.js` (legend) + `parseLevel` no `world.js` +
   migração p/ `.map.txt` + boot async. Fecha o subsistema Nível e destrava o editor.
2. **Editor** `tools/map-editor.html` (valida as fronteiras).
3. **`core/state.js`** (a mega-barreira) — agora com o alvo claro: é o subsistema Estado/Cena da engine;
   migrar as 8 mega-variáveis uma a uma.
4. **`core/loop.js`** — formaliza o loop (passo fixo).
5. Demais subsistemas (física, input, render, áudio, entidades, storage) — extrações incrementais já com as
   fronteiras da tabela §3.
6. `main.js` como raiz de composição; `game.js` esvazia.

## 7. O que a engine NÃO é (disciplina de escopo)
- **Não** é genérica/reutilizável agora (só se os 35+ jogos materializarem — aí extrai-se o núcleo comum).
- **Não** é ECS, nem adota Phaser/engine pesada (fere o pilar enxuto/offline).
- **Não** é um rewrite: cada subsistema nasce de uma extração verificável do monólito, sem mudar comportamento.

## 8. Decisão pendente (José)
Aprovar (a) o formato de mapa + editor (`plano-editor-mapa.md`) e (b) esta arquitetura de subsistemas como
alvo da Fase B. Com o aval, começo pela **Etapa 1 do tilemap** (`core/tiles.js` + `parseLevel`, sem mudar o
jogo), que é a base do editor e do subsistema Nível.
