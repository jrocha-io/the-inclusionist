# Estudo de Fontes — The Inclusionist / EdSP

> Objetivo: consolidar ou propor alterações ao conjunto de fontes do projeto. **Onde o estudo converge com a escolha atual, a fonte fica oficial**; onde diverge, segue uma **proposta** para decisão do José. Data: 2026-06-02.

## 1. Restrições do projeto (pilares que pesam na escolha)

- **A11y primeiro (WCAG 2.2 AAA + GAG).** Critério dominante: legibilidade real e diferenciação de caracteres (I/l/1, O/0, rn/m), não estética.
- **i18n (portfólio nórdico) + PT-BR.** Toda fonte de texto precisa cobrir diacríticos do português (á â ã à ç é ê í ó ô õ ú) **e** do nórdico (å ä ö ø æ œ ð þ í ý). Fontes decorativas (caligráfica/blackletter) podem ter cobertura parcial → exigem fallback.
- **Offline (PWA + Electron + Capacitor).** Nada de depender de CDN: **toda fonte é self-hosted** (`@font-face` + `woff2` subsetado no bundle). Isso transforma "usar a fonte" em "**empacotar/embarcar** a fonte" → a licença relevante é **embedding em app/web/eBook**, não só "desktop".
- **Licença: código GPL-3.0 + _assets_ não-FOSS permitidos.** Fontes entram como **asset** (igual à arte): uma fonte proprietária embarcada **não contamina** o código GPL, desde que distribuída sob a licença de embedding dela. Ainda assim, **preferir libre (OFL)** reduz atrito; pagas só onde há razão pedagógica.
- **Hardware de escola pública BR (Positivo/Chromebook).** woff2 subsetado por idioma; evitar pesos demais; `font-display: swap`.

## 2. Critérios de avaliação (cada fonte é pontuada nestes eixos)

1. **Legibilidade/evidência** (pesquisa, não opinião).
2. **Diferenciação de caracteres** (crítico p/ baixa visão e dislexia).
3. **Cobertura de glifos** (PT + nórdico).
4. **Licença p/ embedding** (web/app/eBook) e **custo**.
5. **Disponibilidade** (Google Fonts/SIL → self-host trivial vs. foundry comercial).
6. **Adequação pedagógica** (quando aplicável: manuscrita/alfabetização).

## 3. Tabela-resumo (veredito)

| Papel | Atual (José) | Licença | Veredito do estudo |
|---|---|---|---|
| **UI padrão** | Atkinson Hyperlegible | OFL (Braille Institute) | ✅ **OFICIAL** — converge |
| **Alt. acessível** | OpenDyslexic | OFL | ⚠️ **DIVERGE** — manter como _opção_ subjetiva; **adicionar Lexend** (melhor evidência) como alternativa padrão |
| **Livro/serifada de leitura** | Literata → Garamond (fb) | OFL (Literata) | ✅ **OFICIAL** — converge (Literata é desenhada p/ leitura longa em tela) |
| **Serifada padrão (tela)** | Merriweather → Times (fb) | OFL (Merriweather) | ✅ **OFICIAL** — converge |
| **Sans padrão** | Ubuntu → Lato → Arial/Helvetica (fb) | **UFL** (não-OFL) / OFL (Lato) | 🟡 **OFICIAL c/ ressalva** — Ubuntu pode ser embarcada, mas é UFL; ver §6. Alternativa 100%-OFL: **promover Lato a padrão** |
| **Caligráfica inglesa** | Great Vibes, Pinyon Script | OFL | ✅ **OFICIAL** — converge (uso decorativo; fallback p/ glifos faltantes) |
| **Blackletter** | UnifrakturCook, UnifrakturMaguntia | OFL | ✅ **OFICIAL** — converge (decorativo) |
| **Bola/bastão (infantil)** | Comic Neue | OFL | 🟡 **OFICIAL c/ proposta** — Comic Neue serve; **avaliar Andika** (SIL, feita p/ alfabetização/leitores iniciantes, bastão verdadeiro, cobertura completa) |
| **Pedagógica manuscrita — BR** | **Kindergarten Pro** (paga) | **Comercial** | ✅ **MANTER** (inegociável) — padrão de fato das editoras BR; licenciar embedding (§6) |
| **Pedagógica manuscrita — EU/CA/US** | **Learning Curve** (suposta paga) | **GRATUITA p/ uso comercial** | ✅ **MANTER** — **correção: NÃO é paga** (Blue Vinyl/Jess Latham); economia de licença (§6) |

