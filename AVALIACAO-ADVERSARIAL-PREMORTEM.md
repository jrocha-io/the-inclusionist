---
title: Avaliação adversária + premortem — The Inclusionist / EdSP
type: assessment
status: round-2
created: 2026-06-01
method: 3 subagentes independentes (licenças, red-team, premortem)
---

# Avaliação adversária + premortem

Resultado de um **ataque adversário** e um **premortem (dez/2026)** feitos por subagentes
independentes. Veredito convergente: **a constituição é excelente como norte de 10 anos e
fatal como lista de requisitos de MVP.** O risco nº 1 não é técnico — é **plataformização
prematura**: governança de 35 jogos sobre um protótipo de 1 arquivo nunca testado em tablet
real nem com criança real.

## A reformulação central (concilia tudo)

> **Separar NORTE (inegociável, 10 anos) de MVP (mínimo viável, 6 meses).** Os 10 pilares
> continuam sendo o **destino**. Mas o MVP precisa de **um subconjunto drasticamente menor**,
> senão nada é entregue. Isso honra os inegociáveis (seguem sendo a meta) e torna o MVP enviável.

## Top 10 ameaças (red-team)

| # | Ameaça | Sev | Condição de morte |
|---|---|---|---|
| 1 | **Solo dev × 35 jogos, infra-primeiro** | 🔴 | anos de plataforma, nada enviado, doadores somem |
| 2 | **PixiJS+WebGL/Tauri Mobile não testados no Positivo/Chromebook real** | 🔴 | o aparelho da missão não roda; descobre tarde |
| 3 | **Compliance contraditória; China inalcançável** | 🔴 | China real-name **conflita** com minimização COPPA/LGPD; 版号 inviável p/ solo |
| 4 | **Telemetria de crianças + dados abertos sem parceiro de pesquisa/jurídico** | 🔴 | 1 deanonimização = escândalo que mata a marca |
| 5 | **Alegar "WCAG 2.2 AAA + GAG complete" (hoje falso e auto-contraditório)** | 🔴 | auditor nórdico refuta em 20 min; credibilidade vai |
| 6 | **Sem plano de adoção escolar (BNCC/MDM/instalação/PNLD)** | 🟠 | jogo perfeito que ninguém instala = impacto zero |
| 7 | **Reescrever multiplayer LAN/telas separadas** | 🟠 | netcode pesado p/ cenário que a escola não monta |
| 8 | **Funding: doações→grants lentos vs. infra multi-ano** | 🟠 | sem dinheiro a curto prazo; grants exigem CNPJ/parceiro/histórico |
| 9 | **Língua de sinais por locale (6 línguas) + motor zdog do zero** | 🟠 | sinalizar 6 línguas distintas é programa de pesquisa |
| 10 | **BSL como "open source" + GPL dual-track por módulo + IP de arte IA** | 🟠 | rótulo afasta financiador FOSS; segregar módulos é imposto eterno |

### Contradições reais entre pilares (não só "tensões")
- **China real-name/anti-addiction (coleta MAIS PII de menores) × COPPA/LGPD/GDPR-K (coleta MENOS).**
  "Regra mais rígida vence" é **autocontraditório** aqui → exigiria **builds regionais
  mutuamente exclusivos**, o que **quebra** o "uma base PWA, nunca duplicar lógica" (P8).
- **Localização de dados China (PIPL) × dados abertos (P6c).** Anonimizar/agregar é escape do
  GDPR, **não** isenção automática do regime de exportação chinês.
- **AAA × 320×180 × paletas vivas** (o próprio CLAUDE.md §2.7 diz "não venda AAA em bloco";
  o README diz "AAA + GAG complete" → **os dois documentos se contradizem**).
- **Painel Libras 21:9 (+100px) × telas 16:9 reais:** num tablet/Chromebook 16:9 **não há
  largura física a "adicionar"** → ou o mundo encolhe (letterbox) ou rola. Repensar como
  **overlay que reflowa dentro de 16:9** (janela no canto na proporção legal), não +100px físicos.

