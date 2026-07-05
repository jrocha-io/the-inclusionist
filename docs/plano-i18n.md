# Plano — Internacionalização (i18n) e localização (l10n)

Pedido do José em 2026-07-03: o jogo precisa suportar vários idiomas. Começar por **pt-BR**, adicionar já
**inglês** e **espanhol** (as duas línguas da BNCC), e no futuro a lista comercial (mandarim, hindi, indonésio,
japonês, coreano, francês, alemão, finlandês). Integrado à modularização (`5-Refactoring/plano-modularizacao.md`) — o i18n
vira um dos primeiros módulos, porque toca em tudo.

---

## 1. A distinção que muda o escopo: UI × currículo

Traduzir **não é** localizar o conteúdo pedagógico. Há duas camadas bem diferentes:

- **Chrome / UI** (menus, botões, rótulos ARIA, rodapés, HUD, mensagens): tradução direta. Barato por idioma.
- **Conteúdo universal** (Matemática, Lúdico): quase universal — só traduzir números/palavras e rótulos.
- **Conteúdo de currículo (Alfabetização):** é **currículo específico da língua**, não tradução. As sílabas
  do português (`ga`/`to`), a psicogênese de Ferreiro aplicada a palavras PT, a relação grafema↔fonema PT, o
  "escrever GATO" — **nada disso mapeia** para inglês (que é fônico, não silábico) ou espanhol (silabação
  própria). Localizar a alfabetização = **autorar novo currículo por língua**, com cuidado pedagógico.

**Recomendação:** localizar **agora** a UI + Matemática + Lúdico para pt/en/es; manter a **Alfabetização só em
pt**, com o framework já pronto para receber "pacotes de currículo" por língua, autorados depois (en com
*phonics*, es com *silabeo*). Assim entregamos en/es de verdade sem inventar pedagogia errada às pressas.

## 2. Idiomas — recomendação (você disse "aceito sugestões")

Todos os idiomas da sua lista são **LTR** (nada de RTL/bidi) — ótimo, simplifica. O custo tem dois eixos:
**script/fonte** e **profundidade de conteúdo**. Agrupando por esforço:

| Onda | Idiomas | Custo | Observações |
|---|---|---|---|
| **0 (agora)** | pt · en · es | baixo | BNCC + alcance gigante. Reusam a stack de fontes acessíveis atual (Atkinson/Andika/Lexend). |
| **1 (barato, Latim)** | fr · de · id · fi | baixo | Indonésio é Latim; finlandês é a "cortesia" *Work on Finland*. Só JSON de UI + voz TTS. |
| **2 (novo script/fonte)** | ja · ko · zh-Hans · hi | **alto** | Precisam de webfonts dedicadas (Noto Sans JP/KR/SC/Devanagari, **multi-MB**), quebra de linha por script e variantes acessíveis. Conflita com o pilar "enxuto/offline" → **carregar a fonte só quando o idioma é escolhido**. Fazer quando houver demanda/financiamento. |

Ordem sugerida difere da comercial de propósito: a Onda 1 são vitórias baratas de UI; a Onda 2 é um projeto
de infra de fontes por si só. A prioridade comercial (ARPU Japão/Coreia etc.) entra assim que a infra de
script CJK existir.

## 3. Arquitetura (sem build, offline/PWA, ES Modules)

- **Módulo `app/js/core/i18n.js`** — API: `t(key, params?)`, `getLocale()`, `setLocale(code)`, `applyDom(root)`.
  Fallback em cadeia: `locale → pt → a própria key`. Interpolação `{nome}`.
- **Arquivos de idioma como ES Modules** (não .json): `app/js/i18n/pt.js` → `export default { … }`.
  - O idioma **padrão é `import` estático** (resolvido antes do game.js rodar) → **boot síncrono, sem async**
    (o jogo monta menus na carga; evita refatorar para init assíncrono).
  - Os demais entram por **`import()` dinâmico** ao trocar de idioma; ficam em cache pelo SW.
  - Racional: no-build + offline + zero fetch no boot. Tradutor edita um objeto JS (trivial).
