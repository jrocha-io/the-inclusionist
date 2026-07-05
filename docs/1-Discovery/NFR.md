# NFR — Non-Functional Requirements

The project's hard, cross-cutting constraints. **Accessibility lives here** (not a separate doc). Any trade-off
against an NFR (e.g. WCAG level vs. cost) is recorded as an **ADR**. The full rationale/history of these is in
`../PILARES-INEGOCIAVEIS.md` (being merged into this file).

Where a requirement is machine-verifiable, it carries a **threshold** (the testable part).

| # | NFR | Requirement | Threshold / test |
|---|-----|-------------|------------------|
| 1 | **Hardware** | Runs on weak Brazilian public-school devices (Positivo tablet, Chromebook) | Lighthouse Perf ≥ 90 under Tablet + 3G + 4× CPU throttle |
| 2 | **Accessibility** | WCAG 2.2 + Game Accessibility Guidelines; AAA aspirational, AA honest per surface | axe-core = 0 A/AA violations; contrast ratios per surface; touch targets ≥ physical target |
| 3 | **i18n** | UI + math + play localizable; pt base, en/es waves, then nordic | every extracted UI module ships with `t()`/`data-i18n` |
| 4 | **Compliance** | LGPD + COPPA + China + Nordic — strictest rule wins; child-data privacy | no child PII to third-party SaaS; consent + local storage (see `2-Architecture` DFD) |
| 5 | **Pixel grid** | 320×180 logical (Libras 420×180, 21:9) | integer real-pixel scaling; scanlines regular at any dpr |
| 6 | **Telemetry** | 1EdTech (LTI 1.3) + Caliper + xAPI, child-privacy-strict | store-and-forward, not live cloud (deferred; ADR when adopted) |
| 7 | **Multiplayer** | Separate screens per player (no split-screen), local | independent viewports; no netcode in MVP |
| 8 | **Offline** | Fully playable offline (PWA now; Tauri/Capacitor later) | works with network disabled after first load |
| 9 | **LAN** | LAN + store-and-forward telemetry | (deferred) |
| 10 | **Licensing** | GPL-3.0 code + non-FOSS art + free + funded | no embedded PNG in-game (art = data); license gate before publish |

> These 10 are the "non-negotiable pillars." The strategic/values context and the resolved conflicts behind them
> stay in `PILARES-INEGOCIAVEIS.md` until fully merged here.
