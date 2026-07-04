# Migração para TypeScript + Vite

Decisão do José (2026-07-04): migrar de "ESM cru sem build" para **TypeScript + Vite (com build)**, AGORA (24
módulos extraídos — mais barato que depois). Muda a *preferência* "sem build step"; os **pilares inegociáveis**
(PWA offline, runtime enxuto, hardware de escola) são **preservados/melhorados** (bundle/minify/tree-shake =
payload menor; `vite-plugin-pwa` gera o SW offline). Ver [[project-inclusionist]].

## Princípios
- **Incremental, sem big-bang.** `allowJs: true` → `.js` e `.ts` coexistem; converte-se módulo a módulo. A
  modularização em curso continua, mas cada peça nova/extraída nasce/vira `.ts` com tipos + testes.
- **strict frouxo no início**, apertando aos poucos (evita 1000 erros no dia 1).
- **Verificação:** a IA não roda Node → o José roda `npm run dev`/`build`/`vitest`. O preview (python servindo cru)
  ainda cobre os estágios iniciais; depois do build/PWA, a validação é via Vite.
- **1 estágio por vez, cada um validado antes do próximo.**

## Estágios

### Estágio 0 — Vite serve o jogo atual (dev), SEM mudar código
Objetivo: provar que o toolchain roda com o mínimo de mudança (PIXI segue global do vendor; nada de TS ainda).
- `package.json`: devDeps `vite` + `typescript`; scripts `dev`/`build`/`preview`. Vitest alinhado ao major do Vite.
- `vite.config.ts`: `root: 'app'` (onde está o index.html). Em DEV o Vite serve TUDO sob `app/` (js/css/assets/
  vendor) → `fetch('assets/…')` e o `<script vendor/pixi.min.js>` funcionam sem mover nada.
- `tsconfig.json`: `allowJs`, `checkJs:false`, `noEmit` (o Vite emite; o tsc só faz type-check), `strict:false`.
- O SW artesanal é **desligado no dev** (evita conflito com o Vite) — volta como plugin no Estágio 1.
- **José valida:** `npm install` → `npm run dev` → o jogo abre em `localhost:5173` igual a hoje.

### Estágio 0b — `vite build` gera `dist/`
- Configurar cópia dos estáticos runtime (`assets/`, `vendor/`, `manifest`, `icon`, `_headers`) para o build —
  mover para `app/public/` (o Vite copia `public/*` para `dist/` na mesma URL). index.html quase intacto.
- **José valida:** `npm run build` → `npm run preview` serve o `dist/` funcionando.

### Estágio 1 — PWA pelo `vite-plugin-pwa`
- Substitui o `sw.js` artesanal + o ritual de bump `INCL_VERSION`: o plugin gera o SW com precache por
  **content-hash** (cache invalida sozinho). Estratégia offline preservada (precache do shell + assets).
- Remove `app/sw.js` e o registro inline; o plugin injeta o registro.
- **José valida:** build + `preview`, testar offline (DevTools → Offline) + atualização.

### Estágio 2 — Vitest alinhado ao Vite
- Bump `vitest`/`@vitest/browser` ao major compatível com o Vite instalado. Os dois projects (node/browser) e os
  testes atuais seguem; só a versão/ço​nfig ajusta. **José valida:** `npx vitest run` verde.

### Estágio 3 — Converter para `.ts` (incremental) + PIXI via npm
- Renomear módulos `.js`→`.ts` e tipar, começando pelos **folha puros** (constants, tiles, rng, state, storage,
  input/state, sprites-manifest…). Apertar `tsconfig` aos poucos (`strict` por flag).
- Trocar o `PIXI` global por `import * as PIXI from 'pixi.js'` (dep real, tree-shakeável, tipada) — módulo a
  módulo do render. `$` de ui/dom vira helper **tipado** (`$<T>()`).
- Cada conversão: `tsc --noEmit` limpo + testes verdes.

### Estágio 4 — Retomar a modularização em `.ts`
- O resto do mapa (`plano-modularizacao-mapa.md`) segue, mas cada extração já nasce `.ts` tipada. O `game.ts`
  (ex-`game.js`) encolhe até virar `main.ts` (composition root).

## Deploy (Cloudflare Pages) — ação do José
- Trocar de "servir `app/`" para **Build command `npm run build` · Output `dist/`**. O `_headers` vai no `dist/`
  (via `public/`). Node no ambiente de build do CF (já tem).

## Riscos / notas
- **Config de Vite/PWA costuma precisar de 1–2 iterações na máquina real** — mando a config, você roda, me cola o
  erro, eu ajusto (como foi no browser mode do Vitest).
- **Alinhamento de versão Vite↔Vitest** é o ponto mais provável de atrito no `npm install` — resolvemos no 1º run.
- **Preview da IA** perde fidelidade após o Estágio 0b (build/PWA) — a validação passa a ser sua via Vite. Meu
  graph-check em Python vira redundante (o `tsc` faz melhor).
- Nada disso muda o jogo em runtime para o usuário além de **melhor** (payload menor, SW mais robusto).
