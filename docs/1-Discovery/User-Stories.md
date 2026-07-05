# User Stories (engine / game layer)

The **negotiable software features** of the engine and games — the second layer of our two-layer requirements model
(the fixed curriculum layer lives in `../educational/`; rationale in `../../CONTRIBUTING.md`). Format: Connextra
("As a `<role>`, I want `<goal>`, so that `<benefit>`"). Roles: **player (child)**, **teacher**, **parent**,
**professional** (psychologist/physio/neuropsych — future Student Manager).

Keep these small and negotiable; anything that is a *learning target* belongs in `../educational/`, not here.

## Seed (examples — to expand)

- As a **player**, I want to move and collect with one input at a time, so that one-button/switch access works.
- As a **player**, I want to remap my controls and have it persist, so that my adaptive mapping survives a reload.
- As a **player using a screen reader**, I want every SFX captioned via `aria-live`, so that I don't miss game events.
- As a **teacher**, I want to pick the activity and difficulty per screen, so that each child gets the right level.
- As a **parent/teacher** (future), I want a local student record of progress, so that no child data leaves the device.

## Status

- Backlog form only; not yet tied to traceability IDs (deferred — see `../../CONTRIBUTING.md`).
- Many of the seed items above are already implemented; audit against code when formalizing.