## 4. Análise por papel

### 4.1 UI padrão — Atkinson Hyperlegible ✅
Criada pelo **Braille Institute** para **baixa visão**, com diferenciação **exagerada** de caracteres (cada letra o mais distinta possível: I/l/1, O/0). É o melhor casamento com o pilar a11y para UI/HUD. **Converge → oficial.** (OFL, no Google Fonts → self-host trivial; cobre Latin Extended, ok PT+nórdico.)

### 4.2 Alternativa acessível — OpenDyslexic ⚠️ (diverge)
A **evidência é fraca/negativa**: estudo revisado (Wery & Diliberto, 2017) não encontrou ganho de velocidade/precisão e os leitores **preferiram Arial/Helvetica/Verdana** a OpenDyslexic. Recomendação de tipógrafos (Pimp my Type, Access-Ability) é a mesma: fontes "para dislexia" não têm suporte robusto; o que ajuda é **boa legibilidade geral + diferenciação**.
- **Proposta:** manter OpenDyslexic como **opção** (há quem _prefira_ subjetivamente, e isso tem valor de conforto/escolha — alinha com GAG "deixe o usuário escolher"), **sem vendê-la como mais eficaz**. Como **alternativa padrão de fato**, adicionar **Lexend** (OFL; desenhada com base em pesquisa de proficiência de leitura — "reading proficiency"). Assim o seletor de a11y ofereceria: *Atkinson (padrão) · Lexend (alta legibilidade) · OpenDyslexic (preferência pessoal)*.

### 4.3 Livro/serifada de leitura — Literata ✅
**Literata** (Google, OFL) foi desenhada para o **Google Play Books** — leitura longa em tela e-ink/LCD. Perfeita para "simular livros" nas atividades. Fallback Garamond (sistema/EB Garamond OFL). **Converge → oficial.**

### 4.4 Serifada padrão (tela) — Merriweather ✅
**Merriweather** (OFL) é serifada de alta legibilidade pensada para telas (altura-x generosa, contraste moderado). Fallback Times (sistema). **Converge → oficial.**

### 4.5 Sans padrão — Ubuntu 🟡 (ressalva de licença)
**Ubuntu** é altamente legível, mas está sob **Ubuntu Font License (UFL)**, **não OFL**. A UFL **permite empacotar/embarcar/redistribuir** a fonte (e documentos feitos com ela não precisam ser UFL), então **dá para usar** no PWA/app. Ressalva: a UFL é "copyleft de fonte" e tem regras próprias (a fonte/derivadas não podem ser relicenciadas) — um atrito de governança que a OFL não tem.
- **Proposta:** manter Ubuntu como padrão **OU** promover **Lato** (já é o seu 2º) a padrão para ficar **100% OFL** em todo o stack sans. Decisão de governança, não de legibilidade (ambas são ótimas). Fallbacks Lato → Arial/Helvetica (sistema). 

### 4.6 Caligráfica inglesa — Great Vibes / Pinyon Script ✅
Ambas OFL (Google Fonts). Uso **decorativo** (títulos, certificados, "letra bonita"). Cobertura de glifos é menor (foco em latim básico + alguns acentos) → **sempre com fallback** (Literata/Atkinson) para textos com nórdico. **Converge → oficial** no papel decorativo.

### 4.7 Blackletter — UnifrakturCook / UnifrakturMaguntia ✅
Ambas OFL. UnifrakturMaguntia tem boa cobertura de alemão/latim; uso decorativo (temas medievais/góticos). **Converge → oficial.** (Confirmado: "Maguntia" = **UnifrakturMaguntia**.)

### 4.8 Bola/bastão infantil — Comic Neue 🟡 (proposta)
**Comic Neue** (OFL) é a versão "limpa" da Comic Sans — amigável, informal, boa para crianças. Serve como manuscrita-impressa amigável. **Porém** não é um "bastão" pedagógico verdadeiro (letra de fôrma de cartilha).
- **Proposta:** para a **letra bastão de alfabetização** (BR começa pela fôrma/bastão antes da cursiva), avaliar **Andika** (SIL, OFL) — desenhada **especificamente para alfabetização e leitores iniciantes**, com formas de letra "ball-and-stick" inequívocas (a de uma perna, g de uma alça), cobertura latina completa. Sugestão: **Andika = bastão/alfabetização**, **Comic Neue = "amigável/informal"** (balões, falas), papéis distintos.

