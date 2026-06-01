---
title: Pilares inegociáveis — projeto EdSP (The Inclusionist é o 1º MVP)
type: constitution
status: active
created: 2026-06-01
updated: 2026-06-01
authors: [José, Claude]
supersedes: "CLAUDE.md §1 (identidade 'zero assets binários' revogada)"
---

# Pilares inegociáveis

Esta é a **constituição** do projeto de jogos educativos (35+ jogos; The Inclusionist é o
1º MVP). Os 10 pilares abaixo são **inegociáveis**. Quando dois conflitarem, vale a regra
**mais rígida / mais protetiva** (especialmente em dados de crianças). Tudo aqui foi
analisado para apontar **tensões** e **decisões pendentes** — marcadas com ⚠️.

> Confiança jurídica: as sínteses de leis (China/PIPL, GDPR/Nordic, COPPA, LGPD, normas
> ABNT, fontes de fomento) são **resumos de engenharia, não aconselhamento jurídico** —
> validar com jurídico antes de publicar/captar. Marcado onde a confiança é menor.

---

## P1 — Rodar em hardware de escola pública brasileira
**Regra:** funcionar em **tablets Positivo** e **Chromebooks do governo**.
**Implicação:** orçamento de performance agressivo (CPU/GPU/RAM baixos), bundle pequeno,
60 fps no canvas 320×180 escalado, **PWA-first** (Chromebook trata PWA como cidadão de
1ª classe). Nada de framework pesado no caminho crítico.
**⚠️ Tensão com P8 (Electron):** Electron empacota Chromium (~150 MB, RAM-hungry) — péssimo
em hardware fraco. *Resolução:* PWA é a base universal; Electron só no **desktop** robusto.
Avaliar **Tauri** (≈3–10 MB, usa o webview do SO) como alternativa leve ao Electron.

## P2 — Acessibilidade (WCAG 2.2 AAA + GAG)
**Regra:** AAA aspiracional honesto (marcar onde só dá AA) + GAG completo. **Libras roda
em motor à parte (zdog)**, não acoplado ao jogo.
**Implicação:** **DOM-first** para texto/UI (contraste/zoom AAA difíceis em pixel no canvas);
canvas com `role=img` + fallback; teclado 100% por `e.code`; `prefers-*` respeitados.
**⚠️ Tensão com P5 (320×180):** texto AAA (1.4.4 zoom 200%, 1.4.6 contraste 7:1) é
incompatível com glifos pixel minúsculos no canvas → **texto sempre no DOM**, nunca rasterizado.

## P3 — Internacionalização (i18n)
**Regra:** servir de **portfólio para países nórdicos** → i18n de verdade.
**Implicação:** zero strings hardcoded; catálogos de locale (mín.: `pt-BR`, `en`, `sv`,
`nb`, `da`, `fi`, `is`); formatação de número/data por locale; fontes com `å ä ö ø æ`;
`lang`/`dir` corretos. **Libras ≠ universal:** o motor de sinais (zdog) deve ser
**locale-aware** (Libras p/ BR; línguas de sinais nórdicas p/ o portfólio) — ver P5.