- **Namespaces de chave:** `menu.*`, `title.*`, `pause.*`, `a11y.*` (diálogos), `hud.*`, `power.*`,
  `activity.<id>.{name,sub,footer}`, `content.*` (currículo, por locale).
- **HTML estático** (`index.html`, ~100 strings): atributos declarativos
  `data-i18n="menu.play"` (textContent) e `data-i18n-aria="a11y.gameRegion"` (aria-label). O i18n percorre
  `[data-i18n]`/`[data-i18n-aria]` na carga e a cada troca de idioma.
- **Strings dinâmicas** (game.js): trocar literais por `t('...')`; menus construídos por JS re-renderizam no
  evento de troca.
- **Voz/TTS:** `localeVoice()` substitui `ptbrVoice()` — escolhe a voz pela locale ativa (pt-BR, en-US/GB,
  es-ES/MX). Liga o i18n ao adapter de fala.
- **Persistência + default:** `incl_lang` no localStorage; default por `navigator.language` limitado aos
  idiomas disponíveis (fallback pt).
- **Seletor de idioma:** ícone 🌐 nos atalhos do título + no menu de pausa; troca aplica sem recarregar.
- **Acessibilidade:** setar `document.documentElement.lang` por locale (leitores de tela); fontes acessíveis
  por script na Onda 2; `lang` correto também melhora hifenização/pronúncia.
- **SW/offline:** pré-cachear pt (estático) + en + es no `SHELL`; Ondas seguintes cacheiam sob demanda.

## 4. Execução em etapas (cada uma = 1 commit verificado, sem mudar comportamento em pt)
1. **Fundação:** `core/i18n.js` + `i18n/pt.js` (seed) + `applyDom`; converter **um** subconjunto (menu do
   título) para `data-i18n`; game.js faz o 1º `import`. Verificar: título idêntico, vindo do dicionário.
2. **Localização POR MÓDULO (durante a Fase B da modularização) — NÃO varrer o monólito.** Correção de rumo
   (2026-07-03): extrair strings do `game.js` de 3800 linhas antes de modularizar era garimpar + tocar o mesmo
   código duas vezes. Em vez disso, **cada módulo com UI extraído na Fase B** (`ui/menus`, `ui/pause`,
   diálogos…) já sai com seus literais trocados por `t()`/`data-i18n` e as chaves no `pt.js` — **uma tocada só
   por trecho de código**. Os lotes já feitos (título, pausa) são a largada dos futuros `ui/*` (chaves prontas,
   não retrabalho). As strings estáticas do `index.html` (diálogos) casam com a extração do módulo que as
   controla. Ver `5-Refactoring/plano-modularizacao.md`.
3. **Voz por locale:** `localeVoice()`; seletor 🌐; persistência + default por navegador.
4. **en + es (UI + Matemática + Lúdico):** `i18n/en.js`, `i18n/es.js`; TTS en/es; Alfabetização fica pt
   (rótulo "disponível em português") até os pacotes de currículo.
5. **Onda 1 (fr/de/id/fi):** só arquivos de idioma + vozes.
6. **Onda 2 (ja/ko/zh/hi):** infra de fontes por script (lazy-load), quebra de linha, revisão de layout.
7. **Pacotes de currículo de alfabetização** por língua (en phonics, es silabeo…), quando houver autoria.

## 5. Riscos
- **Boot assíncrono** — evitado pelo import estático da locale padrão.
- **Explosão de fontes (Onda 2)** vs. pilar enxuto — lazy-load por script; nunca embutir CJK no shell.
- **Currículo mal-localizado** — mitigado pela separação UI×currículo (§1): não fingir alfabetização en/es.
- **Chaves órfãs / faltando** — fallback para pt e um script de auditoria de chaves (tools/) na Onda 1.

## 6. Decisão pendente (José)
Confirmar o §1: **UI + Matemática + Lúdico** localizados para en/es agora, **Alfabetização só em pt** por ora
(framework pronto p/ pacotes de currículo depois). Se quiser tentar alfabetização en/es já, o esforço é de
**autoria pedagógica**, não de tradução — planejo à parte.
