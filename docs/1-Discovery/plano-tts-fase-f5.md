# Fase F5 — TTS neural (pesquisa + plano de integração)

Pesquisa **antes de codar** (José). Fontes ao final. Conclusões marcadas ⚠️ devem ser reconfirmadas contra os repositórios no momento da integração.

## 🔴 Achado crítico: só o Piper tem pt-BR de fato
| Motor | pt-BR? | Tamanho (onnx) | Velocidade em CPU fraca | Licença | Lib no navegador |
|---|---|---|---|---|---|
| **Piper** | ✅ **Sim** (`pt_BR-faber-medium` masc.; comunidade: "Razo", "edresson") | low ~20 MB · medium ~60 MB | **Rápido** (perto de tempo real; feito p/ CPU) | **piper1-gpl = GPLv3** (casa com nosso GPL-3.0); fonemizador **espeak-ng = GPLv3** | `@mintplex-labs/piper-tts-web` / `piper-tts-web` (ONNX Runtime Web + WASM) |
| **Kitten** | ❌ **Não** (só inglês — vozes Bella/Jasper/Bruno…) | < 25 MB (15 M params) | Muito rápido | Apache-2.0 | transformers.js / ONNX (ex.: kitten-tts-web-demo) |
| **Kokoro-82M** | ⚠️ **Duvidoso no browser** (build ONNX é focado em inglês US/UK) | q8 ~86 MB · fp32 ~326 MB | **Lento** em hardware fraco (roda num RPi, mas devagar) | Apache-2.0 (modelo) · kokoro-js MIT | `kokoro-js` (transformers.js) |

**Consequência:** para o **jogo em pt-BR**, o **Piper é o único motor viável hoje**. **Kitten** (inglês, minúsculo, rápido) e **Kokoro** (qualidade, lento) só servem para os **builds i18n em outros idiomas** (portfólio nórdico/inglês — pilar de i18n), **não** para o pt-BR. Sua escolha "Piper primário" está correta; **Kitten/Kokoro deixam de ser secundário/opção para pt-BR** e viram opções **por idioma**.

## Caminho de integração (recomendado)
1. **Motor:** **`OHF-Voice/piper1-gpl`** (mantém a licença GPLv3 alinhada ao jogo) via **ONNX Runtime Web (WASM)**. Fonemizador **espeak-ng** compilado para WASM (usado **só para fonemas** — o áudio robótico do espeak **não** é usado; quem gera a voz é o modelo VITS do Piper).
2. **Voz pt-BR:** `pt_BR-faber-medium` (checar a licença específica da voz) ou treinar/adotar uma feminina (faltam vozes fem. pt-BR — issue aberta no repo).
3. **Pipeline:** texto → (espeak-ng WASM) fonemes → (Piper ONNX) PCM → `AudioBufferSourceNode` → **categoria `tts`** do mixer (F1) → nó mestre. Reaproveita todo o barramento.
4. **Cache/offline:** o modelo (~20–60 MB) precisa ficar **em cache** (Cache API/OPFS) após o 1º carregamento.

## Decisões (fechadas com o José)
- **D1 — Hospedagem:** ✅ **Lazy-fetch de CDN (HuggingFace) no 1º uso + cache** (Cache API/OPFS). Aceita internet **uma vez**; depois offline. (Ideal futuro: espelhar no servidor LAN da escola para o 1º uso também ser offline — deixar a URL configurável.)
- **D2 — Threads WASM:** ONNX Runtime Web acelera com **SIMD + multithread** (exigem **COOP/COEP**). Se o deploy não mandar os cabeçalhos, cai no **single-thread** (mais lento). Confirmar no deploy; começar assumindo single-thread e ligar threads se disponível.
- **D3 — Voz:** ✅ **Faber (masc.) agora**; arquitetura pronta para **oferecer as duas** (seleção de voz) quando surgir uma **feminina pt-BR** de qualidade.
- **D4 — i18n:** Kitten/Kokoro ficam **só** para builds de outros idiomas; pt-BR = Piper.

## Resultados esperados (a validar no hardware-alvo)
| Métrica | Expectativa | Como medir |
|---|---|---|
| 1º carregamento (download + init WASM) | poucos segundos (LAN) a dezenas (CDN/3G) | `performance.now()` no init |
| Latência por fala (Piper-low, Positivo) | **~tempo real** a ~1,5× | tempo entre `speak()` e 1º som |
| Latência Kokoro (se usado, outros idiomas) | **segundos** por frase | idem |
| Cache offline | 2ª sessão sem rede fala normalmente | testar offline |
| RAM | modelo + runtime cabem no tablet | monitorar |

## Próximo passo (quando decidir D1–D4)
F5 vira: (1) camada `tts.speak(texto)` com seleção de motor **por idioma** (pt-BR→Piper); (2) carregamento **lazy** do runtime+modelo (do local decidido em D1); (3) ganchos de narração (moedas restantes, eventos, menu) na categoria `tts`; (4) toggle TTS **independente das legendas**; (5) **teste no Positivo real**.

## Fontes
- Piper browser: [Mintplex-Labs/piper-tts-web](https://github.com/Mintplex-Labs/piper-tts-web) · [npm @mintplex-labs/piper-tts-web](https://www.npmjs.com/package/@mintplex-labs/piper-tts-web) · [piper-tts-web-demo](https://github.com/clowerweb/piper-tts-web-demo) · [rhasspy/piper #352 (browser)](https://github.com/rhasspy/piper/issues/352)
- Piper GPL + vozes: [OHF-Voice/piper1-gpl VOICES](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md) · [pt_BR faber (HF)](https://huggingface.co/Trelis/piper-pt-br-faber-medium) · [Razo pt-BR (HF)](https://huggingface.co/Lucasllfs/Razo-piper-voice) · [amostras](https://rhasspy.github.io/piper-samples/) · [issue voz fem. pt-BR](https://github.com/rhasspy/piper/issues/766)
- Kitten: [KittenML/KittenTTS](https://github.com/KittenML/KittenTTS) · [Kitten no browser (WASM/ONNX)](https://dev.to/soasme/running-kittentts-in-the-browser-a-deep-dive-into-wasm-and-onnx-18hk) · [kitten-tts-web-demo](https://github.com/clowerweb/kitten-tts-web-demo)
- Kokoro: [kokoro-js (Xenova)](https://huggingface.co/posts/Xenova/503648859052804) · [Kokoro-82M-ONNX (tamanhos/idiomas)](https://huggingface.co/onnx-community/Kokoro-82M-ONNX) · [Kokoro num Raspberry Pi (lento)](https://mikeesto.com/posts/kokoro-82m-pi/)
