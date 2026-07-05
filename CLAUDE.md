# CLAUDE.md — EdSP / "The Inclusionist"

Contexto de projeto carregado automaticamente pelo Claude Code. **Enxuto de propósito**: aqui ficam as regras
de entrada e os ponteiros; a verdade detalhada vive no **código tipado** (`app/js/**`) e em `docs/**`.

- **Idioma (projeto open-source):** **artefatos em inglês** — docs, comentários de código, strings de UI e **mensagens
  de commit**. **Exceção pt-BR:** conteúdo de domínio intrinsecamente brasileiro (objetivos BNCC, pedagogia de
  alfabetização, *features* Gherkin das atividades, que são lidas por educadores). **A conversa com o Dev é em pt-BR.**
  Este arquivo (manual operacional da IA) segue em pt-BR de propósito.

## 0. Regra de ouro (operacional — o que mais me guia)

- **Eu faço os commits** (atômicos, pt-BR, na `main`, com trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).
  **O Dev roda** o push/deploy **e TODO comando Node** (`npm run build` / `npx vitest run` / `npx tsc --noEmit`) —
  eu **não tenho Node** no sandbox.
- **Loop de trabalho:** eu extraio/edito → o Dev valida (build + vitest + tsc) → **eu confiro o boot no preview**
  (canvas ≥ 1 + `window.__incl`; nunca só screenshot do título).
- **Sinalize antes de executar** incoerências/erros. **Anuncie decisões não triviais:** `Decisão: X porque Y. Para
  sobrepor, diga Z.` **"ok/tudo ok" ≠ carta branca** → proponho e confirmo a próxima escolha, não sigo sozinho.
- **Ensinar-e-deixar-ele-rodar:** para mudanças de estado (git push, npm, sistema), oriento e preparo os arquivos;
  **quem roda é o Dev**, no PowerShell.

## 1. Visão

**EdSP** = engine de **jogos educativos** para **gamificar toda a educação básica brasileira** (infantil ·
fundamental · médio) + uma **coleção** de jogos. **MVP atual:** *The Inclusionist* — plataforma 2D pixel-art
**acessível** (PixiJS), o **1º** de 35+ jogos. Reimplementação clean-room do engine Clarity.

- **🔴 PILARES INEGOCIÁVEIS** (constituição — leia ANTES de agir): `docs/PILARES-INEGOCIAVEIS.md`. 10 pilares:
  hardware de escola pública BR (Positivo/Chromebook) · a11y (WCAG 2.2 + GAG; Libras em motor zdog à parte) · i18n ·
  conformidade LGPD/COPPA/China/Nórdicos (regra mais rígida vence) · pixel 320×180 (Libras 420×180) · telemetria
  1EdTech+xAPI com privacidade infantil rígida · multiplayer em telas separadas (sem split-screen) · offline (PWA) ·
  LAN + telemetria store-and-forward · **GPL-3.0** (código) + **arte não-FOSS** + gratuito + fomento.
- **Arte = dados:** nenhum PNG embutido no jogo. O alvo é **arte procedural semântica** (imagem semântica
  `(região, luminosidade)` + dicionário de paletas → recolor infinito, unificado personagens+tiles). PNG/Aseprite/
  Tiled só na **autoria**. Plano: `docs/plano-arte-procedural.md`, importadores em `docs/plano-tiled-aseprite.md`.
- **a11y-first:** quando estética briga com a11y, a11y vence. AAA é aspiracional — **marque honestamente** onde só
  dá AA (ex.: 1.4.6 7:1 briga com cores vivas). Nunca vender "AAA em bloco".

## 2. Estrutura & toolchain

- Repo `SP-the-inclusionist-tracer/` (git). O jogo publicável vive em **`app/`**; o código em **`app/js/**`** (ES
  Modules `.ts`). Deploy = **`dist/`** no **Cloudflare Pages** (git-connected, builda no push da `main`).
- **TypeScript + Vite** (build) + **Vitest** (node + browser/Playwright) + **vite-plugin-pwa** (SW por content-hash).
  **Node 24** (`.node-version`). Detalhes: `docs/plano-typescript-vite.md`, `docs/plano-testes.md`.
- **Versão:** `release-it` (você dispara) + carimbo `git describe` injetado pelo Vite (`__BUILD__`).
  Ver `docs/plano-versionamento.md`.

## 3. Onde estamos + roadmap

