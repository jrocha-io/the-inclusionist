// SPDX-License-Identifier: GPL-3.0-or-later
// Locale pt-BR — idioma base (import ESTÁTICO em core/i18n.js → boot síncrono). Ver docs/plano-i18n.md.
// A UI em pt é extraída em lotes; en/es caem no fallback pt até serem completados (Etapa 4).
export default {
  // Chrome / navegação
  'skip.toGame': 'Pular para o jogo',
  'menu.ludico': 'Lúdico',
  'menu.alfabetizacao': 'Alfabetização',
  'menu.matematica': 'Matemática',

  // Tela de título
  'title.byline': 'by Prof. José Rocha',
  'title.wait': 'Aguarde o Jogador 1 escolher o jogo',

  // Vitória
  'win.title': '🎉 Você coletou as 10 moedas!',
  'win.again': 'Jogar de novo',

  // Menu de pausa (por tela — buildScreenPause). O botão de letra (ABC/abc/Braille) é dinâmico, fica fora.
  'pause.title': 'Pausado',
  'pause.resume': '▶ Continuar',
  'pause.tipo': '🔤 Tipografia',
  'pause.addplayer': '👥 Adicionar jogador',
  'pause.audio': '🦻 Acessibilidade auditiva',
  'pause.motora': '♿ Acessibilidade motora',
  'pause.anim': '🎞 Sensibilidade visual',
  'pause.visual': '🎨 Acessibilidade visual',
  'pause.empatia': '🫂 Modo empatia',
  'pause.ajuda': '❓ Ajuda',
  'pause.print': '📷 Print (ver a tela)',
  'pause.quit': '🚪 Sair do jogo',

  // Acessibilidade (leitores de tela)
  'a11y.gameRegion': 'Área de jogo. Mova com A e D ou setas; pule com L ou Espaço; suba e desça escadas (e nade na água) com W e S ou setas; corra com P ou Shift. Colete 10 moedas.',
  'game.instructions': 'Mova o personagem pela caverna e colete 10 moedas. Sem limite de tempo. Controles: A e D ou setas movem; L ou Espaço pulam; W e S (ou setas cima/baixo) sobem/descem escadas e nadam; P ou Shift correm.',
};
