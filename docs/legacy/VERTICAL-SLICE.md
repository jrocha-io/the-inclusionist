---
title: Vertical Slice — The Inclusionist (MVP, modo Lúdico)
type: plan
status: round-1-plan
created: 2026-06-01
authors: [José, Claude]
---

# Vertical Slice · The Inclusionist (MVP)

Plano do primeiro vertical slice deste que será o **1º MVP** de um projeto com 35+ jogos
educativos. Filosofia: *tracer bullet* — uma fatia vertical completa e polida, com o
**mínimo** de gerações PixelLab (Tier 1; economia obrigatória, há +34 jogos).

> **Subordinado a `PILARES-INEGOCIAVEIS.md`** (constituição, 2026-06-01). O slice não pode
> violar nenhum dos 10 pilares: hardware fraco, a11y AAA+GAG, i18n, conformidade
> China+Nórdicos+LGPD/COPPA, 320×180 (Libras 420×180), telemetria 1EdTech+xAPI com
> privacidade infantil, telas separadas (sem split), offline PWA/Electron/Capacitor,
> LAN+store-and-forward, GPL-3.0/gratuito/fomento.

## Decisões registradas (rodada 1, 2026-06-01)

1. **Reversão de identidade:** o projeto passa a **aceitar assets binários** (PNG do
   PixelLab + fundos do Magnific). Revoga o pilar "zero assets binários" (CLAUDE.md §1)
   e o **ADR-003** (sprites como dados). *Razão: decisão explícita do José (qualidade
   visual do MVP).* Para sobrepor: "volte ao zero-binário".
   **✅ RESOLVIDO (rodada 2, 2026-06-01) — REVERTIDO para arte como dados/código.** José
   aceitou: arte **gerada por algoritmo** (arrays + paleta hex), PixelLab só como **referência
   de design** (spritesheets em camadas). **Nenhum PNG embutido.** Logo, **R-D muda**: não gera
   PNG para embed — no máximo gera spritesheets-referência no PixelLab (econômico) para o
   algoritmo se basear, sujeito à **pesquisa de IP** (`LICENCAS-GERACAO-IMAGEM.md`). Stack do
   slice: **PixiJS + DOM**, **PWA** (Tauri pós-MVP), single-player. Ver `PILARES-INEGOCIAVEIS.md`.
2. **Recolor preservado:** PNG entra via **palette-swap por chave de cor + composição
   em camadas** (arquitetura do estudo de paletas), **não** como sprite chapado/baked.
   Mantém skin/cabelo/roupa, **alto-contraste (silhueta)**, **colorblind (Okabe-Ito)**,
   2P distintos e a tinta da inversão de escuridão — o núcleo de a11y do projeto.
   Para sobrepor: "aceito sprites baked sem recolor".
3. **Magnific indisponível como ferramenta:** apenas o PixelLab está conectado (MCP).
   Os fundos Magnific são **fornecidos pelo José**; o motor usa **placeholder procedural**
   trocável por manifest, sem mexer no código.
4. **Versão:** a linha do slice é **v4.0.x** (MAJOR — muda a arquitetura de render).
   Para sobrepor: indique outra numeração.
5. **Modo do slice:** **Lúdico** (colete 10 moedas) — mais simples/engajador, melhor
   para o Mom Test e para validar a pipeline ponta-a-ponta.

## Consequências que esta reversão impõe (auditável)

- A camada de render (`drawSprite` = 1 char→1px; tiles via paths) ganha um **caminho
  PNG paralelo**; o caminho de dados é **preservado como fallback** (o jogo nunca quebra
  se um asset faltar).
- Recolor de PNG = mapeamento `corChave→corAlvo` por região (pele/cabelo/roupa), em
  canvas com cache. Alto-contraste continua usando **silhueta chapada** derivada do alfa.
- A customização "Mii-like" (R3) passa a compor **camadas PNG** (corpo/cabelo/roupa)
  em vez de overlays ASCII — mesma UX, outro back-end.

## Rodadas (uma mudança coesa por versão; valida antes de entregar — CLAUDE.md §5)

| Rodada | Versão | Entrega | Créditos |
|---|---|---|---|
| R-A | — | Este plano + decisões | 0 |
| R-B | v3.1.101 | **B2**: persistir remap (localStorage, chave `inclusionist.controls.v1`, try/catch) — único 🔥 crítico, convenção "antes de R3" | 0 |
| R-C | v4.0.0 | Camada de carga PNG **manifest-driven** + **fallback procedural** + motor de recolor por chave de cor | 0 |
| R-D | — | Gerar o **mínimo**: 1 personagem-base (standard, 1 gen) + 1 caminhada (template) + 1 tileset Lúdico | ~6–9 |
| R-E | v4.0.1 | Integrar PNGs no modo Lúdico + fundo placeholder (encaixe Magnific) + validação completa | 0 |
| R-F | v4.0.2 | HC + colorblind sobre os PNGs + legendas SFX (C1) do slice | 0 |

**Orçamento total do slice: ~6–9 gerações PixelLab.** Fundos Magnific: por conta do José.

## Asset mínimo do slice Lúdico (economia)

- **Personagem:** 1 base (modo *standard* = 1 crédito), gerado com **flat shading +
  contorno** para isolar regiões recoloríveis (pele/cabelo/camisa) por chave de cor.
- **Animação:** 1 caminhada (template, ~1 crédito/direção — restringir direções).
- **Tileset:** 1 do tema Lúdico (plataforma) — tiles custam 1 crédito.
- **Moedas/coletáveis:** procedurais (path/emoji) — **0 crédito**.
- **Fundo:** placeholder procedural → trocar pelo Magnific depois.

> Evitar `create_*_object` (20–40 créditos cada) no slice. Objetos-herói só depois.

## Validação (obrigatória por rodada — CLAUDE.md §5)
- `tsc --allowJs --checkJs` = 0 erros (campos novos no `@typedef Player`).
- Simulação Node (física) — reset + `setNumPlayers(1)` antes; refs frescas.
- `node-canvas` para render do personagem/tiles — **aprovação do José antes de embed**.
- `jsdom` para handlers novos (ex.: persistência de remap).

## Pendências para o José
- (a) Fornecer os **fundos Magnific** do tema Lúdico (ou OK ao placeholder por ora).
- (b) Confirmar a numeração **v4.0.x** para a linha do slice.
- (c) OK para iniciar **R-B (B2)** na próxima rodada (zero crédito).