## P4 — Conformidade regulatória (mercados mais exigentes)
**Regra:** atender critérios de **jogos educativos da China e países nórdicos** (os mais
exigentes) + **LGPD/COPPA**. **Prioridade (rodada 4): a LEGISLAÇÃO LOCAL da região de implantação vence sempre**; os demais
regimes são **meta, conforme possível**. *(Substitui o antigo "regra mais rígida vence" — que era
autocontraditório, ex.: real-name da China × minimização COPPA. Também resolve o conflito C1 do
red-team: compliance é por região, não um superset global impossível.)*
**Implicação (o que o código garante):** *compliance-ready* — flags de tempo de jogo
(anti-addiction da China p/ menores), trilha de auditoria de conteúdo, residência de dados
por região (PIPL exige dados na China), verificação de idade/consentimento de responsável,
ausência de conteúdo politicamente sensível/superstição/violência.
**⚠️ Limite honesto:** o **código** pode ser conformável, mas **aprovação legal é externa** —
ex.: China exige licença de publicação **版号/ISBN** (NPPA) e localização de dados; uma
empresa que "copie e implante" ainda precisa dessas aprovações. Não vendemos "aprovado na
China", vendemos "arquitetado para ser aprovável". *(confiança: média — validar jurídico)*
**Decisão rodada 2:** "aprovável" é uma **META documentada**; só comunicaremos publicamente
que o produto é "aprovável na China" quando houver **parceria local real** que o ateste.
**Modelo de identidade (rodada 4):** quem **cadastra** o jogo para a criança é o **adulto**
(professor/responsável), via **sistema do governo** — no Brasil, registro no **.gov** (quando
houver parceria); na China, **Real-Name Verification chinês, apenas dentro da China**.
**A verificação é do ADULTO, não da criança**, e **delegada ao governo** (não armazenamos a
identidade — recebemos no máximo um token/booleano de consentimento). **Não contradiz LGPD/COPPA:**
identificar/consentir o adulto é exatamente o que a COPPA exige (consentimento verificável do
responsável) e o PII da criança é minimizado. *Ressalvas:* o anti-addiction chinês (real-name do
MENOR) fica **fora do MVP** (China = meta); transferência transfronteiriça exige permissão da **origem E do destino** (ver RN-04).
**Regras inegociáveis (rodada 4):** **RN-02** — *nunca* armazenar a identidade do adulto no jogo
(delegar ao gov; guardar no máximo um **token/booleano de consentimento**). **RN-03** — real-name
**só dentro da China**; lei local vence; anti-addiction de **menor** (China) **fora do MVP**.
**RN-04 (residência de dados)** — telemetria de jogadores de um país **fica em servidores daquele
país**, salvo se o país **permitir** armazenar em outro.

## P5 — Pixel art 320×180 (16:9); 3D via zdog; painel de Libras 420×180 (21:9)
**Regra:** base **320×180 16:9** em HTML/Canvas; quando 3D for inegociável, **zdog** (leveza).
Com **Libras ligada**, a tela expande para **420×180 (21:9, ultrawide)** via **painel
lateral** de **100 px**; o intérprete pode **entrar 5 px** na área do jogo quando preciso.
**Matemática do painel (verificada):**
- Painel = 100 px de 420 → **23,81%** da largura; altura **180/180 = 100%**.
- Com os 5 px de avanço do intérprete → 105 px / 420 = **25,0%** da largura.
- **Base legal (BR) — CONFIRMADO (rodada 3):** **ABNT NBR 15290:2005** define a janela de
  Libras com **altura ≥ ½ da tela** e **largura ≥ ¼ da tela**. Nosso painel: **25,0% largura**
  (com o avanço de 5 px) e **100% altura** → **atende**. Também Lei 10.436/2002, Dec. 5.626/2005,
  LBI 13.146/2015.
  - **Regras extras da norma (incorporar):** (i) **nada pode ser sobreposto à janela do
    intérprete** → o avanço de 5 px é do **intérprete SOBRE o jogo**, nunca o jogo sobre o
    intérprete; (ii) **pele/roupa/cabelo do intérprete contrastantes** entre si e com o fundo
    (vale para o avatar zdog). *(confiança: alta p/ a métrica; checar normas de streaming/Ancine
    se for TV/VoD.)*
**Implicação:** layout que **expande lateralmente** sem reflowar o jogo (o mundo continua
320 de largura útil; o painel adiciona 100). O motor de sinais é **zdog separado** (P2).
**✅ Confirmado (rodada 4): 420×180 (21:9 lateral).** Não é painel inferior. *Nota de render:*
em hardware físico 16:9 o 21:9 **letterboxa** (barras) — comportamento aceito; alternativa futura:
overlay que reflowa dentro de 16:9 na proporção legal (¼ largura × ½ altura).

