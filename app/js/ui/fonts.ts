// SPDX-License-Identifier: GPL-3.0-or-later
// ui/fonts.ts — catálogo de fontes (dados) + índice por chave + carga/persistência da escolha. Módulo-folha
// (só depende de storage). A instância `fontKey` e o setGameFont (aplica família/espaçamento) ficam no game.js.
import * as store from '../platform/storage.js';

export type FontItem = { k: string; fam: string; fb: string; d?: string; off?: string };
export type FontGroup = { g: string; items: FontItem[] };
export const FONT_GROUPS: FontGroup[] = [
  {g:'Sem serifa', items:[
    {k:'atkinson',   fam:'Atkinson Hyperlegible', fb:'sans', d:'feita pelo Braille Institute para pessoas com baixa visão (padrão do jogo)'},
    {k:'lexend',     fam:'Lexend',                fb:'sans', d:'feita para reduzir stress visual e atender pessoas disléxicas (ativa o espaçamento extra)'},
    {k:'quattro',    fam:'iA Writer Quattro',     fb:'sans', d:'criada para diminuir a fadiga visual de quem passa muito tempo na tela'},
    {k:'andika',     fam:'Andika',                fb:'sans', d:'baseada na Sassoon; fruto de pesquisa sobre como crianças leem e escrevem'},
    {k:'sourcesans', fam:'Source Sans 3',         fb:'sans'},
    {k:'inter',      fam:'Inter',                 fb:'sans'},
    {k:'opensans',   fam:'Open Sans',             fb:'sans'},
    {k:'lato',       fam:'Lato',                  fb:'sans'} ]},
  {g:'Serifada', items:[
    {k:'literata',    fam:'Literata',       fb:'serif'},
    {k:'sourceserif', fam:'Source Serif 4', fb:'serif'},
    {k:'newsreader',  fam:'Newsreader',     fb:'serif'} ]},
  {g:'Manuscrita', items:[
    {k:'greatvibes', fam:'Great Vibes',         fb:'cursive', d:'caligráfica inglesa'},
    {k:'pinyon',     fam:'Pinyon Script',       fb:'cursive', d:'caligráfica inglesa'},
    {k:'ufcook',     fam:'UnifrakturCook',      fb:'cursive', d:'blackletter alemã'},
    {k:'ufmag',      fam:'UnifrakturMaguntia',  fb:'cursive', d:'blackletter alemã'},
    {k:'comicneue',  fam:'Comic Neue',          fb:'cursive', d:'bola e bastão (alfabetização)'},
    {k:'learningcurve', fam:'Learning Curve',   fb:'cursive', d:'cursiva inglesa', off:'licença a confirmar — ainda não embarcada'},
    {k:'kindergarten',  fam:'Kindergarten Pro', fb:'cursive', d:'cursiva brasileira', off:'licença em negociação'} ]},
];
export const FONT_BY_KEY: Record<string, FontItem> = {}; FONT_GROUPS.forEach((g) => g.items.forEach((it) => { FONT_BY_KEY[it.k] = it; }));

// escolha inicial: incl_font_k (validada; ignora fontes .off) -> migra a chave antiga incl_fonte -> 'atkinson'.
export function loadFontKey(): string {
  const k = store.get('incl_font_k', null); if (k && FONT_BY_KEY[k] && !FONT_BY_KEY[k].off) return k;
  const leg = store.get('incl_fonte', null); if (leg === 'alfabetizacao') return 'andika'; if (leg === 'dislexia') return 'lexend';
  return 'atkinson';
}
export function saveFontKey(k: string): void { store.set('incl_font_k', k); }
