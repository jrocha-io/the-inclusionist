# Plano-mestre — roadmap único da reestruturação (v4)

Criado em 2026-07-03. **Este é o plano que seguimos.** Substitui a escolha ad-hoc de "o que construir agora":
integra e ORDENA todos os planos detalhados por **dependência**. Cada fase aponta para seu doc e tem critério
de pronto. Nada entra fora de ordem "porque apareceu" — mudança de ordem é decisão explícita do José, aqui.

## Princípios (valem em TODA fase)
- **Incremental, sem mudar comportamento:** cada passo = 1 commit atômico, verificado no Preview, jogo idêntico.
- **Não fazer trabalho que uma decisão fundacional invalide** (por isso formato/engine antes de features).
- **Localizar junto (i18n):** todo módulo de UI extraído já sai com `t()`/`data-i18n` (ver `plano-i18n.md` §4.2).
- **Pilares:** sem build, offline/PWA, enxuto, a11y-first, GPL-clean. Commits pt-BR + trailer; bump versão + SW.

## Estado atual (feito)
- **Reorg → `app/`** (raiz publicável) + config Cloudflare — Fase A ✅ (`plano-reorganizacao-deploy.md`).
- **Modularização:** `core/constants.js` ✅, `core/world.js` ✅ (`plano-modularizacao.md`).
- **i18n:** fundação `core/i18n.js` ✅ + lotes título/pausa ✅ (`plano-i18n.md`).
- **TTS geral desligado por padrão** (TEA-safe) ✅.
- **Planos escritos e ratificados:** editor de mapa (`plano-editor-mapa.md`), engine (`plano-engine.md`), compat
  Tiled/Aseprite (`plano-tiled-aseprite.md`), arte procedural (`plano-arte-procedural.md`).

---

## FASE 0 — Publicar (ação do José, independente, quando quiser)
Push GitHub público + conectar Cloudflare Pages (output `app`). Destrava deploy contínuo p/ iterar no ar.
- **Doc:** `plano-reorganizacao-deploy.md` §A4. **Gate de licença** antes (já passou p/ código; conferir arte).
- **Pronto quando:** `*.pages.dev` no ar e todo push publica sozinho.

## FASE 1 — Subsistema Nível: formato de mapa em glifo + editor
Baixo risco (o `world.js` já está isolado); fecha o formato de dados do nível e entrega um editor cedo.
1. **`core/tiles.js`** (legend glifo) + **`parseLevel`** no `world.js` + teste ida-e-volta **bit-a-bit** vs
   `CLARITY_MAP`. (`plano-editor-mapa.md` §2–4)
2. **Boot assíncrono** explícito + migrar `CLARITY_MAP` → `assets/levels/ludico.map.txt`. Verificar mundo
   idêntico. (`plano-engine.md` §4)
3. **Editor de mapa** `tools/map-editor.html` — pintar glifos, validar (spawn/portão/regiões), preview.
   (`plano-editor-mapa.md` §5)
- **Pronto quando:** o jogo carrega o `.map.txt`, o mundo é idêntico, e dá para editar/validar um mapa no editor.

## FASE 2 — Espinha da engine (modularização crítica)
O grosso: transformar o monólito nos subsistemas da engine (`plano-engine.md` §3), cada extração verificada.
1. **`platform/storage.js`** — consolidar ~19 chaves de `localStorage` (baixo risco, organiza persistência).
2. **`core/state.js`** — a mega-barreira: migrar as 8 mega-variáveis (`phase`, `players`, `coins`, `numPlayers`,
   `MODE`, `quizLevel`, `vizMode`/`CENARIO`, `wheelchair`) **uma a uma**, com event bus mínimo.
3. **`core/loop.js`** — formalizar o loop (passo fixo) sobre o boot async.
4. **Extrair** `core/physics.js`, `input/{keyboard,gamepad,touch}.js`, `render/{pixi-app,viewport,parallax,
   direct-viz}.js`, `platform/{audio,speech}.js`, `entities/*.js` — **cada UI localizada (i18n) na mesma passada**.
5. **`main.js`** vira a raiz de composição (injeta adapters, monta `window.__incl`); `game.js` esvazia.
- **Pronto quando:** `game.js` dissolvido em subsistemas de fronteiras limpas; jogo idêntico; `__incl` preservado.

## FASE 3 — Subsistema Arte (procedural semântica)
Realiza o pilar "arte = dados". (`plano-arte-procedural.md`)
1. **`art/semantic.js` + `art/palettes.js` + `art/recolor.js`** — recolorir o **menino** de uma imagem semântica
   (generaliza `indexedToCanvas`). (§9.1)
2. **Alto-contraste vira paleta** (migra `silhouetteCanvasIdx`) — a11y no mesmo motor. (§9.2)
3. **Migrar personagens e tiles** do jogo para o sistema semântico; PNGs viram só fonte de autoria. (§9.6)
- **Pronto quando:** um personagem recolorível (pele/roupa/cabelo) com sombreamento correto + alto-contraste
  pelo novo motor, sem regressão visual.