## Premortem — causa de morte mais provável

**Morte por plataformização prematura:** trabalho de documento/governança expulsa progresso
enviável e validado; as horas finitas do professor-dev acabam antes de qualquer checagem de
realidade externa. **Já está acontecendo** — em 2026-06-01 produziu-se constituição + plano +
**reversão dupla** (PNG→dados→dados) enquanto o **jogo segue em v3.1.100** e o **único bug
crítico (B2)** segue aberto. O gradiente de incentivo aponta para docs (`[CLAUDE]`, infinito,
nunca bloqueado); a validação que mataria o projeto cedo se ele for morrer (hardware real,
5 crianças) é toda **`[JOSE]`-gated e toda aberta**.

### Indicadores de alerta (ranqueados)
1. **"Build bom atual" envelhece** (>3 semanas sem versão rodável enquanto o esforço vai p/ outro lugar).
2. **Backlog de validação `[JOSE]` congelado** (2+ meses sem fechar nenhum dos 5 gates do ADR-001).
3. **Re-litígio de decisões** já "ratificadas" (PNG↔dados já está em 2 reversões).
4. **Cadência de commits decai** (de ~diária p/ semanal p/ mensal).
5. **Repo nunca vai a público** (o tarball ainda não tem remote no GitHub).
6. **Razão doc/código** dispara (palavras de `.md`/semana ≫ linhas de jogo/semana).
7. **Bugs-bandeira intocados** (toast VLibras, B2) por várias sessões.
8. **Escopo cresce antes do slice fechar** (zdog Libras, Nórdicos, LAN MP construídos antes do Lúdico passar nos 5 gates).

### Ações preventivas AGORA (baratas, alto impacto)
1. **Sprint "validação primeiro" + congelar arquitetura.** Rodar os 5 gates do ADR-001 contra o
   **v3.1.100 existente** — vários **não** dependem do José: axe-core via Playwright + Lighthouse
   (4×CPU/3G) **rodam hoje** (`[CLAUDE]`). **Uma tarde com 1 tablet Positivo real** valida ou mata
   a premissa por ~custo zero.
2. **Congelar a constituição; regra "sem re-litígio".** Conflitos novos vão a `OPEN-QUESTIONS.md`,
   revisados **mensalmente**, nunca no meio do build. Mata o churn de "rodada 2/3".
3. **Adiar a reescrita PixiJS até a performance ser MEDIDA como insuficiente.** Não reescrever um
   build que funciona e já tem a11y conquistada com base numa hipótese não medida. (⚠️ revê a
   decisão "Por isso PixiJS" — ver abaixo.)
4. **Publicar o repo esta semana** (BSL-1.1). Cria superfície p/ Mom Test, contribuidores, legitimidade.
5. **Fechar B2** (persistência de remap) na próxima sessão (~30 min) — sinal "vivo e enviando".
6. **Time-box de 1 semana p/ a pesquisa de IP** (default já decidido: arte como dados/código).
7. **Um compromisso externo** (uma data real com ~5 crianças que o José já ensina, ou 1 deadline de edital).

## Escopo realista de 6 meses (o que deve ser VERDADE em dez/2026)

- **The Inclusionist em UM modo (Lúdico)** roda e é **verificado** em ≥1 tablet Positivo e ≥1
  Chromebook do governo reais.
- **Os 5 gates do ADR-001 FECHADOS** com números: Lighthouse ≥90 (4×CPU/3G), axe 0, 1 run em
  hardware real, 1 passada de leitor de tela (NVDA *ou* ChromeVox), **Mom Test com ~5 crianças
  (1 com NEE)**. *(Isto é o jogo inteiro de um tracer-bullet.)*
- **Repo público** (BSL-1.1) com README que um estranho roda.
- **v3.1.100 segue canônico e melhorando** (B2 corrigido; C1 legendas SFX; botões de toque). Sem
  meia-reescrita abandonada.
- **Declaração honesta de a11y publicada:** AAA onde alcançado, AA onde não, com evidência de auditoria.