## P6 — Telemetria padronizada + privacidade rígida
**Regra:** ecossistema **1EdTech** + **xAPI Serious Games Profile** para rastrear interações.
(a) **nunca** capturar dado não permitido; (b) **E2E** onde exigido; (c) captura comum
permitida para melhoria (privada, não divulgada) e pesquisa (divulgada **aberta**) conforme
China + Nórdicos + BR + EUA — **a lei local da região de implantação vence; os demais = meta conforme possível** (rodada 4).
**Confirmado (rodada 3): "util" = LTI 1.3.** Stack 1EdTech: **LTI 1.3** (embarque em LMS) +
**Caliper Analytics** (eventos) + **xAPI** Serious Games Profile (statements).
**Síntese "mais rígida vence" (tratar TODO usuário como criança):**
| Eixo | Regra que vence | Efeito no código |
|---|---|---|
| Consentimento | COPPA + PIPL (<14 sensível) | consentimento verificável do responsável **antes** de qualquer dado pessoal |
| Minimização | GDPR/LGPD | **local-first**; padrão = nada pessoal sai do dispositivo |
| Residência | **RN-04** (r4) | dados ficam **no país de origem**; export só se a origem permitir (origem **E** destino) |
| Publicidade/perfil | COPPA/GDPR-K | **proibido** perfilar criança / publicidade comportamental |
| Dados (pesquisa) | **RN-01** (r4) | **sem dados abertos**; só anônimo via parceria de renome; nunca PII |
| Direitos | GDPR/LGPD | acesso/eliminação; logs de consentimento |
**⚠️ Conflito 6c × P4 × privacidade:** "divulgar dados abertos para pesquisa" **não pode**
incluir nada identificável de crianças. **Regra ratificada RN-01 (ATUALIZADA rodada 4): NADA de
dados abertos.** Apenas **dados anônimos**, processados **via parceria com instituições de
renome** (que detêm IRB/ética) — **nunca publicação aberta** e **nunca PII de criança**. Dado
bruto permanece local/na região. *(Substitui a versão "dados abertos agregados" da rodada 2 — o
premortem mostrou que dado aberto de criança = risco de escândalo que mata a marca.)*

## P7 — Multiplayer em viewports separados (sem split-screen)
**Regra (esclarecida rodada 3):** **uma única página HTML** exibindo **até 4 viewports de jogo
independentes** (cada um **320×180**, ou **420×180** com Libras), **cada jogador com sua própria
câmera** seguindo seu personagem — **não** é split-screen de câmera única, **nem** multi-monitor,
**nem** multi-dispositivo. Todos compartilham **uma só simulação em memória** (mesmo processo) e
**interagem no mesmo mundo** (neste demo, ao menos **se veem**). 2P = teclado; 4P = controles.
**Implicação:** **SEM netcode** para o jogo local — apenas **N viewports** renderizando o mesmo
estado + **roteamento de input por jogador**. Muito mais simples do que se supunha.
**Relação com P9:** o **LAN** (multi-dispositivo) é a **extensão futura** do mesmo modelo (cada
dispositivo = 1 viewport sincronizado pela rede); aí entra a camada de sync. No MVP, P7 é
**local, mesma página**. *(Isto rebaixa muito a ameaça H1 do red-team — não é projeto de netcode.)*

