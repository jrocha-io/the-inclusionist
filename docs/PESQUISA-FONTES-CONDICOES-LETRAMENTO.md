# Pesquisa básica — Fontes para condições, letramento e letramento matemático

> **Nível:** pesquisa **básica/exploratória** (1ª passada). Objetivo: mapear o que existe e onde há (ou não) evidência. **Se o tema se tornar relevante, fazer depois um _scoping review_ formal** (critérios de inclusão, gradação de evidência, população-alvo: crianças de escola pública BR). Data: 2026-06-02.

## 0. Aviso metodológico (importante)
Boa parte da literatura "fonte para X" é **fraca**: opinião de mercado, estudos pequenos, sem grupo-controle, ou com resultados nulos. Tratar os achados abaixo como **hipóteses**, não verdades. O padrão recorrente e **bem sustentado** é: *o que ajuda quase todas as condições é **legibilidade geral + diferenciação de caracteres + espaçamento/entrelinha generosos**, mais do que uma fonte "mágica".* Personalização (deixar o usuário escolher fonte/tamanho/espaçamento) é a recomendação mais segura (e bate com o GAG).

## 1. Fontes por condição

| Condição | O que a literatura sugere | Fontes citadas | Força da evidência |
|---|---|---|---|
| **Baixa visão** | peso de traço alto, x-height grande, **aberturas abertas**, espaçamento; diferenciação I/l/1, O/0 | **Atkinson Hyperlegible** (Braille Institute) | Boa (design baseado em propósito; uso amplo) |
| **Dislexia** | sem "fonte mágica"; ajuda = legibilidade + diferenciação + espaçamento; **b/d/p/q** assimétricos; entrelinha ≥1.5 | Lexend, Atkinson, Comic Sans/Comic Neue, Verdana; OpenDyslexic (preferência subjetiva) | **Fraca/mista** (OpenDyslexic: estudo nulo) |
| **TDAH** | simples, limpo, **sem ornamento**, traço de espessura constante; reduzir distração | Lexend, Open Sans, Verdana, sans geométricas limpas | Fraca (princípios > estudos) |
| **Discalculia** | pouca pesquisa dedicada; **comorbidade alta com dislexia** (⅓–75%) → herdar princípios de dislexia; **numerais inequívocos**; reduzir estresse visual (espaçamento, overlay, fundo off-white) | Lexia Readable, Lexend; numerais "lining/tabular" | **Muito fraca** (lacuna real) |
| **Afasia / déficit cognitivo** | legível + "readable"; formas simples; frases curtas; apoio de ícones | sans limpas (Open Sans, Verdana) | Fraca |
| **Astigmatismo/miopia/fadiga (uso prolongado)** | x-height grande, traço médio, espaçamento folgado, quase-monoespaçada ajuda foco | iA Writer (Quattro), Inter, fontes de leitura calmas | Anedótica (relato do próprio usuário tem peso de design) |

## 2. Fontes para letramento (leitores iniciantes)
Campo **mais maduro** (há pesquisa de design, ex.: Rosemary Sassoon).
- **Sassoon (Primary/Infant)** — fruto de pesquisa sobre como crianças leem/escrevem; **caracteres "infant"** (a e g de uma perna, saídas curvas em l/t, serifa no I maiúsculo), traço levemente inclinado com *exit strokes* (preparando a cursiva). Padrão em escolas/editoras anglo. **Comercial.**
- **Andika** (SIL, **OFL, grátis**) — desenhada **para alfabetização e leitores iniciantes**: formas "ball-and-stick" inequívocas, cobertura latina ampla. É o equivalente libre do papel "Sassoon". → **escolhida como padrão do jogo.**
- Variantes "infant" clássicas: **Gill Sans Infant, Bembo Infant, Plantin Infant** (comerciais).
- **Lexia Readable** — "Comic Sans adulto", legível já em 8pt.
- Princípio: formas **generosas, simples e quentes**; caracteres infantis; nada de ornamento.

## 3. Letramento MATEMÁTICO (foco pedido) — lacuna + diretrizes
**Não há (ainda) tipografia consolidada "para letramento matemático"** com base empírica forte. Mas dá para derivar diretrizes do que importa em números/notação:

1. **Numerais inequívocos** (o ponto mais crítico): distinguir **0×O**, **1×l×I×7**, **6×b**, **9×g**, **5×S**, **2×Z**. Para discalculia + estresse visual, confusão de dígito é pior que de letra.
2. **Algarismos "lining" (caixa-alta)** para alinhar com símbolos; e **"tabular" (largura fixa)** para **colunas/contas armadas** (unidades alinhadas). Fontes com *tabular figures* (ex.: Inter, Lato, Roboto) ajudam contas em coluna.
3. **Operadores corretos**, não improvisos: usar **× ÷ − ±** reais (não `x`, `/`, hífen) — exige fonte com esses glifos ou render dedicado.
4. **Notação/fórmulas** (níveis avançados): fontes matemáticas (**STIX Two Math, Latin Modern Math**) via MathML/MathJax; para **numeracia inicial**, o que pesa é o **dígito claro na fonte do corpo**, não fonte de fórmula.
5. **Estresse visual** (comum na discalculia): espaçamento maior entre dígitos, fundo levemente colorido/off-white, overlays opcionais.

**Recomendação prática para o jogo (numeracia inicial):** usar a fonte de corpo (Andika/Atkinson — ambas com dígitos bem diferenciados) com **tabular figures** quando houver contas em coluna; reservar fonte matemática só se entrarmos em notação. Andika e Atkinson já cobrem #1 bem; validar #2/#3 nos modos Soma-Sub.

## 4. Próximos passos (se o tema escalar → scoping review)
- Definir **população** (crianças BR, 6–11, escola pública) e **desfechos** (velocidade/precisão de leitura, erro de transcrição numérica, fadiga).
- **Gradear evidência** (ex.: GRADE) e separar "design plausível" de "testado".
- Testar **numerais** especificamente (dígito-confusão) com a fonte padrão escolhida.
- Buscar literatura PT-BR/lusófona (a maioria dos estudos é em inglês).

## Fontes
- [Visme — Accessible Fonts: guia](https://visme.co/blog/accessible-fonts/) · [AudioEye — Best Fonts for ADHD](https://www.audioeye.com/post/best-fonts-for-adhd/) · [DesignYourWay — 13 best fonts for accessibility](https://www.designyourway.net/blog/best-fonts-for-accessibility/)
- [Dyslexia UK — The font of all knowledge](https://www.dyslexiauk.co.uk/the-font-of-all-knowledge/) · [Number Dyslexia — best/worst fonts](https://numberdyslexia.com/best-and-worst-fonts-for-dyslexia/) · [Addressing Dyslexia — Numeracy](https://addressingdyslexia.org/supporting-learners-and-families/technology/numeracy/)
- [Mathematics For All — Dyscalculia](https://mathlanguage.wordpress.com/tag/dyscalculia/) · [EdWeek — Dyscalculia & Dyslexia](https://www.edweek.org/teaching-learning/dyscalculia-and-dyslexia-reading-disabilities-offer-insights-for-math-support/2023/05)
- [Sassoon Fonts (Rosemary Sassoon)](https://sassoonfont.co.uk/sassoon-fonts/) · [Fonts.com — Typography for Children](https://www.myfonts.com/pages/fontscom-learning-fyti-situational-typography-typography-for-children) · [Books for Keeps — Typography in Children's Books](http://booksforkeeps.co.uk/issue/154/childrens-books/articles/other-articles/typography-in-childrens-books)