### Cortar/adiar do MVP (continuam no NORTE)
| Item da visão | MVP | Porquê |
|---|---|---|
| Plataforma 35 jogos / governança EdSP | **adiar** (congelar constituição) | 1 jogo validado primeiro |
| Reescrita PixiJS (v4.0.0) | **adiar até medir** | não reescrever build a11y-ratificado por hipótese |
| zdog Libras 21:9 + línguas nórdicas | **cortar do MVP** | 2º motor antes de auditar o 1º; Libras-only depois |
| i18n nórdico | **adiar** (manter strings externalizadas) | ROI zero antes do lançamento BR |
| Multiplayer telas separadas + LAN | **cortar do MVP** | reescrita de netcode p/ slice de moedas |
| Tauri + Tauri Mobile | **adiar** (só PWA) | PWA cobre Chromebook (1ª classe) e Positivo |
| China (版号/PIPL/anti-addiction) | **cortar do MVP** | precisa de parceiro local que não existe |
| 1EdTech LTI + Caliper + xAPI | **adiar** (local-first, sem telemetria) | maior superfície de privacidade; nada a medir sem jogadores |
| Dados abertos (RN-01) | **adiar** | não há dados ainda; é política p/ um futuro |
| Grants (Rouanet/Ancine/FAPESP/Nórdicos) | **escolher UM, submeter UM** | forcing function, não pesquisar nove |

## Melhorias sugeridas aos pilares (não silenciosas — você decide)
- **P2/README:** trocar "AAA + GAG complete" por **"WCAG 2.2 AA conformante; AAA onde viável,
  documentado por critério; GAG: N/M"**. Corrigir a contradição README × CLAUDE.md.
- **P4:** rebaixar **China de pilar a "Fase-N, requer parceiro local"**; fazer **LGPD+COPPA a
  espinha real**. Manter só as partes portáveis (residência plugável, trilha de conteúdo).
- **P5:** repensar geometria do painel Libras (overlay que reflowa em 16:9); confirmar métrica NBR 15290.
- **P6:** **sem telemetria pessoal no MVP**; LTI/xAPI/Caliper + dados abertos só com **parceiro
  universitário** que detenha o IRB/ética + privacidade diferencial.
- **P7/P9:** rebaixar multiplayer telas-separadas/LAN a **trilha de P&D futura**; manter 2P local atual.
- **P8:** **PWA-first** confirmado; Tauri/Tauri Mobile adiados.
- **P10:** considerar **uma licença só** (GPL-3.0 desde já maximiza elegibilidade FOSS e remove o
  imposto do dual-track); BSL agrega ~zero p/ jogo grátis que ninguém revende.
- **Arte:** **usar a arte Nanobanana do próprio José** (IP-limpa) como referência → elimina o risco de IP dos geradores.

## Respostas do José (rodada 4)
- **PixiJS:** **NEGADO o adiamento** — nova versão usando PixiJS é o pedido. *Mitigação acordada:*
  validar a perf **cedo** nos **2 tablets reais** que o José já tem (1 baixo custo + 1 do governo/pandemia).
- **Licença:** **GPL-3.0 desde já** (sem BSL/dual-track). ✅
- **Tauri / multiplayer / China / Nórdicos:** **fora do MVP** (seguem no Norte). ✅
- **Escopo 35 jogos infra-primeiro:** aceito — foco em 1 jogo primeiro. ✅
- **Hardware:** **2 tablets adquiridos** → o gate "testar no Positivo real" deixa de ser bloqueio. ✅
- **Compliance:** **prioridade = lei local da região**; resto = meta conforme possível. Identidade do
  **adulto** via gov (.gov BR; RNV só na China) → **não contradiz LGPD/COPPA** (consentimento do responsável). ✅
- **Telemetria/dados:** **sem dados abertos**; só **anônimos via parceria de renome**. ✅
- **a11y:** **remover "complete"** já; recolocar só com o MVP pronto e validado. ✅