## P8 — Offline (PWA + Tauri + Tauri Mobile)
**Regra:** rodar offline: **PWA** (navegador) + **Tauri** (desktop) + **Tauri Mobile** (mobile).
*(Decisão rodada 2: Electron/Capacitor → **Tauri / Tauri Mobile** por leveza — alinha P1.)*
**Matriz de empacotamento:**
| Alvo | Empacotamento | Nota |
|---|---|---|
| Chromebook gov | **PWA** | ChromeOS = PWA 1ª classe |
| Tablet Positivo (Android) | **PWA** ou **Tauri Mobile** | PWA p/ leveza; Tauri Mobile p/ loja/nativo |
| iOS | **Tauri Mobile** | — |
| Desktop Win/Mac/Linux | **Tauri** | usa o webview do SO (~MBs, não ~150 MB do Electron) |
**Implicação:** **uma base PWA** (service worker, app-shell cache, sem rede obrigatória);
Tauri/Tauri Mobile **embrulham a mesma PWA**. Nunca duplicar lógica por alvo.
**⚠️ Risco (p/ red-team):** Tauri usa o **webview do SO** → variação entre versões; o
**Android WebView antigo** dos tablets Positivo pode faltar APIs (ex.: WebGL2, OffscreenCanvas).
Testar em hardware real (P1) e cravar um **webview mínimo** suportado.

## P9 — Multiplayer em LAN + telemetria store-and-forward
**Regra:** multiplayer por **LAN**; telemetria **sincroniza em segundo plano**, com **fila
de envio** e **disparo em lote quando a internet volta**.
**Implicação:** jogar **não** exige internet (LAN/local). Telemetria → fila em **IndexedDB**
+ **Background Sync**; lote ao reconectar; respeita P6 (consentimento/região/cripto).
Reusa a camada de sync do P7.

