# ARCHITECTURE — project & documentation map

> **START HERE.** This is the map: where every file lives, what each canonical document holds, and how each role
> (programmer, AI, reviewer) uses it. For *why* we document the way we do (the artifact model, the two-layer
> requirements), see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).

## 1. Repository layout

```
SP-the-inclusionist-tracer/
├── app/                      # the publishable game (Vite root)
│   ├── index.html
│   ├── css/style.css
│   ├── js/                   # ES modules (TypeScript) — see §3
│   └── public/               # static: assets/ vendor/ manifest.webmanifest icon.svg _headers
├── dist/                     # build output (git-ignored) → deployed to Cloudflare Pages
├── docs/                     # documentation — see §2
├── tests/                    # Vitest: *.node.test.js (logic) + *.browser.test.js (render/DOM)
├── .github/workflows/ci.yml  # CI: typecheck + vitest + build
├── vite.config.ts  tsconfig.json  package.json  .release-it.json  .node-version
├── CLAUDE.md                 # AI operating rules (entry index for the agent)
└── CONTRIBUTING.md           # how we work + our documentation model
```

## 2. Documentation layout (`docs/`)

**Target structure** (the consolidation is migrating the current flat `docs/` into this):

Organized by **SDD lifecycle phase** (numbered), mirroring the schema we adopt (Discovery → Architecture → …).

```
docs/
├── ARCHITECTURE.md            # THIS FILE — the map (start here)
├── ROADMAP.md                 # phased roadmap 0–6 (cross-cutting)          ← plano-mestre
├── 1-Discovery/               # requirements & design intent
│   ├── SRS.md                 #   curriculum requirements (BNCC) — fixed layer
│   ├── User-Stories.md        #   engine/game features — negotiable layer
│   ├── NFR.md                 #   non-functional reqs + the 10 pillars      ← PILARES-INEGOCIAVEIS
│   ├── Design.md              #   visual/typography/physics (non-code)
│   └── Event-Storming.md      #   DDD events — deferred (telemetry + Student Manager)
├── 2-Architecture/            # (under construction) C4 · ADRs · DFD-PII · CI/CD · …
├── 3-Sprint-Design/ · 4-Sprints/ · 5-Refactoring/ · 6-DevOps-SRE/   # (under construction, one per SDD section)
├── research/                  # cross-cutting: studies that back decisions  ← PESQUISA-*, ESTUDO-FONTES, …
└── legacy/                    # cross-cutting: dead but preserved           ← ROADMAP(E1–E13), VERTICAL-SLICE, TODO, …
```

| File / folder | Holds | Used by |
|---|---|---|
| `ARCHITECTURE.md` | This map (files, code layout, system context) | everyone — the entry point |
| `ROADMAP.md` | What to build and in what order (Phases 0–6), one canonical vocabulary | dev (next work), reviewer (scope) |
| `1-Discovery/SRS.md` | Curriculum requirements → BNCC codes + measurable criteria (grows into a folder) | curriculum author, reviewer |
| `1-Discovery/User-Stories.md` | Engine/game feature stories (small, negotiable) | dev |
| `1-Discovery/NFR.md` | The 10 pillars as testable non-functional requirements | dev (constraints), reviewer (audit) |
| `1-Discovery/Design.md` | Non-code design: typography, colour roles, physics feel, UI spacing | dev, designer |
| `1-Discovery/Event-Storming.md` | Deferred DDD scope for telemetry + Student Manager | (future) |
| `2-Architecture/` … `6-DevOps-SRE/` | The remaining SDD phases — decided section by section (see §… of this doc's evaluation) | dev, reviewer |
| `research/` | Studies with sources that justify decisions | reviewer (evidence), dev |
| `legacy/` | Superseded docs kept for history | anyone digging into the past |

> **Migration status:** `1-Discovery/` is created; the other phase folders + `research/`/`legacy/` are populated as
> the file-by-file consolidation proceeds. Until then, the old flat `plano-*`/`PESQUISA-*` docs still coexist.

## 3. Code layout (`app/js/`)

Migrating from the `game.js` monolith into native ES modules (TypeScript), layered by responsibility.
**Dependency rule:** domain never reaches platform globals — platform is behind thin **adapters**, dependencies are
**injected** (e.g. `initCollision(ctx)`, `setVlibrasSay(fn)`). That is what makes each module unit-testable.

| Layer | Modules | Responsibility |
|---|---|---|
| `core/` | constants · tiles · world · collision · state · loop · rng · i18n · a11y-sr | Pure engine + game state (single source of truth) |
| `platform/` | storage · audio · audio-mixer · speech | Adapters over browser APIs |
| `input/` | state · keyboard · devices | Keyboard/gamepad/touch config + live state |
| `render/` | canvas · sprites · props · sprite-fx · viz-modes · crt · minimap | PixiJS/canvas drawing + visual subsystems |
| `ui/` | dom · fonts · vlibras · layout · webcam | DOM UI, scaling, assistive-input adapters |
| `game/` | player · coins | Entities + placement (lean on `core/collision`) |
| — | `game.js` (**dissolving**) | Shrinking monolith → ends as `main.ts` (composition root; wires adapters, exposes `window.__incl`) |

Constants (TILE_TYPES, TUNE, dimensions) live only in `app/js/core/constants.ts` — never duplicated in docs.

## 4. System context (C4 — Level 1)

Client-side **PWA**, no backend today: PixiJS (WebGL/Canvas) render + DOM UI (a11y), **offline** (Workbox), shipped
as `dist/` on **Cloudflare Pages**. Edge deps: PixiJS · VLibras · WebGazer · neural TTS (future) · Web Speech/
Gamepad/Audio APIs. **Non-goals (now):** server API, microservices, K8s. **Future backend:** when logged-in users
make sense, **Nakama** (self-hostable — fits LGPD/data-locality); telemetry (xAPI/Caliper/LTI) is store-and-forward,
not a live cloud. These land as ADRs when adopted.
