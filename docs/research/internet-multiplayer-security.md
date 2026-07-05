# Internet multiplayer — security study (#29)

Prospective threat model for the **internet-MP tier**, which ADR-0008 defers until it is "very well studied and we have
the security to implement it". This study is the "well-studied" part; it feeds a future **ADR + a STRIDE pass**
(`../2-Architecture/STRIDE.md`) before any implementation. Today: **same-screen (4) + classroom-LAN only** — no internet
MP.

## The one rule that dominates everything

**Children must never interact with strangers over the internet.** For a children's product this outranks every
technical concern. It means: **no open matchmaking, no stranger sessions, no free-text/voice chat.** Any internet MP is
**adult-mediated and closed** — a teacher/parent opens a private session and only known/invited participants join
(reuse the activity-code model, ADR-0005). This also fits: cooperative-only (ADR-0006), matchmaking rejected (ADR-0016).

## Threat model (STRIDE, for the internet-MP case)

| Threat | Concern | Mitigation |
|---|---|---|
| **Spoofing** | who joins the session? | **closed sessions** via an adult-issued code/invite; no open lobby; adult verified via the gov identity model (RN-02) |
| **Tampering** | client cheats the shared sim | **authoritative server** (Nakama), clients never trusted; co-op (not competitive) lowers the stakes |
| **Repudiation** | who did what | session logs owned by the adult/school; no anonymous open sessions |
| **Info disclosure** | child data / contact | **no child PII on the wire**; **no free-text or voice chat** (predator/grooming risk) — disable, or fixed safe phrases only; no shared user-generated content; no location |
| **DoS** | flood the session | server-side rate limiting; small closed sessions cap exposure |
| **Elevation** | client gains control | server authority; no client-trusted state |

## Child-safety requirements (COPPA / LGPD / GDPR-K)

- **No stranger contact** (the rule above); **no behavioural profiling / ad targeting** of children (pillar P6).
- **Adult consent** gates any online session (RN-02); **data residency** — session data stays in-region (RN-04).
- **No open chat.** If any communication is ever needed, it is a **closed set of pre-approved safe phrases/emotes**,
  never free text or voice.

## Topology (if/when built)

Authoritative **Nakama** server; **closed sessions** (code/invite, adult-created); TLS everywhere; regional hosting
(RN-04); rate limiting + abuse monitoring. No P2P (exposes IPs). Reuses the P7/P9 sync model, plus the network layer.

## Recommendation

Keep internet MP **deferred**. Ship same-screen (ADR-0008) and classroom-LAN first. Build internet MP **only after**:
(1) this threat model is turned into a STRIDE pass + an ADR; (2) adult-mediated closed sessions + no-open-chat are
designed in from the start; (3) a security review (and, at the child-data surface, a pentest — see
`../6-DevOps-SRE/Security-Pipeline.md`). It is a T3-leaning surface — treat it as such.
