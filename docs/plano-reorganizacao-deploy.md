# Plano — Reorganização de arquivos + Deploy (GitHub + Cloudflare Pages)

Pedido do José em 2026-07-03. Reestruturar o repositório com boas práticas de engenharia de software e de
game dev, **integrado** ao `plano-modularizacao.md`, e publicar o jogo no **GitHub** rodando no **Cloudflare
Pages (plano gratuito)**. É um PLANO — executar em etapas, com aval, sem mudar comportamento do jogo.

---

## 1. Diagnóstico da estrutura atual

```
SP-the-inclusionist-tracer/
├─ v4.0.0/                     ← APP INTEIRO preso numa pasta com nome de versão (o git já versiona)
│  ├─ index.html style.css game.js sw.js manifest.webmanifest icon.svg
│  ├─ ANIMACOES-PERSONAGEM.md AUDITORIA-E13.md DIRETRIZES-…md README.md   ← docs soltos no meio do código
│  ├─ assets/  vendor/  tools/  _review/(ignored)
├─ docs/                       ← docs de verdade (planos, pesquisas, ADR, REGISTRO)  ✅
├─ legacy/v3.1.100.html        ← monólito antigo (arquivo histórico)
├─ assets-ref/ (ignored)       ← refs PixelLab NÃO-GPL (1,4 MB) — nunca pode ir p/ repo público
├─ shots/ (ignored)  README.md LICENSE CLAUDE.md .gitignore
```

**Problemas:** (a) versão no caminho; (b) sem raiz deployável limpa (o que é do jogo × o que é do repo);
(c) docs misturados ao código; (d) sem remote nem config de deploy; (e) `game.js` de 375 KB num arquivo só
(resolvido pela modularização).

---

## 2. Estrutura-alvo (casada com a modularização)

Uma pasta **`app/`** = **raiz publicável** (só o que o navegador carrega). Tudo o mais (docs, tools, legacy)
fica no repo mas **fora** do deploy. Os módulos ES da modularização nascem dentro de `app/js/`.

```
SP-the-inclusionist-tracer/            (→ GitHub; público, GPL-3.0)
├─ app/                                ← Cloudflare Pages "output directory"
│  ├─ index.html
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  ├─ icon.svg
│  ├─ _headers                         ← cache do Cloudflare (sw.js/html sem cache; assets imutáveis)
│  ├─ css/
│  │   └─ style.css
│  ├─ js/                              ← alvo da modularização (hoje só game.js; vira main.js + módulos)
│  │   ├─ game.js  →  main.js
│  │   ├─ core/  render/  gameplay/  a11y/  input/  ui/  platform/
│  ├─ assets/                          ← sprites/ cenarios/ (runtime, GPL-clean)
│  └─ vendor/                          ← pixi.min.js (MIT), fonts/ (SIL OFL), fonts.css
├─ docs/                               ← NÃO deployado
│  ├─ adr/
│  ├─ planos/                          ← plano-*.md agrupados
│  ├─ pesquisas/                       ← PESQUISA-*/ESTUDO-*/referencia-*
│  └─ (REGISTRO-DE-DECISOES, ROADMAP, TODO, PILARES… na raiz de docs/)
├─ tools/                              ← build-hc.py e scripts de dev (NÃO deployado)
├─ legacy/v3.1.100.html                ← arquivo histórico (NÃO deployado)
├─ README.md  LICENSE  CLAUDE.md  .gitignore
```

**Por que `app/` como subpasta e não a raiz do repo:** o Cloudflare Pages publica **uma** pasta como raiz
do site. Apontando o *output directory* para `app/`, o deploy contém **só o jogo** — `docs/`, `tools/` e
`legacy/` não vão ao ar (nem gastam o limite de arquivos, nem expõem rascunhos). É o padrão de projetos web.

**Nomes convencionais de game dev aplicados:** `assets/` por tipo (sprites, cenarios), `js/` por domínio
(a modularização), `vendor/` para terceiros, `css/` isolado. Dados de fase (`CLARITY_MAP`, hoje embutido no
game.js) podem, no futuro, sair para `assets/levels/` — fica anotado, não é desta etapa.

---

## 3. Deploy — Cloudflare Pages (plano gratuito)

