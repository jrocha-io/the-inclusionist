# Contributing

## How we work

- **Language:** English for code, comments, docs, and commit messages (open-source lingua franca). **pt-BR only for
  intrinsically-Brazilian domain content** — BNCC-mapped learning objectives and literacy pedagogy, which are
  Portuguese by nature.
- **Commits:** atomic (one logical change each), **Conventional Commits** (`feat`, `fix`, `refactor`, `docs`,
  `build`, `test`, `chore`). Small team: direct to `main`; grows to PRs as the team grows. AI-authored commits carry
  a `Co-Authored-By` trailer.
- **Tests:** every module ships with tests — **Vitest**, two projects: `node` (pure logic, no PIXI/DOM) and
  `browser`/Playwright (render/DOM). Patterns: **ZOMBIES** (didactic) + **Right-BICEP** (rigor).
- **Validation before "done":** `npm run build` + `npx vitest run` + `npx tsc --noEmit` green.
- **Backlog & issues:** the executable backlog lives in **GitHub Projects + Issues** (`jrocha-io/the-inclusionist`),
  **not** in a Markdown file. `docs/ROADMAP.md` holds the *strategic* phased plan; the granular work is issues.
  Priority is carried by labels **`P0`/`P1`/`P2`** (until a Project single-select field is set up); area/type labels
  (`a11y`, `curriculum`, `engine`, `docs`, `infra`, `bug`, `feature`, `research`, `pillar`, …) classify them. Commits
  close issues with **`Closes #N`** — the light commit↔requirement trace (the heavy FEAT-### traceability is deferred).
- The **map of where everything lives** is [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The AI agent's operating
  rules are in [`CLAUDE.md`](CLAUDE.md).

## Documentation model (why our docs look the way they do)

Tier **T2** (educational platform, LGPD/child-data). We adopt a **lean subset** of a fullstack SDD schema — dropping
the fullstack-only artifacts (K8s, Terraform, OpenAPI, Argo, message queues) — plus the **educational-software**
artifacts (learning objectives, curriculum map, pedagogical model, xAPI). **Cut rule:** every statement in a doc is
**either** (a) reducible to a machine-verifiable checklist/test (threshold/schema) **or** (b) a decision record an
auditor needs to reconstruct reasoning. Anything else is noise and is cut.

## Requirements — a two-layer model (deliberate, and unusual)

> Experienced engineers usually expect **one** requirements form: a formal **SRS** or a backlog of **user stories**.
> We use **neither** as the primary form for the curriculum. Here is the rationale — read it before objecting.

This is a **curriculum engine**. Its requirements are hundreds→thousands of learning targets across **3 early-
childhood years + 9 fundamental years + 3 secondary years**, many disciplines, all bound to **BNCC** skill codes
(the Brazilian national curriculum — i.e. regulation, not a negotiable backlog).

- A classic **SRS / EARS** ("when X, the system shall Y") is built for *system behaviour*, not pedagogical mastery
  targets; a single SRS at this scale is unwieldy and does not map cleanly to BNCC codes.
- **User stories** are for *small, negotiable, evolving* feature sets. A national curriculum is *large, fixed, and
  standards-bound* — user stories lose structure, traceability, and coverage analysis ("is every year-1 Portuguese
  BNCC skill covered by a game?") at this scale.

So we **split by layer**:

| Layer | Form | Where |
|---|---|---|
| **Curriculum** (large, fixed, BNCC-bound) | **Curriculum Map (Scope & Sequence)** + **Learning Objectives** — each objective = a BNCC skill code + a *measurable* criterion (e.g. "given a phoneme, selects the correct grapheme in ≥80% of attempts") | `docs/domain/` (pt-BR) |
| **Engine / game** (small, negotiable software features) | light **User Stories** | backlog |

The curriculum layer *is* the SRS of learning software, in the domain-native form. Curriculum Map + Learning
Objectives are recognized instructional-design artifacts, structured/traceable/auditable — which matters for
public-education procurement. This is not us avoiding rigor; it is choosing the rigor that fits the domain.
