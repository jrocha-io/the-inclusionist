# STRIDE — threat model (light)

**Deferred / minimal today.** The attack surface of a static, offline client with no accounts and no server is small:
no auth to spoof, no server data to tamper with, no privileged API to elevate into. The one real asset now is the
**user's own device storage** (settings/progress in `localStorage`) and the **integrity of the delivered bundle**.

Kept as a stub so the threat model is written **before** the backend/PII lands, and grows per trust boundary in
`DFD.md`.

## Today (client-only) — the few that apply

| STRIDE | Applies now? | Note |
|---|---|---|
| **S**poofing | — | no accounts yet |
| **T**ampering | ⚠️ low | bundle integrity → served over HTTPS + SW content-hash cache; SRI for any CDN dep |
| **R**epudiation | — | no server actions to repudiate |
| **I**nfo disclosure | ⚠️ low | only local data; nothing leaves the device |
| **D**oS | — | static hosting (Cloudflare) absorbs it |
| **E**levation | — | no privileged surface |

## When to do the real pass

Trigger: backend / Student Manager / telemetry (see `../1-Discovery/Event-Storming.md`). Then run STRIDE per trust
boundary crossing in `DFD.md`, with **child-data protection (LGPD/COPPA)** as the top-priority asset.

## Status

- [ ] Full pass deferred to the backend milestone. Stub kept intentionally.