- **Agora:** **Estágio 4 — modularização** do `game.js` em ES Modules `.ts`, cada um extraído **com teste**
  (ZOMBIES + Right-BICEP). Alvo/ordem: `docs/plano-modularizacao-mapa.md`. **Fundamentos** que guiam a quebra
  (coesão↑, acoplamento↓, DI, DAO, adapters — base arXiv:2409.15152): `docs/plano-modularizacao.md` (= o ADR).
- **Roadmap por dependência** (`docs/plano-mestre.md` / `docs/ROADMAP.md` — *detalhe por fase ainda a fechar*):
  0 publicar ✅ · 1 nível-glifo + editor de mapa · **2 espinha da engine = a modularização atual** · 3 arte
  procedural semântica · 4 editor de arte + importadores · 5 i18n en/es · 6 features (**Alfabetização 6–9**, webcam/
  voz, refinos, auditoria WCAG/GAG). Alfabetização é **Fase 6** — vem depois da base limpa + arte + i18n.

## 4. Convenções do projeto (obrigatórias)

- **Denso e auditável:** justifique escolhas não óbvias em ≤1 frase, com fonte primária quando couber.
- **Research-first:** estude + monte uma **tabela de resultados esperados (com fontes)** ANTES de propor/codar.
  Sem go-horse; defina a saída esperada e onde avaliar antes de testes caros.
- **Commits FREQUENTES e atômicos** (um bloco lógico por commit; nunca um "initial" gigante). Sem caminhos
  absolutos em arquivos versionados; to-dos pessoais ficam em arquivo git-ignored, não no README.
- **a11y honesto:** não vender "AAA em bloco" — marcar onde só dá AA (detalhe em §1).

## 5. Testes

Vitest com dois *projects*: **node** (lógica pura, sem PIXI/DOM) e **browser**/Playwright (render/DOM). Cada
módulo extraído nasce com teste. **Eu não rodo Node** → pré-valido as expectativas no **preview** (harness de
navegador) e deixo o Dev rodar o Vitest. Padrões: **ZOMBIES** (didático) + **Right-BICEP** (rigor). `docs/plano-testes.md`.
- **Hardware-alvo (Positivo/Chromebook):** montar baterias de teste para rodar **quando os aparelhos existirem**,
  conforme o produto evolui — não bloqueia o desenvolvimento agora (não temos os aparelhos ainda).

## 6. Ambiente (Windows/Avast) — pegadinhas recorrentes

- **Avast reassina o TLS** → Node rejeita (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`; o `npm install` parece **travar**).
  Fix: **`NODE_OPTIONS=--use-system-ca`** (+ `UV_NATIVE_TLS=1` para uv). **Cursor precisa de restart REAL** (não só
  fechar a janela) para pegar env var nova.
- **Nunca** o OAuth interativo do `npx wrangler` (Avast bloqueia + crasha no Windows) → usar `CLOUDFLARE_API_TOKEN`
  ou o dashboard.

## 7. Onde achar (não duplico aqui — fato duplicado apodrece)

- **Mapa da documentação:** `docs/ARCHITECTURE.md` (estrutura de arquivos) + `CONTRIBUTING.md` na raiz (como
  trabalhamos + modelo de documentação). **Comece por aí.**
- **Documentação canônica por fase SDD:** `docs/1-Discovery/` (SRS·User-Stories·NFR·Design·Event-Storming),
  `docs/2-Architecture/` (C4·adr **YADR**·Feature-Flags·DFD·STRIDE·CI-CD·backend-cloud-roadmap·K8s),
  `docs/3-Sprint-Design/` (data-model·api·bdd·Test-Plan), `4-Sprints`·`5-Refactoring`·`6-DevOps-SRE`,
  `docs/research/` e `docs/legacy/`.
- **Constantes do motor** (TILE_TYPES, TUNE, tiles, dimensões): `app/js/core/constants.ts` (fonte única, tipada).
- **Planos legados** (`docs/plano-*.md`, `PESQUISA-*`, `PILARES-INEGOCIAVEIS`, `REGISTRO-DE-DECISOES`, etc.): **ainda
  na raiz de `docs/`**, sendo migrados **arquivo por arquivo, com revisão de conteúdo** (nada automático) para dentro
  da árvore canônica acima — issue `#1`. Até migrar, coexistem.

> ⚠️ **Migração em curso:** o esqueleto canônico (fases 1–6) já existe; o conteúdo dos ~30 arquivos soltos está sendo
> transferido para dentro dele, revisado um a um. Não crie doc novo na raiz de `docs/` — use a árvore de fases.
