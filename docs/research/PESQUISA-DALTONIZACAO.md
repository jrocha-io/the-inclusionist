# Pesquisa — Daltonização canônica (simulação + correção 🚥)

> Research-first: cravar os valores canônicos dos filtros de daltonismo (simulação `sim-*` e
> correção `fix-*`), substituindo as matrizes derivadas manualmente que estavam marcadas como
> "dados ajustáveis".

## 1. O algoritmo canônico de correção (daltonização)

A daltonização **não é uma matriz única publicada** — é um algoritmo (Fidaner, Lin & Ozguven 2005,
implementação canônica: daltonize):

```
Sim  = S · I                    (1) simula como o dicromata vê
E    = I − Sim                  (2) erro: a informação que ele perde
C    = I + M_err · E            (3) redistribui o erro para canais que ele enxerga
```

- **S** (simulação): Machado, Oliveira & Fernandes 2009, *A Physiologically-based Model for
  Simulation of Color Vision Deficiency* (IEEE TVCG 15(6)) — Tabela 1, severidade 1.0.
  Valores conferidos na página oficial dos autores (UFRGS).
- **M_err** (redistribuição, Fidaner et al.): desloca o erro do canal R para G e B —
  `[[0,0,0],[0.7,1,0],[0.7,0,1]]` (conferido no código canônico `daltonize.py`).

Como os três passos são lineares, compõem numa única matriz por tipo:
**C = I + M_err·(I − S)** — é o que os filtros `fix-*` aplicam.

## 2. Matrizes de SIMULAÇÃO (Machado 2009, severidade 1.0) — canônicas

| | R' | G' | B' |
|---|---|---|---|
| **Protanopia** | 0.152286, 1.052583, −0.204868 | 0.114503, 0.786281, 0.099216 | −0.003882, −0.048116, 1.051998 |
| **Deuteranopia** | 0.367322, 0.860646, −0.227968 | 0.280085, 0.672501, 0.047413 | −0.011820, 0.042940, 0.968881 |
| **Tritanopia** | 1.255528, −0.076749, −0.178779 | −0.078411, 0.930809, 0.147602 | 0.004733, 0.691367, 0.303900 |

As matrizes `sim-*` anteriores (0.567/0.433… — as "colorjack" que circulam pela web) **não têm
fonte primária e são consideradas imprecisas** (ver review do DaltonLens). Substituídas pelas
Machado no mesmo passe.

## 3. Matrizes de CORREÇÃO compostas (C = I + M_err·(I − S))

Soma de cada linha = 1 → **branco/cinzas preservados** (a correção só mexe onde há croma).

| | linha R | linha G | linha B |
|---|---|---|---|
| **fix-protan** | 1, 0, 0 | 0.478897, 0.476911, 0.044192 | 0.597282, −0.688692, 1.091410 |
| **fix-deutan** | 1, 0, 0 | 0.162790, 0.725047, 0.112165 | 0.454695, −0.645392, 1.190697 |
| **fix-tritan** | 1, 0, 0 | −0.100459, 1.122915, −0.022457 | −0.183603, −0.637643, 1.821245 |

Leitura: a linha R é identidade (o canal defeituoso não é alterado — não adianta modular o que a
pessoa não distingue); o erro é reinjetado em G e B, onde a pessoa TEM discriminação. No tritan a
modulação forte fica no B (1.82) — o erro tritan vive no azul.

## 4. Decisões documentadas

1. **Brettel 1997 para tritan**: é o modelo exato, mas é *piecewise* (dois semi-planos escolhidos
   por pixel) — **não é exprimível numa `feColorMatrix` única** nem no ColorMatrixFilter do PIXI.
   Usamos a matriz tritan de Machado (a melhor aproximação LINEAR única). Refinamento futuro:
   shader piecewise Brettel. *Para sobrepor: pedir o shader.*
2. **Espaço de cor**: Machado define as matrizes em **RGB linear** (o daltonize canônico faz
   de-gamma antes). Aplicamos em **sRGB nos dois caminhos** (SVG com
   `color-interpolation-filters="sRGB"` no solo; PIXI ColorMatrixFilter no MP, que só opera em
   sRGB) → solo ≡ multiplayer visualmente, que é a aproximação padrão das implementações web.
   Variante linear-exata = refinamento futuro (exigiria gamma no shader do PIXI também).
3. **M_err de Fidaner é o mesmo para os 3 tipos** no algoritmo canônico (é o que o daltonize
   faz); alternativas adaptativas por imagem existem na literatura, fora de escopo.

## 5. Verificação (headless, antes de commit)

Teste numérico: para um par confundível pelo protanope (vermelho×verde), medir ΔE **sob simulação
protan** antes e depois da correção — a correção deve AUMENTAR a distância percebida pelo
protanope. Idem deutan e tritan (azul×amarelo). + screenshot de cada modo.

## 6. Fontes

- [Machado, Oliveira & Fernandes 2009 — página oficial com a Tabela 1 (UFRGS)](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html) · [IEEE Xplore](https://ieeexplore.ieee.org/document/5290741/)
- [daltonize.py — implementação canônica (Fidaner et al.; matriz M_err)](https://github.com/joergdietrich/daltonize)
- [Daltonize.org — LMS Daltonization Algorithm](http://www.daltonize.org/2010/05/lms-daltonization-algorithm.html)
- [DaltonLens — Review of Open Source CVD Simulations (imprecisão das matrizes "colorjack")](https://daltonlens.org/opensource-cvd-simulation/)
