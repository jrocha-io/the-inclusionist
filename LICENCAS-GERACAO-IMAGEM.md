---
title: Licenças de geradores de imagem por IA — compatibilidade com nosso caso
type: research
status: draft (validar com jurídico)
created: 2026-06-01
---

# Licenças de geração de imagem por IA × nosso caso

**Nosso caso:** jogo educativo **gratuito, código aberto sob GPL-3.0 desde já** (sem BSL); **arte
não-FOSS** (ver seção própria). A arte é **dados/código** (arrays + paleta hex), **não PNG**. Fluxo:
**IA gera spritesheet de referência → humano escreve algoritmo que reproduz arte similar como
dados → repo público → terceiros (inclusive empresas China/Nórdicos) podem copiar e implantar.**

> ⚠️ **Não é parecer jurídico** — é avaliação de risco de engenharia sobre o texto dos ToS.
> Itens ⚖️ exigem advogado de PI na(s) jurisdição(ões).

## Dois princípios que decidem tudo

**1. Ideia × expressão.** Copyright protege **expressão específica**, nunca ideia/estilo/método.
Um *estilo* de pixel art (ex.: "slime verde 16×16, quica em 4 frames") **não** é protegível; o
**arranjo específico de pixels** de uma imagem gerada **pode** ser — *se* alguém detém copyright
nela (ver princípio 2). → **Re-derivar** o look com pixels próprios = copiar **ideia** (baixo
risco). **Pixel-tracing 1:1** (amostrar os pixels exatos) = copiar **expressão** (risco). ⚖️
**Regra dura para o time: nunca pixel-tracing 1:1.** Reimplementar o *estilo* como dado original.

