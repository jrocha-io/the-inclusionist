# Versionamento de build — release-it + carimbo git

Decisão (2026-07-05, José): **release-it** (padrão de indústria; você dispara localmente) + **carimbo de build por
`git describe`** injetado no Vite. Um único esquema serve os dois ambientes:

| Contexto | `__BUILD__.version` exibido |
|---|---|
| CF (produção) no commit de uma tag de release | `v4.165.0` ← versão "de marketing" limpa |
| Local/CF num commit intermediário | `v4.164.25-3-gab12cd` (tag + 3 commits à frente + SHA curto) |
| Local com mudanças não commitadas | `…-dirty` |
| Sem tags (antes do bootstrap) ou git indisponível | SHA curto, ou `dev` |

## Como funciona

- **`vite.config.ts`** computa `BUILD = { version, sha, date, env }` no build (Node) e injeta via `define:
  { __BUILD__: … }`. `version = git describe --tags --always --dirty`. Fallbacks: `CF_PAGES_COMMIT_SHA` (clone
  raso da CF) → `dev`. `date` = data do **commit** (estável entre rebuilds do mesmo commit → não re-hasheia o
  bundle à toa). `env` = `prod` na CF, `local` aqui.
- **`app/js/env.d.ts`** declara `__BUILD__` p/ o `tsc`. **`game.js`** lê `__BUILD__.version` (tira o `v` inicial; o
  display já prefixa) com fallback defensivo a `'4.164.25'`.
- **`.release-it.json`**: `@release-it/conventional-changelog` auto-bumpa a versão pelos **Conventional Commits**
  que já escrevemos (`feat`→minor, `fix`→patch, `BREAKING CHANGE`→major) e gera o `CHANGELOG.md`. **Não** publica
  em registry (é app, não pacote) e **não** dá push sozinho (você controla o push).

## Bootstrap (você roda — uma vez)

```powershell
npm i -D release-it @release-it/conventional-changelog   # adiciona as devDeps
git tag v4.164.25                                        # tag-base (casa com package.json version)
```
Sem essa tag-base, `git describe` cai no SHA até a 1ª release. `package.json` já está em `4.164.25` (base do bump).

## Soltar uma release (você roda, quando decidir)

```powershell
npm run release            # bumpa package.json + CHANGELOG.md + commit chore(release) + tag vX.Y.Z (árvore limpa)
git push --follow-tags     # envia commits + a tag → a CF builda e o jogo passa a mostrar vX.Y.Z
```
`release-it` mostra um preview e pede confirmação antes de tocar em qualquer coisa.

## Cloudflare Pages — ajuste no build command (você, no dashboard)

Para a produção mostrar a **tag limpa** (e não o SHA), as tags precisam vir no clone raso da CF. Prefixe o build:
```
git fetch --tags --force && npm run test:node && npm run build
```
Se não fizer isso, o fallback ainda funciona: produção mostra `CF_PAGES_COMMIT_SHA` (curto) em vez da tag.

## Fontes

- [Cloudflare Pages — build env vars](https://developers.cloudflare.com/pages/configuration/build-configuration/) (tem `CF_PAGES_COMMIT_SHA`, **não** tem tag) · [pedido da tag como env var](https://community.cloudflare.com/t/git-tag-available-as-environment-variable-at-build-time/650715)
- [git describe em clone raso precisa das tags](https://github.com/actions/checkout/issues/338)
- [Injeção via Vite `define`](https://vite.dev/guide/env-and-mode) · [git hash no build Vite](https://zegnat.bearblog.dev/adding-the-git-commit-hash-to-my-vite-build/)
- [release-it](https://github.com/release-it/release-it) · [@release-it/conventional-changelog](https://github.com/release-it/conventional-changelog) · [`standard-version` descontinuado](https://github.com/conventional-changelog/standard-version)
