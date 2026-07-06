// SPDX-License-Identifier: GPL-3.0-or-later
// render/scene-sky — matemática do CÉU de tela (deriva das nuvens). Núcleo PURO extraído p/ corrigir o bug das nuvens
// (#21) num lugar só (DRY): a tela de título e o decor v3 usavam duas contas de posição diferentes, ambas com as mesmas
// duas falhas — (a) movimento travado (posição arredondada + deriva <1px/frame → "some e reaparece 1px adiante") e
// (b) a nuvem some quando só a METADE tocou a borda (o wrap testava o ponto de referência, não o corpo inteiro).
// Sem estado nem DI: é função pura, testável com ZOMBIES/Right-BICEP. Ver docs/5-Refactoring/plano-modularizacao-mapa.md (#43).

/**
 * Posição horizontal de uma nuvem à deriva, com wrap SUB-PIXEL e pelo CORPO INTEIRO.
 * @param phase   distância de deriva acumulada (float; cresce → direita, decresce → esquerda)
 * @param enterAt x onde a nuvem (re)entra — passe `-larguraDaNuvem` p/ ela reentrar TOTALMENTE fora da tela
 * @param span    período do wrap — passe `larguraDaTela + larguraDaNuvem` p/ ela só reentrar depois de sair inteira
 * @returns x float no intervalo [enterAt, enterAt + span)
 * Corrige #21: (a) NÃO arredonda → deriva suave mesmo a <1px/frame; (b) o intervalo cobre a nuvem inteira entrando e
 * saindo, então o wrap acontece com a nuvem fora da tela (sem sumiço na meia-borda). Serve os dois sentidos de deriva.
 */
export function cloudWrapX(phase: number, enterAt: number, span: number): number {
  return ((phase % span) + span) % span + enterAt;
}
