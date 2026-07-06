// SPDX-License-Identifier: GPL-3.0-or-later
// core/layers — ORDEM-Z CANÔNICA (fonte única de verdade). Cada camada tem um Z NOMEADO; ninguém mais faz
// addChildAt(getChildIndex(...)) — a inserção passa a ser pelo Z, sem depender das vizinhas (fim do acoplamento).
// Duas escalas: MUNDO (por viewport — PIXI zIndex dentro da câmera, com sortableChildren) e OVERLAY (global, tela —
// vira CSS z-index no DOM, pois menu/HUD/legenda são DOM). Passo 100 = folga p/ inserir camada nova sem renumerar tudo.
//
// PÓS-PROCESSO ≠ camada Z: CRT/vinheta e os filtros de a11y (alto-contraste, correção de daltonismo, simulação de
// deficiência) são uma CADEIA de passes sobre o frame JÁ COMPOSTO (POST_FX_ORDER), não itens da display-list — e cobrem
// TUDO, inclusive o menu. Regra: A11Y_CORRECTION é SEMPRE o último passe (senão o CRT re-tinge e quebra a correção CB);
// modos de a11y SUPRIMEM o CRT/efeitos decorativos; o overlay é palette-aware (troca p/ CB-safe). Ver ADR-0020 + ADR-0011.

export const Z = {
  // ---- MUNDO (por viewport; PIXI zIndex dentro da câmera) ----
  SKY: 100,                 // gradiente de céu (base)
  SKY_ANIM: 200,            // nuvens/pássaros/estrelas do céu
  PARALLAX_4: 300,          // paralaxe mais distante
  PARALLAX_3: 400,
  PARALLAX_2: 500,
  PARALLAX_1: 600,          // fundo próximo do jogo
  BG_DECOR: 700,            // deco ATRÁS dos tiles (água/corais de fundo, props não-colidíveis)
  TILES: 800,               // tileset / plataforma (o nível)
  SCENERY_INTERACT: 900,    // cenário interativo: porta, alavanca, interruptor, manivela, corda, portão
  VFX_BACK: 1000,           // efeitos ATRÁS dos atores: poeira de pé, god-rays, sombras
  FAUNA_DECOR: 1100,        // animais/criaturas não-interativas (borboletas, minhocas, vagalumes)
  NPC: 1200,                // personagens interativos (não-jogador)
  ITEMS: 1300,              // coletáveis (moedas, poderes, chave) — ATRÁS do player (barril DK / Yoshi / chave SMW)
  PLAYER: 1400,             // jogador(es)
  VFX_FRONT: 1500,          // efeitos NA FRENTE: explosão, faísca, fogos, confete, raios de luz
  FOREGROUND_WEATHER: 1600, // primeiro-plano oclusivo + clima (névoa, chuva) na frente do ator
  WORLD_A11Y: 1700,         // pistas visuais de a11y no mundo (sonar, guarda de beirada, realce de foco)

  // ---- OVERLAY (global, tela; = CSS z-index no DOM / topo da stage PIXI) ----
  HUD: 2000,                // placar/moedas/poder/objetivo/minimapa (persistente durante o jogo)
  TOUCH_CONTROLS: 2100,     // gamepad virtual / botões de toque (mobile)
  CAPTIONS: 2200,           // legendas de som (a11y surdez)
  DIALOGUE: 2300,           // fala/diálogo de personagens
  GAME_MSG: 2400,           // vitória / game over / pause / faixa de fase
  MODAL_SCRIM: 2500,        // escurecimento do fundo quando abre um modal
  MENU: 2600,               // menus — RANGE reservado 2600–2999 (níveis aninhados: +100 por nível)
  MENU_MAX: 2999,
  TRANSITION: 3000,         // fade/wipe de troca de fase (cobre tudo)
  DEBUG: 9000,              // painel ?debug / FPS / hitboxes (dev; topo absoluto)
} as const;

export type LayerName = keyof typeof Z;

// Cadeia de PÓS-PROCESSO — passes sobre o frame COMPOSTO, do interno p/ o externo. NÃO são camadas Z.
// A11Y_CORRECTION é SEMPRE o último (correção CB/contraste tem de valer sobre a imagem final). Modos de a11y suprimem
// CRT_VIGNETTE e flashes decorativos (precedência a11y > estética). Ver ADR-0020.
export const POST_FX_ORDER = ['CRT_VIGNETTE', 'EMPATHY_SIM', 'A11Y_CORRECTION'] as const;
export type PostFx = typeof POST_FX_ORDER[number];