**Modelo:** site **estático puro, sem build** (ES Modules nativos servidos direto — combina com o "sem
bundler"). O Pages serve os arquivos como estão.

**Configuração do projeto Pages:**
- Framework preset: **None**.
- Build command: **(vazio)**.
- Build output directory: **`app`**.
- Root directory: **(raiz do repo)**.
- Deploy automático a cada push na `main`; *preview deployments* automáticos para branches/PRs.

**Limites do free plan (folga enorme p/ nós):** requisições/banda **ilimitadas**; **500 builds/mês**;
**20.000 arquivos** por deploy (temos ~135); **25 MiB** por arquivo (maior é pixi.min.js, 456 KB); HTTPS e
subdomínio `*.pages.dev` grátis (domínio próprio opcional depois).

**`app/_headers`** (recurso nativo do Pages) para a PWA atualizar sem susto:
```
/sw.js
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/vendor/*
  Cache-Control: public, max-age=31536000, immutable
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```
Isso, somado ao bump do `CACHE` do service worker a cada commit, mata de vez o "build velho preso" — agora
também na borda do Cloudflare.

**PWA/Service Worker:** funciona no Pages (HTTPS obrigatório para SW — o Pages já fornece). Escopo do SW =
raiz do site (`app/` publicado em `/`), então `sw.js` controla tudo. `manifest` já usa `start_url:"."`/
`scope:"."` relativos → resolvem para `/`. Nada a mudar na lógica.

---

## 4. GitHub — publicação

- Repositório **público** (é GPL-3.0; OSS de verdade). Nome a confirmar (ex.: `the-inclusionist`).
- **Gate de licença ANTES do 1º push público** (inegociável): garantir que `assets-ref/` (refs PixelLab
  não-GPL) e qualquer arte não-livre **não** estão versionados. Hoje `.gitignore` já cobre; conferir com
  `git ls-files | grep -i assets-ref` (deve vir vazio) e revisar `vendor/fonts` (só SIL OFL) e `pixi.min.js`
  (MIT). Ver [[reference_live2d_sample_license]] como lembrete do tipo de armadilha.
- `README.md` da raiz reescrito: o que é, como rodar local, licença, e **como o deploy funciona** (Pages).
- Publicação é ação externa e irreversível (indexável): **José executa o `gh repo create`/push e conecta o
  Pages**; eu preparo tudo (arquivos, `_headers`, README, comandos prontos) e verifico. (Convenção do
  projeto: eu faço os *commits* locais; o *push/publish* e a conexão de serviços externos são dele.)

---

## 5. Sequência integrada (reorg → deploy → modularização)

A reorganização vem **antes** do grosso da modularização, para os módulos já nascerem no lugar certo
(`app/js/…`). Cada passo = 1 commit atômico, verificado no Preview, sem mudar comportamento.

**FASE A — Reorganização (esta antes da Fase B)**
- **A1. Consolidar docs.** Mover os 4 `.md` de `v4.0.0/` → `docs/`; agrupar `docs/planos/` e
  `docs/pesquisas/`. Só docs — risco zero de runtime. `git mv` (preserva histórico).
- **A2. Criar a raiz `app/`.** `git mv` de `v4.0.0/` para `app/` reorganizando em `css/ js/ assets/ vendor/`
  (`game.js`→`app/js/game.js`, ainda monólito). Ajustar caminhos em `index.html` (`css/style.css`,
  `js/game.js`, `vendor/…`), no `SHELL` do `sw.js` e no `manifest`. Atualizar `.gitignore` (`v4.0.0/_review`
  → `app/_review`) e a config do Preview (servir `app/`). **Verificar no Preview**: jogo idêntico, sem erro.
- **A3. Config de deploy.** Criar `app/_headers`, reescrever `README.md` (rodar local + deploy), remover a
  pasta `v4.0.0` vazia. Documentar no REGISTRO-DE-DECISOES.
- **A4. Publicação (José executa).** Gate de licença → `gh repo create` público → push `main` → conectar
  Cloudflare Pages (output `app`) → confirmar `*.pages.dev` no ar. Eu deixo os comandos prontos.

**FASE B — Modularização** (o `plano-modularizacao.md`, Etapas 1→5), agora operando dentro de `app/js/`.
Como o deploy é automático, cada commit da modularização já vira um *preview/deploy* verificável no Pages.

---

## 6. Riscos e mitigação
- **Quebra de caminho relativo** no move (A2) → varrer `index.html`/`style.css`/`sw.js`/`manifest` por toda
  referência (`href`, `src`, `url(...)`, preload de fonte, lista `SHELL`) e Preview-verificar antes do commit.
- **SW servir mistura** durante o move → bump `CACHE`; `_headers` no-cache no `sw.js`/`index.html`.
- **Preview aponta p/ pasta antiga** → atualizar o `launch.json`/config do servidor para a raiz `app/`.
- **Vazar arte não-GPL no push** → gate de licença do §4 é bloqueante.
- **Histórico do git** → usar `git mv` (não delete+add) para preservar `git blame`/log dos arquivos movidos.

## 7. O que NÃO muda
- Zero mudança de comportamento/arte/pedagogia; é reorganização + infra.
- Sem bundler, sem passo de build, 100% offline/PWA preservado; agora também servido com HTTPS no Pages.

## 8. Decisões pendentes (José)
1. Nome da pasta deployável: **`app/`** (recomendado) · `public/` (convenção Cloudflare) · `game/`.
2. Nome + visibilidade do repositório GitHub (recomendo **público**, GPL).
3. Confirmar: eu preparo tudo e **você** roda o push/deploy (recomendado), ou quer que eu tente via `gh`.
