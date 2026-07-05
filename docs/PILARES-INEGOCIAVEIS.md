---
title: Pilares inegociáveis — a constituição do EdSP (The Inclusionist é o 1º MVP)
type: constitution
status: active
---

# Pilares inegociáveis (índice-constituição)

Os **10 pilares** são a **constituição** do projeto (35+ jogos; The Inclusionist é o 1º MVP). São **inegociáveis como
DESTINO**. Este arquivo é o **índice**: os 10 princípios em uma linha + onde vive o detalhe. Nada de conteúdo
duplicado — cada pilar aponta pra sua casa.

> **Onde vive o detalhe** (o PILARES foi decomposto):
> - **Regras testáveis** (limiares/thresholds) → [`1-Discovery/NFR.md`](1-Discovery/NFR.md).
> - **Análise jurídica/compliance** → [`research/compliance-legal.md`](research/compliance-legal.md).
> - **Decisões ratificadas** (com fundamento, fonte, status) → [`REGISTRO-DE-DECISOES.md`](REGISTRO-DE-DECISOES.md);
>   as pesadas (com alternativas) são YADR ADRs em [`2-Architecture/adr/`](2-Architecture/adr/).

## Os 10 pilares

1. **Hardware de escola pública BR** — roda em tablet Positivo + Chromebook do governo (perf agressiva, PWA-first).
2. **Acessibilidade** — WCAG 2.2 + GAG; AAA aspiracional honesto (marcar onde só dá AA); texto sempre no DOM.
   Libras em motor à parte.
3. **i18n** — de verdade (portfólio nórdico): zero strings hardcoded; pt base → en/es → nórdicos.
4. **Conformidade** — LGPD/COPPA/China/Nórdicos; **a lei local da região de implantação vence**, o resto é meta.
5. **Pixel grid 320×180** (16:9); painel de Libras 420×180 (21:9), ≥ ¼ largura × ½ altura (ABNT NBR 15290).
6. **Telemetria padronizada + privacidade rígida** — 1EdTech (LTI 1.3) + Caliper + xAPI; tratar todo usuário como
   criança; sem dados abertos de criança.
7. **Multiplayer em telas separadas** (sem split-screen) — N viewports, uma simulação, sem netcode no MVP.
8. **Offline** — PWA (base) + Tauri/Tauri Mobile; nunca duplicar lógica por alvo.
9. **LAN + telemetria store-and-forward** — jogar não exige internet; fila + envio em lote ao reconectar.
10. **Aberto + gratuito + fomento** — código **GPL-3.0 desde já**; **arte NÃO-FOSS** (marca seletiva); jogo gratuito.

## Regra de ouro — Norte × MVP

Os 10 são **norte de 10 anos**, mas **fatais como requisitos de MVP** (plataformização prematura por um dev solo —
premortem em [`research/AVALIACAO-ADVERSARIAL-PREMORTEM.md`](research/AVALIACAO-ADVERSARIAL-PREMORTEM.md)). O **MVP**
entrega um **subconjunto mínimo** e adia/corta o resto **sem abandoná-lo**. Ex.: China rebaixada a "Fase-N com
parceiro"; sem telemetria pessoal no MVP; "AAA+GAG complete" → "AA + AAA onde viável".

## Conflitos entre pilares — resoluções (síntese)

| Conflito | Pilares | Resolução |
|---|---|---|
| Empacotamento pesado × hardware fraco | 8 × 1 | Tauri/Tauri Mobile + PWA base (não Electron) |
| Dados de pesquisa × privacidade infantil | 6 × 4 | sem dados abertos (RN-01); só anônimo via parceria; nunca PII |
| Texto AAA × pixel 320×180 | 2 × 5 | texto no **DOM**, nunca rasterizado no canvas |
| Editais FOSS × proteção de personagens | 10 | **código GPL-3.0 + arte não-FOSS** (marca registrada seletiva) |
| Split-screen × telas separadas | 7 | N viewports numa página, uma simulação (sem netcode no MVP) |
| Libras 21:9 × base 16:9 | 5 | painel lateral aditivo de 100px; jogo mantém 320 útil |
