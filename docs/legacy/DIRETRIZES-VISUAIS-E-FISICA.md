<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# Diretrizes do José (2026-06-01) — física, itens e camada visual

## A. Bugs / correções imediatas
- [ ] **Personagem ainda é o antigo** — aplicar o novo procedural (perfil) no jogo (E15, em curso).
- [x] **Chave não abre a porta** — detecção do portão falhava quando o jogador estava EM CIMA (margem). Corrigir.
- [x] **Super-pulo estava com efeito de ultra-pulo** — corrigir semântica (abaixo).

## B. Itens corretos (mapa v3 revisado) — `ITEM_PLACEMENTS` + tiles estáticos
| Tile | Item | Posição | Efeito |
|---|---|---|---|
| 7 | **Super-pulo** (pulo máximo) | (30,14) estático | pulo SEMPRE na altura máxima (9 tiles) — força o topo da cadeia |
| 8 | **Voo** | (44,34) estático | voo livre (cima/baixo/plana) |
| 11 | **Chave** | (42,36) estático | abre o portão |
| 10 | **Portão** ×7 | (29-34,36)+(29,37) | sólido até a chave |
| 12 | **Super-corrida (turbo)** | (13,8) injetado | correr fica mais rápido (`hTurbo`) |
| 13 | **Ultra-pulo** | (55,37) injetado | pulo de distância gigante (22 tiles, `ultraJumpVel`) |
| 14 | **Ventosa / homem-aranha (wallcling)** | (13,26) injetado | gruda na parede (Correr no ar), cima/baixo deslizam, solta com Pular |
- **Pulo encadeado (bunny-hop):** sem correr todo pulo = 5 tiles; **correndo** em pedra, pulos seguidos sobem 5→8→9; parado >10 frames zera. Super-pulo força 9; ultra-pulo ignora a cadeia (22).
- **Poderes mutuamente exclusivos** (`activePower`): pegar um substitui o anterior (fiel à v3).

## C. Arte — UNIFICADA (regra para toda geração PixelLab)
**Toda arte** (personagem, tiles, decoração) deve usar **paleta, luz (direção) e contorno UNIFICADOS.**
→ Definir 1 paleta-mãe + 1 direção de luz + estilo de contorno e gerar tudo sob essa regra.

## D. Juice (game feel) — TUDO com toggle INDEPENDENTE no debug (testar em tablet/PC do governo)
- [ ] Poeira ao aterrissar
- [ ] Brilho ao coletar
- [ ] Squash & stretch
- [ ] Hit-stop (micro-congelamento no impacto)
- [ ] Screenshake calibrado
- [ ] Shimmer animado nos tiles
- [ ] Easing de câmera
→ Painel `?debug`: 1 checkbox por efeito (ligar/desligar isolado) + perfil "baixo desempenho" que desliga todos.

## E. Tileset profissional
Bordas, cantos, inclinações (slopes), transições (autotiling), decorações e camadas. (PixelLab `create_sidescroller_tileset` + autotile no motor.)

## F. Quatro camadas de jogo (parallax)
1. **Céu + ambiente distante** (montanhas/horizonte) — parallax lento.
2. **Árvores médias + animais maiores** — parallax médio.
3. **Mato próximo (vento) + nuvens + animais próximos** (pássaros, borboletas) — parallax rápido.
4. **Região do jogo** (tiles sólidos + player) — sem parallax.

## G. Pós-processamento (overlays CSS, desligáveis)
- Scanlines CRT + vinheta (overlays CSS sobre o `#game-region`).
- Cantos arredondados (já há `border-radius`).
→ Também com toggle no debug (alguns tablets podem sofrer com overlays).

## Ordem de execução proposta
1. **E18a (este passo):** bugs (chave/super-pulo) + itens 12/13/14 + pulo encadeado + ventosa + poderes exclusivos.
2. **E15:** personagem procedural em perfil (idle/andar primeiro) + camadas (Fitzpatrick/cabelo/roupa) + arte unificada.
3. **E16:** temas + tileset profissional (PixelLab) + autotiling.
4. **Parallax (F)** 4 camadas.
5. **Juice (D)** + painel `?debug` com toggles independentes.
6. **Pós-processamento (G)** CRT/vinheta CSS desligáveis.
