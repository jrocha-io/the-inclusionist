# Feature Flags

Lightweight, **no service** (no Unleash/LaunchDarkly — those are for a fleet we don't have). A flag is a boolean/enum
read from one place, with a dev override. Purpose: ship half-done work behind a flag, and let a11y/experimental modes
be toggled without a rebuild.

## Model

- **Source of truth:** a single `flags` object (defaults) in code — e.g. `app/js/core/flags.ts`.
- **Override order (highest wins):**
  1. URL query — `?flags=webcam,newRamp` (or `?flag.webcam=1`) — for quick testing / bug reports.
  2. `localStorage` (`incl.flags`) — persists a tester's choice across reloads.
  3. Default in code.
- **Read once at boot** into a frozen object; expose a getter (`isOn('webcam')`). No live re-reads.

## Rules

- A flag is **temporary** — it names a migration or an experiment, and is **deleted** once the work lands (a flag
  that never dies is just dead config). Track live flags + their removal trigger in a short table here.
- Accessibility **modes** (high-contrast, wheelchair, eye-control) are **user settings**, not feature flags — they
  live in the settings store, not here. Flags gate *unfinished or experimental* code only.

## Live flags

| Flag | What it gates | Default | Remove when |
|---|---|---|---|
| _(none yet)_ | | | |
