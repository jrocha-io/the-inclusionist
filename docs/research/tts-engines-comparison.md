<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
# TTS engine comparison — pt-BR · en · es (research-first table)

**Goal:** pick the neural TTS engine(s) for The Inclusionist's narration, plus the always-available
fallbacks, for the three languages that matter now: **Portuguese (pt-BR), English, Spanish**.

**Method:** this is the *expected-results table* (research-first, per CLAUDE.md §4). The empirical
half — responsiveness (time-to-first-audio) and how each engine handles the five literacy tasks
(phonemes · spelling letters · spelling syllables · isolated words · sentences) — is measured in the
companion **[TTS engine lab](./tts-engine-lab.html)** (open it in a browser and run each engine).

> Sizes are **approximate** and per *quantization/quality tier*; the lab reports the real bytes each
> engine downloads on your machine. Confirm empirically before committing to one.

## Comparison

| Engine | Type | Download | pt-BR voices | en voices | es voices | Offline | Quality | Role |
|---|---|---|---|---|---|---|---|---|
| **Web Speech API** | Native OS voices | **0** | OS-dependent | OS-dependent | OS-dependent | ⚠️ not guaranteed (some browsers synth in the cloud) | Good but **inconsistent per device** | **Fallback** (zero-download) |
| **eSpeak NG** | Formant synth (WASM) | **~2–4 MB** | 1 (formant) | 1 | 1 | ✅ embedded | Robotic but intelligible; **great for isolated phonemes** | **Fallback** (embedded) + phoneme reference |
| **Piper** | Neural VITS (ONNX) | **~20 MB** (low) · **~63 MB** (medium) *per voice* | **2** (`edresson-low`, `faber-medium`) | ~20+ (US/GB) | ~5 (ES/MX) | ✅ after 1st download (OPFS) | Natural, solid | **Primary candidate** (already wired) |
| **Kokoro-82M** | Neural (StyleTTS2-like) | **~80 MB** (q8) · ~160 (fp16) · ~330 (fp32) — *one model, all langs* | ~3 (`pf_*`/`pm_*`) | many (`a*`/`b*`) | ~3 (`e*`) | ✅ after 1st download | Often **best** naturalness | **Alternative candidate** (heavier, WebGPU helps) |
| **KittenTTS** | Neural (tiny) | ~15–25 MB (int8) … ~80 MB | **0** | 8 (4M/4F) | **0** | ✅ | Decent for the size | **English-only today → not usable for pt/es** |

### Reading the table for our case
- **pt-BR is the priority**, and only **Piper** and **Kokoro** ship real neural pt-BR voices.
  **KittenTTS is English-only** — out for pt/es (revisit if a multilingual release lands).
- **Piper** = smallest per-voice footprint and *already integrated* (`@mintplex-labs/piper-tts-web`,
  ADR-0021). Downside: one model file *per voice per language* (~20–63 MB each).
- **Kokoro** = one ~80 MB model covers **all three languages** — better if we want pt+en+es without
  three separate downloads, at the cost of heavier per-utterance compute (WebGPU recommended).
- **eSpeak NG + Web Speech** are the fallbacks: eSpeak is tiny + embedded + fully offline (ideal for
  the *phoneme* drills where robotic clarity actually helps); Web Speech is zero-download but not a
  guaranteed-offline or consistent-quality baseline.

## Sources
- KittenTTS — size (<25 MB), 8 voices, English focus: [KittenML/KittenTTS (GitHub)](https://github.com/KittenML/KittenTTS),
  [kitten-tts-nano-0.1 (Hugging Face)](https://huggingface.co/KittenML/kitten-tts-nano-0.1),
  [Show HN: Kitten TTS – 25MB CPU-Only](https://news.ycombinator.com/item?id=44807868).
- On-device TTS landscape: [The 6 Best On-Device TTS Models — GetStream](https://getstream.io/blog/best-on-device-tts-models/).
- Piper voice IDs (pt/en/es) — from the installed lib's type surface (`@mintplex-labs/piper-tts-web`)
  and the upstream [piper voices catalog](https://huggingface.co/rhasspy/piper-voices).
- Kokoro — model card & voice list: [onnx-community/Kokoro-82M-v1.0-ONNX (Hugging Face)](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX).

*(Web search was partially unavailable during this pass; Piper/Kokoro sizes and voice counts are from
the installed lib + model cards + prior knowledge and are marked approximate. The lab confirms them.)*