**2. "Saída de IA pode não ter copyright" — corta dos dois lados.** O US Copyright Office (2025;
*Thaler*; *Zarya*) entende que imagem puramente gerada por prompt **não tem autoria humana → sem
copyright**. A favor: se a referência não tem copyright, não há o que infringir (resta só o
**contrato**/ToS). Contra: a sua arte-dado derivada de IA também é **fraca em proteção** — um
terceiro que copie o repo não é facilmente barrável (mas o **código** continua protegido sob
BSL/GPL). A armadilha: o **contrato (ToS) obriga você mesmo quando o copyright não** (ex.: "você
é dono da saída" **e** "não pode usar a saída para treinar/competir" coexistem).

## Veredito por serviço (para o NOSSO fluxo)

| Serviço | Dono da saída | Redistribuir em repo público | Restrição derivada/competir | Indenização | Veredito |
|---|---|---|---|---|---|
| **PixelLab.ai** | **Você** | **Sim** ("usar, modificar e distribuir … para qualquer fim") | só não **treinar modelo** com as imagens | nenhuma | 🟢 **SEGURO** (melhor encaixe contratual) |
| **ComfyUI + SDXL/SD1.5** (Open RAIL-M) | Você | Sim | só uso-proibido (ilegal/nocivo); sem trava de receita | nenhuma | 🟢 **SEGURO** (auto-hospedado) |
| **ComfyUI + FLUX.1 [schnell]** (Apache 2.0) | Você | Sim | nenhuma | nenhuma | 🟢 **SEGURO** (Apache = compatível GPL) |
| **Scenario.gg** | **Cedido a você** | Sim | base: sem trava | — | 🟢 **SEGURO** (focado em game asset) |
| **Adobe Firefly** (pago) | Uso comercial | Sim | padrão | ✅ **SIM (indeniza!)** | 🟢 **SEGURO + único com indenização** |
| **Magnific/Freepik** (pago) | Você | Sim, mas saída IA **excluída** da proteção legal deles | padrão | parcial | 🟡 **RISCO** — ToS ao vivo bloqueou fetch; **reler** ⚖️ |
| **Leonardo / Recraft** | pago: você / **free: o serviço (público)** | pago: sim / **free: não** | padrão | — | 🟡 **só no plano pago** (free = AVOID) |
| **SD 3/3.5** (Stability Community) | Você | Sim | **licença morre acima de US$1M/ano** | — | 🟡 **RISCO p/ 3º deploy** (trava de receita viaja com o modelo) |
| **Midjourney** | Você (>US$1M exige Pro) | Sim | trava US$1M; **zero indenização** | nenhuma | 🟡 **RISCO** (trava de receita) |
| **OpenAI gpt-image/DALL·E** | Cedido a você | Sim | políticas de uso | nenhuma | 🟡 **OK só como referência** (cessão pode ser "vazia") |
| **FLUX.1 [dev]** (BFL NC) | saída usável, **modelo não-comercial**; você indeniza a BFL | modelo não p/ deploy comercial | **não treinar/competir** | você→BFL (unilateral) | 🔴 **EVITAR** (3º não pode rodar o modelo) |
| **Higgsfield.ai** | licença **perpétua sobre seus inputs E outputs** p/ treinar | sem permissão explícita | ampla | você→empresa (unilateral) | 🔴 **EVITAR** |

## Bottom line para nós

1. **O passo "referência → algoritmo de dados escrito à mão" é a nossa melhor defesa jurídica** —
   ele copia a **ideia/estilo** (não protegível), não a **expressão**. *Regra dura: nunca
   pixel-tracing 1:1; reimplementar o look como dado original; registrar qual ferramenta/plano
   gerou cada referência.*
2. **Stack recomendada** (sobrevive ao teste "empresa China/Nórdicos copia e implanta"):
   **PixelLab.ai**, **SDXL/SD1.5**, **FLUX.1 schnell (Apache)**, **Scenario.gg**. Se houver verba
   p/ 1 ferramenta indenizada, **Adobe Firefly**.
3. **Evitar termos com trava de receita** num repo público (SD3/3.5, Midjourney) e **FLUX dev /
   Higgsfield**.
4. **🟢 Atalho que já temos:** a arte **Nanobanana do próprio José** já é **IP-limpa e autorizada**
   (CLAUDE.md §2.11). Usá-la como referência **elimina por completo** a questão de IP dos geradores.
   *Recomendação do red-team: começar por ela.*

## Estratégia de licença da NOSSA arte (requisito: arte NÃO-livre)

O José exige que **nossos personagens NÃO sejam de uso livre** (ex.: não aparecerem em produtos
adultos). **Conflito fundamental com FOSS:** uma licença **FOSS/GPL não pode restringir campo de
uso** (liberdade 0; OSI nº 6 "sem discriminação de área de atuação"). Se a arte-dado estiver no
repo sob GPL, **qualquer um pode usá-la para qualquer fim**. Não dá para ter, ao mesmo tempo,
arte **(i) FOSS** e **(ii) com uso restrito**.

**Decisão:** o projeto será **"código FOSS (GPL-3.0) + ARTE não-FOSS"** — **condicionado à
aceitação das fontes de fomento** (se um financiador exigir arte livre, reavaliar caso a caso) e
com **marca SELETIVA** (nem todo personagem/jogo será registrado). Mecanismos, do mais robusto ao
mais fraco:
1. **Marca registrada (trademark)** dos personagens (nomes + design assinatura). **Esteio da
   proteção** — barra uso que cause confusão/diluição da marca, **independe de copyright** (logo
   sobrevive à incopyrightabilidade de saída de IA).
2. **Licença de arte própria (não-FOSS)** sobre os **dados de arte** (sprite/paleta) e/ou os
   **algoritmos de composição de personagem**: proíbe uso adulto/depreciativo, exige atribuição,
   veda sublicenciamento aberto. Mantém o **motor** FOSS e isola a **arte** num recorte restrito.
3. **Autoria humana** no algoritmo procedural: quanto mais o humano cria/seleciona/modifica (vs.
   prompt puro), **mais forte o copyright** sobre a arte — tornando a licença (2) executável.

**Ressalva crítica:** arte **derivada de IA pode ser incopyrightável** → a licença (2) pode ser
**inexequível** sozinha; por isso (1) **marca** é indispensável.

**Verificar no gerador (PixelLab é o melhor candidato):** a licença nos permite (a) usar em
**software gratuito** (✔ "qualquer fim"), (b) **redistribuir** a arte derivada (✔), e (c) **impor
termos próprios downstream** — aqui a incopyrightabilidade limita; a robustez vem da **marca**.

**Trade-off explícito:** isto **dente** o ideal "qualquer empresa copia e implanta TUDO" (P10): o
motor é livre, mas os **personagens não** — um terceiro precisa respeitar a licença de arte / a
marca, ou trocar a arte. É comum em jogos OSS (código livre + assets restritos) e **aceitável**
dado o requisito de proteção infantil. Editais FOSS-puristas costumam olhar só o **código** (ok);
poucos podem exigir assets livres (flag).

⚖️ **Para advogado:** linha ideia×expressão por sprite; ToS ao vivo do Magnific; se "não treinar
modelo" alcança extração algorítmica (quase certo que não); enforceabilidade de ToS contra
terceiros que não aceitaram; combinação BSL 1.1 + arte derivada de IA.

*(Fontes primárias com URLs no relatório do subagente; reconfirmar antes de publicar.)*
