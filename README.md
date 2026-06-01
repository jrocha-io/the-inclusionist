---
title: The Inclusionist — tracer bullet ratificador
type: research-tracer
status: empirically_ratified
created: 2026-05-19
updated: 2026-05-23
---

# The Inclusionist · tracer bullet

Protótipo iterado em **102 versões** (v1.0.0 → v3.1.100) demonstrando empiricamente que a arquitetura **DOM-first semântico + Canvas opcional acessível** mira **WCAG 2.2 (AAA aspiracional) + GAG** (em progresso — **sem alegar "complete"** até o MVP validado) — ratificando a [[../../ADRs/ADR-001-engine-architecture|ADR-001]] do EdSP.

**Base técnica:** mecânicas portadas do [Clarity por Adam Brooks (dissimulate)](https://github.com/dissimulate/Clarity) sob licença MIT.

## Conteúdo desta pasta

| Arquivo | O que é |
|---|---|
| `v3.1.100.html` | Versão final, com todas as features. Abrir no navegador para experimentar. |
| `assets/` | Imagens (catálogo de árvores, temas, silhuetas, mapa corrigido, correções) |
| `README.md` | Este arquivo |

## Repositório git completo

**102 commits + 7 tags semver** capturando toda a evolução foram salvos como repo git em:

```
outputs/the-inclusionist-tracer.tar.gz
```

Esse arquivo está no diretório `outputs/` da sessão Claude (`C:\Users\candi\AppData\Roaming\Claude\local-agent-mode-sessions\…\outputs\`). Para usar:

```bash
# 1. Extrair
tar xzf the-inclusionist-tracer.tar.gz
cd inclusionist-repo/

# 2. Inspecionar histórico
git log --oneline           # 103 commits (initial + 102 versões)
git tag                     # 7 tags de marcos
git checkout v2.3.0-gag    # estado quando GAG foi introduzido
git diff v3.0.0 v3.1.100   # diff entre marcos

# 3. Subir para GitHub privado quando quiser
git remote add origin git@github.com:josedev/inclusionist-tracer.git
git push -u origin main --tags
```

## Tags / marcos canônicos

| Tag | Significado |
|---|---|
| `v1.0.0` | Primeira versão funcional |
| `v2.0.0` | Segunda major (refactor) |
| `v2.2.0-aaa` | **Introdução do WCAG 2.2 AAA** |
| `v2.3.0-gag` | **Introdução do Game Accessibility Guidelines** |
| `v3.0.0` | Terceira major |
| `v3.1.0` | Início da série de patches v3.1.x |
| `v3.1.100` | Versão final atual |

## O que The Inclusionist demonstra empiricamente

- **WCAG 2.2 (POUR)** — Perceptível / Operável / Compreensível / Robusto, todos os 4
- **Canvas com `role="img"` + `aria-label` + fallback `<p>`** (WCAG 1.1.1)
- **Operação 100% por teclado** usando `e.code` (WCAG 2.1.1) — funciona em layouts ABNT, QWERTY, alternativos
- **Controles remapeáveis** (GAG)
- **Paleta Okabe-Ito opcional** para daltonismo
- **`prefers-contrast: more` + `prefers-reduced-motion`** respeitados (WCAG 1.4.6, 2.3.1, 2.3.3)
- **Som como reforço, nunca requisito** (WCAG 1.4.2)
- **Pixel art preservada** em DOM via `image-rendering: pixelated`
- **Modo 2 jogadores** com rótulos textuais além de cor

## Ratificações pendentes (5)

Ver [[../../ADRs/ADR-001-engine-architecture#validation|ADR-001 §validation]]:

1. Lighthouse Performance ≥ 90 em emulação Mobile + 3G + CPU 4×
2. Teste em hardware real (Tablet Positivo Class 11.6", Chromebook escola pública)
3. Auditoria automatizada (axe-core, Lighthouse, WAVE)
4. Auditoria manual (NVDA + JAWS + VoiceOver desktop + VoiceOver iOS)
5. 5 crianças incluindo 1 com NEE relevante (Mom Test)

## Histórico de origem

As 102 versões originais (v1.html → v3.1.100.html) foram desenvolvidas em `72-Collections/AI/The Inclusionist/` ao longo de 2026-05-19 a 2026-05-23. Estão sendo preservadas lá como histórico iterativo. **Quando você quiser limpar:**

- Mover `pixel-art-sem-imagens-v*.html` para `72-Collections/Archive/The-Inclusionist-Iterations/`
- Manter apenas os marcos como referência rápida visível (v1, v2, v2.2.0-aaa, v2.3.0-gag, v3.0.0, v3.1.0, v3.1.100)
- O histórico completo já está preservado em git no `the-inclusionist-tracer.tar.gz`