### 4.9 Pedagógicas manuscritas (pagas) — análise de licenciamento → §6

## 5. Convergências × Divergências (resumo executivo)

- **Já oficiais (converge):** Atkinson Hyperlegible (UI), Literata (livro), Merriweather (serifada), Great Vibes/Pinyon (caligráfica), UnifrakturCook/Maguntia (blackletter), Learning Curve (cursiva anglo), Kindergarten Pro (cursiva BR — mantida por decisão).
- **Diverge / proposta (decisão do José):**
  1. **OpenDyslexic** → opção subjetiva + **adicionar Lexend** como alternativa de alta legibilidade.
  2. **Sans**: Ubuntu (UFL) vs **promover Lato (OFL)** a padrão — governança de licença.
  3. **Bastão**: **Andika** para alfabetização; Comic Neue migra para "amigável/informal".

## 6. Licenciamento das fontes pedagógicas (o ponto sensível)

> Decisão do José: **usar Kindergarten Pro (BR) e Learning Curve (EU/CA/US) é inegociável.** O estudo analisa o que é possível/necessário — sem propor abandoná-las.

### 6.1 Learning Curve (EU/CA/US) — **descoberta: NÃO é paga**
A **Learning Curve** (e a **Learning Curve Pro**, com versões *Dashed*/*Dings* para tracejado) de **Jess Latham / Blue Vinyl Fonts** é **gratuita para uso pessoal E comercial** (disponível no Font Squirrel com licença de uso, e no bvfonts.com). 
- **Implicação:** **sem custo de licença** e **pode ser self-hosted** (`@font-face`/woff2) no app. O autor pede, como apoio, que se considere comprar outras fontes dele — opcional.
- **Ação:** confirmar a EULA específica do pacote baixado (Font Squirrel mostra a licença) e **arquivar o `.txt` da licença** junto ao asset (`/fonts/learning-curve/LICENSE`). Risco: **baixo**.

### 6.2 Kindergarten Pro (BR) — **comercial, requer licença de embedding**
A família **Kindergarten** é o **padrão de fato das editoras brasileiras** para material de alfabetização (pacote com ~10 fontes: 4 cursivas que simulam a manuscrita escolar + **Kindergarten Dashed** para traçar pontilhado), respeitando a tradição da **cartilha**. A versão **Pro** é **comercial**.
- **O que é necessário (PWA/Electron/Capacitor = embedding):** uma **licença de _app/web embedding_** (não só desktop). Modelos típicos de foundry: por **app**, por **marca**, ou por **usuários ativos mensais** — custo de dezenas a centenas de USD por faixa de uso; eBook/broadcast somam.
- **Ações (a fazer antes de embarcar):**
  1. **Identificar a foundry/distribuidor exato** da "Kindergarten **Pro**" (há variações homônimas; confirmar autoria e EULA — provável origem brasileira ligada a material didático).
  2. Solicitar **cotação de licença de embedding em aplicativo + web** cobrindo PWA, Electron (desktop) e Capacitor (mobile), e **distribuição gratuita/fomento** (o jogo é gratuito — confirmar se a foundry cobra por downloads/usuários).
  3. Verificar **direito de subset** (woff2 subsetado) — algumas EULAs proíbem modificar/subsetar; precisamos disso para o tamanho em hardware de escola.
  4. **Arquivar a licença** e o comprovante; manter a fonte **fora do código GPL** (asset não-FOSS, igual à arte).
- **Risco/atrito:** **médio-alto** (custo + termos de embedding + subsetting). **Mitigação enquanto a licença não fecha:** usar um **placeholder OFL** de cursiva BR no desenvolvimento (ex.: as cursivas livres de alfabetização do acervo "Be-a-bá"/dafont com licença comercial) e **trocar pela Kindergarten Pro no build de produção**, isolando a dependência paga.

### 6.3 Por que duas fontes pedagógicas distintas (BR × EU/CA/US)?
Não é capricho: os **modelos de manuscrita diferem por currículo**. O **Brasil** ensina **bastão primeiro e depois cursiva vertical** (substituiu Palmer/roundhand); o material precisa bater com a **cartilha** brasileira → **Kindergarten**. EU/Anglo usam outro traço de cursiva → **Learning Curve**. Usar a fonte "errada" por região **conflita com o material escolar local** — daí a separação ser pedagógica, não estética.

## 7. Cobertura de glifos / i18n (verificação obrigatória antes de oficializar)

- **Cobrem PT + nórdico (Latin Extended):** Atkinson, Literata, Merriweather, Lato, Ubuntu, Lexend, Andika — OK.
- **Cobertura parcial (decorativas) → exigem fallback:** Great Vibes, Pinyon Script (latim básico+; checar ø/å/æ), UnifrakturCook/Maguntia (alemão ok; checar nórdico). **Regra:** decorativas **nunca** sozinhas em texto corrido multilíngue — sempre `font-family: 'Great Vibes', 'Literata', sans-serif`.
- **Pedagógicas (Kindergarten/Learning Curve):** confirmar acentos PT (ã, õ, ç) — para EU/US a cobertura nórdica da cursiva precisa ser testada; se faltar, a cursiva é usada só onde o currículo daquela língua pede.

## 8. Implementação técnica (quando for wire-ar)

- **Self-host** em `/fonts/<familia>/` com **woff2 subsetado por idioma** (`unicode-range`); `font-display: swap`; pré-carregar só a UI padrão (Atkinson) e a fonte da tela atual.
- **Tokens CSS** por papel: `--font-ui`, `--font-ui-alt`, `--font-book`, `--font-serif`, `--font-sans`, `--font-script`, `--font-fraktur`, `--font-print` (bastão), `--font-cursive` (regional). Trocar a fonte = trocar o token, não o markup.
- **Seletor de acessibilidade** (Opções): UI = Atkinson / Lexend / OpenDyslexic; + tamanho e espaçamento (line-height ≥1.5, letter-spacing ajustável) — isso costuma ajudar **mais** que a fonte em si.
- **Pagas isoladas**: a Kindergarten Pro entra só no build de produção, fora do repositório público GPL (como a arte não-FOSS); o repo público referencia um placeholder OFL.

## 9. Pendências para o José decidir (para fechar a oficialização)
1. **OpenDyslexic**: aceitar como _opção_ + **adotar Lexend** como alternativa padrão? (recomendado)
2. **Sans**: manter **Ubuntu (UFL)** ou trocar padrão por **Lato (OFL)**? (recomendo Lato por governança)
3. **Bastão**: adotar **Andika** para alfabetização e mover Comic Neue para "amigável"? (recomendado)
4. **Kindergarten Pro**: autorizar contato com a foundry para cotação de **embedding (app+web+mobile) + subset**? (necessário antes de embarcar)

## Fontes
- [Wery & Diliberto — efeito da OpenDyslexic na leitura (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5629233/)
- [Pimp my Type — Dyslexia friendly fonts: are they any good?](https://pimpmytype.com/dyslexia-fonts/)
- [Access-Ability — The Nuance of Dyslexia Friendly Fonts in Games](https://access-ability.uk/2024/06/21/the-nuance-of-dyslexia-friendly-fonts-in-games/)
- [Max Kohler — The Development of Atkinson Hyperlegible](https://www.maxkohler.com/notes/2021-02-16-atkinson-hyperreadable/)
- [Learning Curve Pro no Font Squirrel (licença)](https://www.fontsquirrel.com/license/learning-curve-pro) · [Blue Vinyl Fonts (bvfonts.com)](https://www.bvfonts.com/fonts/details.php?id=76)
- [Primarium — Brazil (modelo de manuscrita escolar)](https://primarium.info/countries/brazil/)
- [Kindergarten e Be-a-bá — fontes de alfabetização BR](https://fontebeaba.wordpress.com/)
- [Canonical — Ubuntu Font Licence FAQ](https://canonical.com/legal/font-licence/faq) · [LWN — Ubuntu font e licenciamento libre](https://lwn.net/Articles/409813/)
- [Monotype — App License (embedding em apps)](https://foundrysupport.monotype.com/hc/en-us/articles/10840068991636-App-License)