## FASE 4 — Editor de arte + importadores
O editor de autoria da arte semântica, com import dos formatos consagrados. (`plano-arte-procedural.md` §7, §9)
1. **Editor** `tools/art-editor.html` — importar **png/jpg** → anotar cor→(região, luminosidade) → preview
   (trocar paletas) → salvar imagem semântica.
2. **Import Aseprite/Libresprite** (frames + `frameTags` + paleta indexada). (`plano-tiled-aseprite.md` §B)
3. **Import Tiled/LDtk** (tileset → materiais de tile; une com o mapa-glifo). (`plano-tiled-aseprite.md` §A)
- **Pronto quando:** dá para importar arte externa, anotar semântica e usá-la no jogo, tudo no fluxo no-build.

## FASE 5 — i18n: completar en/es
Sobre a base já localizada por módulo (Fases 1–4). (`plano-i18n.md` §4.3–4.4)
1. **Voz por locale** (`localeVoice()`), **seletor 🌐**, default por navegador + persistência.
2. **en + es** completos (UI + Matemática + Lúdico). Alfabetização segue pt (currículo por língua, depois).
- **Pronto quando:** trocar idioma muda toda a UI + Matemática/Lúdico + voz, offline, sem recarregar.

## FASE 6 — Features pedagógicas + auditoria (sobre a base já modular)
Retomar o conteúdo, agora sobre a engine limpa. (`plano-alfabetizacao.md` §6–9 + roadmap L7–L9)
1. **Alfabetização:** Grafema e fonema (eSpeak fonema), Malha de Braille, Escrevendo palavras, VLibras (surdo).
2. **L7** webcam (MediaPipe rosto/olhos) + comando de voz. **L8** refinos (cadeirante, pose vitória, chiptunes).
3. **L9** auditoria final WCAG 2.2 AAA / GAG.
- **Pronto quando:** os 6 jogos de letramento completos + auditoria de acessibilidade passada.

---

## Ordem e por quê (dependências)
`0 (deploy, à parte)` → `1 (formato de nível: destrava editor e materiais de tile)` → `2 (engine: destrava
render/física/input/arte)` → `3 (arte: depende do render/estado da engine)` → `4 (editores: consomem os
subsistemas prontos — validam as fronteiras)` → `5 (i18n finaliza o que foi localizado por módulo)` →
`6 (features sobre a base limpa)`.

**Ponto de flexibilidade (decisão do José):** as **features da Fase 6** poderiam ser adiantadas/intercaladas se
quiser valor visível antes de terminar toda a estrutura — o custo é mexer em código que ainda será modularizado.
Recomendo manter estrutura-primeiro (Fases 1–4) e só então Fase 6, como você já havia decidido; mas dá para
puxar itens da Fase 6 para intervalos, se preferir. **Fora isso, seguimos esta ordem.**

## Relação com docs antigos
Este plano-mestre é a espinha atual e **atualiza** o enquadramento do `ROADMAP.md`/`PLANO-EXECUCAO.md` (série
L0–L9) para o novo escopo (engine + arte + editores + i18n). Os planos detalhados por fase seguem valendo.

## Backlog de polimento (a fazer QUANDO a camada de render for modularizada)
Itens de acabamento visual que dependem de tocar funções de render ainda no `game.js` — adiá-los evita retrabalho
(consertar agora e re-extrair depois). Fazer junto da extração da respectiva função (Fase 2 → subsistema render).

- **Movimento das nuvens duro + sumiço na metade da borda** (reportado pelo José 2026-07-04). Duas falhas nas
  nuvens de TELA (não as do mundo em `skyLayer`, que já embrulham a `±50px`): (a) **movimento não-suave** — a
  cada frame a nuvem "some e reaparece 1px à frente"; a posição é redesenhada arredondada a pixel inteiro e a
  velocidade é <1px/frame (`sp` 0.05–0.11), então ela trava e pula 1px a cada ~10–20 frames. Guardar posição
  sub-pixel (float) e/ou acumular o resíduo; se manter snap pixel-art, suavizar a cadência. (b) **some quando
  metade chega na borda** em vez de continuar até sair inteira — o wrap reseta pelo ponto de referência
  (borda/centro) cruzar a margem da tela, não pela nuvem inteira (x+largura) sair. Corrigir o teste de wrap para
  `x > telaW` (reentra por `-largura`) e `x < -largura`. Locais: `drawTitleScene` (abertura, ~game.js:768) e o
  decor de tela `if(d.includes('nuvens'))` (amanhecer/campo, ~game.js:1449–1450). Ver [[project-inclusionist]].

### Dívida técnica menor (auditoria de smells 2026-07-04)
- ~~**`platform/audio.js`: efeito colateral no import** (`audioCat = loadAudioCat()`)~~ — **PAGA (Fase 2.25,
  v4.164.23).** `audioCat` agora nasce `null`; o import é PURO; `initAudioMixer()` (I/O explícito, idempotente) é
  chamado no boot do game.js. Testado no projeto `node` (import puro: audioCat null até init; 9 categorias após;
  invariante **TTS-off por padrão** TEA-safe agora coberto) + harness. Todos os leitores de `audioCat` rodam após o boot.
