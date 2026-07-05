# ARCHITECTURE — project & documentation map

> **START HERE — this is THE map.** The first doc to open on **any** prompt (for the AI and any LLM it coordinates) to
> find *what to read and what to change*. Where every file lives, what each canonical document holds, and how each role
> (programmer, AI, reviewer) uses it. **Any change to structure, a filename, or a naming convention is reflected here
> in the same commit** — a stale map is worse than none. For *why* we document the way we do (the artifact model, the
> two-layer requirements, "a doc becomes a test/task/ADR"), see [`../CONTRIBUTING.md`](../CONTRIBUTING.md).
>
> **Naming conventions:** ADRs = `ADR-NNNN-slug.yaml` (YADR); domain blueprints = `<domain>.idd.md` (Instructional
> Design) / `.ld.md` (Learning Design); studies live in `research/`; dead docs in `legacy/`.

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
├── ROADMAP.md                 # strategy + why-this-order; phases live in the GitHub Project (issues #22–#28)
├── 1-Discovery/               # SOFTWARE / engine requirements & design (NOT pedagogy — that's educational/)
│   ├── User-Stories.md        #   engine/game features — negotiable layer
│   ├── NFR.md                 #   non-functional reqs + the 10 pillars      ← PILARES-INEGOCIAVEIS
│   ├── Design.md              #   visual/typography/physics (non-code)
│   └── Event-Storming.md      #   DDD events — deferred (telemetry + Student Manager)
├── educational/               # CURRICULUM / pedagogy layer (pt-BR domain) — see ADR-0004
│   ├── Learning-Objectives.md #   measurable objectives (BNCC + Mager) — absorbs old SRS
│   ├── Curriculum-Map.md      #   scope & sequence, BNCC coverage (+ Instituto Reúna focus-map)
│   ├── Pedagogical-Model.md   #   learning theory (Ferreiro & Teberosky, mastery, ZPD)
│   └── alfabetizacao.idd.md   #   domain IDD (Ferreiro & Teberosky); `<domain>.idd.md`/`.ld.md` convention
├── game-design/               # GAME CRAFT layer — see ADR-0009
│   ├── genre-catalog.md       #   the 35-genre minigame backlog
│   ├── LM-GM-Map.md           #   learning-mechanic ↔ game-mechanic (activity insertion points) — to create
│   ├── Art-Bible.md · Game-Feel.md   # migration targets (DIRETRIZES/ANIMACOES/juice/art pipeline)
│   └── (per-game one-sheets + beat charts)
├── 2-Architecture/            # system architecture & decisions
│   ├── C4-Context.md          #   C4 Level 1 (L2 with backend)
│   ├── adr/                   #   decisions in YADR (YAML) + index README
│   ├── Feature-Flags.md · DFD.md · STRIDE.md · CI-CD.md
│   ├── K8s-Manifests.md       #   note: when K8s becomes worth it (deferred)
│   ├── learning-interop.md    #   xAPI/Caliper/LTI/AfA… e-learning standards (deferred) — ADR-0004
│   └── backend-cloud-roadmap.md   # staged AWS/backend adoption + which docs when
├── 3-Sprint-Design/           # per-feature design
│   ├── data-model/            #   DBML.md · Migrations.md · Normalization.md
│   ├── api/                   #   OpenAPI.md · Pact.md
│   ├── bdd/                   #   Gherkin acceptance for activities (pt-BR features)
│   └── Test-Plan.md
├── 4-Sprints/                 # execution (phase d)
│   ├── TDD.md                 #   TDD/XP + Vitest (ZOMBIES/Right-BICEP); Test Case → Test-Plan
│   ├── Commits.md             #   Conventional Commits + Closes #N
│   └── Frontend.md            #   DOM activities: light-DOM WC + Atomic + Storybook (→ ADR-0002); canvas excluded
├── 5-Refactoring/             # improving (phase e)
│   └── Engineering-Rules.md   #   DRY/SOLID/cohesion↑; supersede-don't-append; ADRs change in-sprint
├── 6-DevOps-SRE/              # phase f
│   ├── CI-QA.md               #   axe-core a11y (now, verifies NFR) · k6 load (backend, verifies SLO)
│   ├── Security-Pipeline.md   #   SAST/Dependabot (now) · DAST (backend) · Pentest (scheduled)
│   └── SLO.md                 #   SLI/SLO/Error-Budget/SLA (backend, rigor by tier)
├── 7-Async-Systems/           # phase g — message contracts · idempotency · ordering · DLQ · chaos (all deferred)
├── research/                  # cross-cutting: studies that back decisions  ← PESQUISA-*, ESTUDO-FONTES, …
└── legacy/                    # cross-cutting: dead but preserved           ← ROADMAP(E1–E13), VERTICAL-SLICE, TODO, …
```

> **Deferred-but-homed:** many 2-/3-/6- artifacts are stubs that record *where/when/how* an artifact activates
> (e.g. DBML at the corpus DB, OpenAPI/Pact at the backend, K8s at stage 4). The stub **is** the decision — it exists
> so the choice isn't improvised later; it is not empty ceremony.
>
> **Not in `docs/`:** the **executable backlog** lives in **GitHub Projects + Issues** (`jrocha-io/the-inclusionist`),
> not in a Markdown file. The **roadmap** is the GitHub Project *The Inclusionist Roadmap* (phase issues #22–#28);
> `ROADMAP.md` keeps only the strategy/why-this-order. See `../CONTRIBUTING.md`.

| File / folder | Holds | Used by |
|---|---|---|
| `ARCHITECTURE.md` | This map (files, code layout, system context) | everyone — the entry point |
| `ROADMAP.md` | Roadmap strategy + dependency-order rationale (phases are issues #22–#28 in the Project) | dev (next work), reviewer (scope) |
| `educational/` | Curriculum layer (pt-BR): Learning Objectives (BNCC + measurable), Curriculum Map, Pedagogical Model | curriculum author, reviewer |
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

*Where* the code lives, by folder (ES modules, TypeScript). The architecture **rules** behind this layout (cohesion,
dependency injection, adapters) and the **system design** (C4, backend) belong in `2-Architecture/` — **not here**.
This file is structure only.

| Folder | Modules |
|---|---|
| `core/` | constants · tiles · world · collision · state · loop · rng · i18n · a11y-sr |
| `platform/` | storage · audio · audio-mixer · speech |
| `input/` | state · keyboard · devices |
| `render/` | canvas · sprites · props · sprite-fx · viz-modes · crt · minimap |
| `ui/` | dom · fonts · vlibras · layout · webcam |
| `game/` | player · coins |
| (root) | `game.js` — dissolving into modules → ends as `main.ts` |

Engine constants (TILE_TYPES, TUNE, dimensions) live only in `app/js/core/constants.ts` — never duplicated in docs.