## P10 — Código aberto + gratuito + fontes de fomento
**Regra (atualizada rodada 4):** **código sob GPL-3.0 desde já** (sem BSL, sem dual-track —
decisão do José); **arte NÃO-FOSS** (ver flag 3); jogo **gratuito**. Bases fora dos jogos = **MIT**
(p/ sponsors). Fomento: PIX/BMC/GitHub Sponsors → depois Rouanet, Lei de Informática,
FAPESP, FINEP, CNPq, Ancine/FSA, fundações de bancos/empresas, BNDES, PNLD (BR);
Nordisk Kulturfond, programas da UE, filantropia EdTech, parcerias universitárias (Nórdicos).
O jogo **não pode** ter empecilho para se adequar a essas fontes.
**⚠️ Flags críticos:**
1. **✅ Licença do código = GPL-3.0 desde já (rodada 4).** O José adotou **uma licença só,
   GPL-3.0, desde o início** — **abandona o BSL** e o dual-track por módulo (remove o "imposto
   eterno" de segregação e **maximiza elegibilidade FOSS** para editais UE/compras públicas).
   A **arte** é tratada à parte (**não-FOSS** — ver flag 3). *(Substitui a decisão BSL-padrão da
   rodada 3; é uma reversão explícita do José.)*
2. **Ancine/FSA** financiam **audiovisual** — enquadrar via animação/conteúdo (Libras) do jogo.
   **PNLD** tem critérios didáticos + acessibilidade (atendemos com folga). **Rouanet** exige
   enquadramento cultural. *(confiança: média — confirmar elegibilidade de "jogo" caso a caso)*
3. **Arte = dados/código (resolvido) + ARTE NÃO-LIVRE (rodada 3).** A arte é dados/código
   (motor GPL-clean), baseada em **referências de IA**. O José exige que **personagens NÃO sejam
   de uso livre** (evitar nossos personagens em produtos adultos/indevidos). **⚠️ Tensão dura:**
   licença **FOSS/GPL não pode restringir campo de uso** (liberdade 0 / OSI nº 6) → arte sob GPL =
   qualquer um usa em qualquer coisa. Logo **"arte não-livre" ⇒ a ARTE é um recorte NÃO-FOSS**,
   separado do código FOSS. Proteção (ver `LICENCAS-GERACAO-IMAGEM.md`): (a) **marca registrada**
   dos personagens (nome + design) — alavanca mais robusta, independe de copyright; (b) **licença
   de arte própria** (proíbe uso adulto/depreciativo); (c) **autoria humana** no algoritmo
   (fortalece copyright). **Ressalva:** arte derivada de IA pode ser **incopyrightável** → licença
   restritiva fraca; a **marca** é o esteio. **Resultado: "código FOSS + arte não-livre"** — limita
   "terceiro implanta TUDO", aceitável dado o requisito de proteção infantil.
   **Nuance (rodada 4):** estratégia **condicionada à aceitação das fontes de fomento** (se um
   financiador exigir arte livre, reavaliar caso a caso); e a **marca é SELETIVA** — **nem todo
   personagem** será registrado e **nem todo jogo** precisa de arte registrada.

---

## Norte (inegociável) × MVP (mínimo viável) — rodada 2

Avaliação adversária + premortem (subagentes, 2026-06-01) em
**`AVALIACAO-ADVERSARIAL-PREMORTEM.md`**. Veredito: estes 10 pilares são um **norte de 10 anos**
excelente, mas **fatais como requisitos de MVP** (plataformização prematura por um dev solo).

> **Regra de ouro:** os 10 pilares seguem **inegociáveis como DESTINO**. O **MVP** entrega um
> **subconjunto mínimo** e adia/corta o resto (sem abandoná-lo). Ver a tabela "Cortar/adiar do
> MVP" no relatório. **Melhorias sugeridas** (você decide) também estão lá — incluindo: corrigir
> a alegação "AAA+GAG complete" (hoje falsa) → "AA + AAA onde viável"; rebaixar **China** a
> "Fase-N c/ parceiro"; **sem telemetria pessoal no MVP**; **PixiJS é o motor escolhido** (decisão do
> José — sobrepõe a recomendação de adiar; validar a perf **cedo** nos 2 tablets reais que ele já
> tem); **GPL-3.0 desde já** (adotado, sem BSL); usar a **arte
> Nanobanana do próprio José** (IP-limpa) como referência (elimina o risco de IP dos geradores —
> ver `LICENCAS-GERACAO-IMAGEM.md`).

## Conflitos entre regras — resolução

| Conflito | Regras | Resolução |
|---|---|---|
| Empacotamento pesado × hardware fraco | P8 × P1 | ✅ Tauri/Tauri Mobile + PWA base (rodada 2) |
| Dados (pesquisa) × privacidade infantil | P6c × P4/P6 | **sem dados abertos** (RN-01 r4); só anônimo via parceria; nunca PII |
| Localização de dados (China) × dados abertos | P4 × P6c | dados crus ficam na região; aberto = agregado global |
| Texto AAA × pixel 320×180 | P2 × P5 | texto no **DOM**, nunca no canvas |
| BSL "aberto" × editais FOSS | P10 × P10 | ✅ GPL-3.0 desde já (sem BSL) — resolve elegibilidade FOSS (r4) |
| Assets IA × abrir/implantar/fomento | P10 × arte | ✅ arte como dados/código (rodada 2); IP do gerador sob pesquisa |
| Split-screen atual × telas separadas | P7 | reescrever modelo MP (host + clientes/LAN) |
| Libras 21:9 × base 16:9 | P5 | painel aditivo de 100 px; jogo mantém 320 útil |

---

## Stack técnica ratificada (rodada 2)

- **Renderer:** **PixiJS** (WebGL/Canvas2D fallback) para o jogo + **DOM-first** para texto/UI
  (resolve P2 AAA × P5 320×180 — texto nunca é rasterizado no canvas).
- **Empacotamento:** **PWA** (base) + **Tauri** (desktop) + **Tauri Mobile** (mobile).
- **Arte:** **dados/código procedural** (1 algoritmo por tipo de cabelo/corpo/roupa),
  com **spritesheets em camadas do PixelLab apenas como referência de design**; forma = camada,
  cor = palette-swap por chave. **Nenhum PNG embutido** no jogo (GPL-clean).
- **Multiplayer:** **telas separadas** (sem split-screen) — host + clientes (P7) sobre LAN (P9).
- **Licenciamento (r4):** **código GPL-3.0 desde já** (sem BSL, sem dual-track); **arte não-FOSS**
  (marca registrada dos personagens + licença de arte própria).

## Decisões ratificadas (rodada 2, 2026-06-01)
- ✅ **Arte como dados/código** (reverte adoção de PNG). PixelLab/Magnific = referência de design.
- ✅ **Tauri/Tauri Mobile** no lugar de Electron/Capacitor.
- ✅ **RN-01 (r4):** **sem dados abertos**; só dados **anônimos via parceria de renome**.
- ✅ **GPL-3.0 desde já** (r4; sem BSL, sem dual-track).
- ✅ **China "aprovável" = META**; só comunicar com parceria real.
- ✅ **PixiJS + DOM-first**; **nova versão usando PixiJS** (r4 — sobrepõe a recomendação de adiar).
- ✅ **Prioridade: lei local da região** (r4; substitui "regra mais rígida vence").
- ✅ **Identidade do ADULTO via gov** (.gov no BR; RNV só dentro da China) — não contradiz LGPD/COPPA (r4).
- ✅ **Remover "complete"** da alegação de a11y até o MVP estar pronto (r4).
- ✅ **2 tablets reais adquiridos** p/ validação no hardware-alvo (r4).
- ✅ **Fora do MVP (seguem no Norte):** Tauri/Tauri Mobile, multiplayer em viewports separados, China, Nórdicos (r4).
- ✅ **Multiplayer (viewports separados)** = trilha futura; abolir split-screen quando voltar.

## Decisões pendentes (precisam de você)

1. **✅ RESOLVIDO (rodada 2) — arte como dados/código.** José aceitou reverter para arte
   **gerada por algoritmo** (arrays + paleta hex), **não** PNG embutido.
   *Definição de "procedural" do José:* escrever **um algoritmo por tipo** de cabelo/corpo/roupa
   que produz o sprite **dentro de um spritesheet hipotético**, tomando como **base de design**
   um conjunto de **spritesheets EM CAMADAS gerado pelo PixelLab** — a saída no jogo é
   dados/código (GPL-clean). Forma = camada; cor = palette-swap por chave (doc 02).
   **⚠️ Subtarefa de IP (em pesquisa):** mesmo convertendo a imagem em algoritmo, pode haver
   responsabilidade por **derivar da expressão** gerada pelo serviço (não a "ideia", que não é
   protegível, mas a expressão específica). → **pesquisar a licença** de PixelLab, Magnific,
   ComfyUI, Higgsfield e afins. Ver **`LICENCAS-GERACAO-IMAGEM.md`**.
2. **✅ RESOLVIDO (r3):** "util" = **LTI 1.3** + Caliper + xAPI confirmados. 
3. **✅ RESOLVIDO (r3):** **BSL 1.1 é o PADRÃO**; variantes/módulos **FOSS (GPL-3.0)** criados **sob demanda** apenas para editais que exijam FOSS.
4. **✅ RESOLVIDO (r3):** métrica **¼ largura × ½ altura** confirmada (ABNT **NBR 15290:2005**); o painel atende. Incorporar regras extras da norma (sem sobreposição na janela; contraste do avatar). (¼ × ½) p/ travar o layout.
5. **✅ RESOLVIDO (r3):** "telas separadas" = **multi-viewport numa única página** (local, mesma simulação), **não** multi-monitor/LAN no MVP; LAN = extensão futura (P9). Ver P7.
6. **🟡 ABERTO (r4) — arte não-livre (ACEITA, condicional):** José aceitou **se as fontes de
   fomento aceitarem** "código FOSS + arte não-FOSS"; **marca SELETIVA** (nem todo personagem/jogo
   registrado). Ações: (a) **verificar com cada financiador** se aceita arte não-FOSS; (b) confirmar
   licença do gerador (PixelLab) p/ software grátis + redistribuição da arte derivada; (c) montar
   plano de marca seletivo. Ver `LICENCAS-GERACAO-IMAGEM.md`.
