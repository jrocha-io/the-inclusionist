// SPDX-License-Identifier: GPL-3.0-or-later
// core/layers — ORDEM-Z CANÔNICA (fonte única de verdade). Cada camada tem um Z NOMEADO; ninguém mais faz
// addChildAt(getChildIndex(...)) nem "re-adiciona ao topo" — a inserção passa a ser pelo Z (fim do acoplamento).
// Duas escalas: MUNDO (por viewport — PIXI zIndex dentro da câmera, com sortableChildren) e OVERLAY (global, tela —
// vira CSS z-index no DOM, pois menu/HUD/legenda são DOM). **Passo 1000** = folga generosa: 999 slots livres entre
// camadas nomeadas (e sub-slots dentro de cada uma) p/ inserir futuras SEM renumerar. Elementos concretos entram por
// `Z.BANDA + offset` pequeno (ex.: cane/cadeira = PLAYER+10/+20; sinaleiro = SCENERY_INTERACT+50) — ver o plano de
// religação (docs/5-Refactoring/plano-religacao-z-camadas.md).
//
// PÓS-PROCESSO ≠ camada Z: CRT/vinheta e os filtros de a11y (alto-contraste, correção de daltonismo, simulação de
// deficiência) são uma CADEIA de passes sobre o frame JÁ COMPOSTO (POST_FX_ORDER), não itens da display-list — e cobrem
// TUDO, inclusive o menu. A11Y_CORRECTION é SEMPRE o último passe (senão o CRT re-tinge e quebra a correção CB); modos
// de a11y SUPRIMEM o CRT/efeitos decorativos; o overlay é palette-aware (troca p/ CB-safe). Ver ADR-0020 + ADR-0011.

export const Z = {
  // ===== MUNDO (por viewport; PIXI zIndex dentro da câmera) =====
  SKY: 1000,                 // gradiente de céu (base)
  SKY_ANIM: 2000,            // animações do céu atrás do parallax (estrelas)
  PARALLAX_4: 3000,          // paralaxe mais distante (céu/horizonte). Nuvens/pássaros de céu entram em PARALLAX_*+offset
  PARALLAX_3: 4000,
  PARALLAX_2: 5000,
  PARALLAX_1: 6000,          // fundo próximo do jogo
  BG_DECOR: 7000,            // deco ATRÁS dos tiles: árvores, água/corais/algas de fundo, ruínas, deco de cidade
  TILES: 8000,               // tileset / plataforma (o nível)
  SCENERY_INTERACT: 9000,    // cenário interativo: porta, alavanca, interruptor, manivela, corda, portão, rampa, elevador
  VFX_BACK: 10000,           // efeitos ATRÁS dos atores: poeira de pé, god-rays, tracinhos de lava, sombras
  FAUNA_DECOR: 11000,        // criaturas/vida não-interativa atrás do player (bichos da cidade, grama)
  NPC: 12000,                // personagens interativos (não-jogador)
  ITEMS: 13000,              // coletáveis (moedas, poderes, chave) — ATRÁS do player (barril DK / Yoshi / chave SMW)
  PLAYER: 14000,             // jogador(es). Aparatos presos (bengala/cadeira) = PLAYER+offset
  VFX_FRONT: 15000,          // efeitos NA FRENTE do player: partículas/juice, explosão, faísca, fogos, confete
  VEHICLES: 16000,           // veículos na frente (carros/trânsito da cidade)
  FOREGROUND: 17000,         // primeiro-plano oclusivo (bichos v3 desenhados à frente, props que tampam o ator)
  WEATHER: 18000,            // clima na frente de tudo do mundo (névoa, chuva, clarão)
  DARK_WORLD: 19000,         // escurecimento do mundo (modo cego / empatia baixa-visão)
  WORLD_A11Y: 20000,         // pistas visuais de a11y no mundo (sonar, guarda de beirada, hitbox fácil, realce)

  // ===== OVERLAY (global, tela; = CSS z-index no DOM / topo da stage PIXI) =====
  HUD: 21000,                // placar/moedas/poder/objetivo/minimapa (persistente durante o jogo)
  TOUCH_CONTROLS: 22000,     // gamepad virtual / botões de toque (mobile)
  CAPTIONS: 23000,           // legendas de som (a11y surdez)
  DIALOGUE: 24000,           // fala/diálogo/atividade (quiz)
  GAME_MSG: 25000,           // vitória / game over / pause / faixa de fase
  MODAL_SCRIM: 26000,        // escurecimento do fundo quando abre um modal
  MENU: 27000,               // menus — RANGE reservado 27000–29999 (níveis aninhados: +1000 por nível)
  MENU_MAX: 29999,
  TRANSITION: 30000,         // fade/wipe de troca de fase (cobre tudo)
  DEBUG: 90000,              // painel ?debug / FPS / hitboxes (dev; topo absoluto)
} as const;

export type LayerName = keyof typeof Z;

// Cadeia de PÓS-PROCESSO — passes sobre o frame COMPOSTO, do interno p/ o externo. NÃO são camadas Z.
// A11Y_CORRECTION é SEMPRE o último (correção CB/contraste tem de valer sobre a imagem final, inclusive menus). Modos
// de a11y suprimem CRT_VIGNETTE e flashes decorativos (precedência a11y > estética). Ver ADR-0020.
export const POST_FX_ORDER = ['CRT_VIGNETTE', 'EMPATHY_SIM', 'A11Y_CORRECTION'] as const;
export type PostFx = typeof POST_FX_ORDER[number];
