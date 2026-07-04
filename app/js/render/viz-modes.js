// SPDX-License-Identifier: GPL-3.0-or-later
// render/viz-modes.js — os 16 modos visuais de acessibilidade (dados) + índices derivados. Módulo-folha, ZERO
// deps. Alto contraste (renderização direta 3 níveis), simulação/correção de daltonismo, baixa visão, cegueira.
// A aplicação dos modos (setPlayerViz/applyVpFilters/overlays) fica no game.js. Ver docs/PESQUISA-ALTO-CONTRASTE.md.
export const VIZ_MODES = [
  {key:'normal', kind:'normal', nome:'Cores normais',        desc:'Arte original do jogo.'},
  {key:'hc-direto', kind:'hcnew', nome:'Alto contraste: Renderização Direta (3:1)', desc:'Fundo recua + contornos + cor por papel; plataforma×fundo ~3:1 (AA gráficos), tons agradáveis.'},
  {key:'hc-direto-45', kind:'hcnew', nome:'Alto contraste: Renderização Direta (4,5:1)', desc:'Mais contraste (AA texto): plataformas mais claras e fundo mais escuro.'},
  {key:'hc-direto-7', kind:'hcnew', nome:'Alto contraste: Renderização Direta (7:1)', desc:'Contraste máximo (AAA texto): quase preto e branco. Menos agradável, para quem precisa do máximo.'},
  {key:'sim-deuter', kind:'filter', filter:'url(#cvd-deuter)', nome:'Simular Deuteranopia', desc:'Como vê quem não enxerga o verde (mais comum).'},
  {key:'sim-protan', kind:'filter', filter:'url(#cvd-protan)', nome:'Simular Protanopia',   desc:'Como vê quem não enxerga o vermelho.'},
  {key:'sim-tritan', kind:'filter', filter:'url(#cvd-tritan)', nome:'Simular Tritanopia',   desc:'Como vê quem não enxerga o azul.'},
  {key:'fix-protan', kind:'filter', filter:'url(#cvd-fix-protan)', nome:'Correção protanopia', desc:'Daltonização: realça a distinção vermelho/verde para quem tem protanopia.'},
  {key:'fix-deuter', kind:'filter', filter:'url(#cvd-fix-deuter)', nome:'Correção deuteranopia', desc:'Daltonização: realça a distinção vermelho/verde para quem tem deuteranopia.'},
  {key:'fix-tritan', kind:'filter', filter:'url(#cvd-fix-tritan)', nome:'Correção tritanopia', desc:'Daltonização: realça a distinção azul/amarelo para quem tem tritanopia.'},
  {key:'lv-blur',     kind:'lowvision', lv:'blur',     nome:'Baixa visão: desfoque',         desc:'Miopia severa / astigmatismo. (bolinha verde; toque 2× p/ sair)'},
  {key:'lv-haze',     kind:'lowvision', lv:'haze',     nome:'Baixa visão: névoa',            desc:'Catarata — película esbranquiçada, baixo contraste.'},
  {key:'lv-tunnel',   kind:'lowvision', lv:'tunnel',   nome:'Baixa visão: visão de túnel',   desc:'Glaucoma — só o centro é visível.'},
  {key:'lv-macular',  kind:'lowvision', lv:'macular',  nome:'Baixa visão: mancha central',   desc:'Degeneração macular — borrão no centro.'},
  {key:'lv-diabetic', kind:'lowvision', lv:'diabetic', nome:'Baixa visão: manchas dispersas',desc:'Retinopatia diabética — manchas espalhadas.'},
  {key:'blind', kind:'blind', nome:'Simular cegueira total', desc:'Tela preta — jogue como uma pessoa cega (resposta tátil/sonora). (bolinha branca; toque 2× p/ sair)'},
];
export const VIZ_BY_KEY = Object.fromEntries(VIZ_MODES.map((m) => [m.key, m]));
export const VIZ_FILTER = {'sim-deuter':'url(#cvd-deuter)','sim-protan':'url(#cvd-protan)','sim-tritan':'url(#cvd-tritan)',
  'fix-protan':'url(#cvd-fix-protan)','fix-deuter':'url(#cvd-fix-deuter)','fix-tritan':'url(#cvd-fix-tritan)',
  'lv-blur':'blur(2.4px)', 'lv-haze':'contrast(.58) brightness(1.14) blur(.6px)', 'lv-tunnel':'blur(.5px)', 'lv-macular':'', 'lv-diabetic':'blur(.8px)', 'blind':'brightness(0)'};
export const VIZ_CYCLE = VIZ_MODES.map((m) => m.key);
