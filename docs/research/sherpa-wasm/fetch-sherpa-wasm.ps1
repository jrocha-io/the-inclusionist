# SPDX-License-Identifier: GPL-3.0-or-later
# Baixa um bundle sherpa-onnx-wasm TTS PRONTO (Space inglês do k2-fsa — SEM compilar Emscripten) +
# modelos VITS/Piper pt-BR. Reusamos o motor + o espeak-ng-data já assados no .data do bundle; os
# modelos pt-BR são escritos no FS do WASM em runtime pela página (sherpa-lab.html).
#
# Uso (PowerShell 7+, na raiz do repo ou em qualquer lugar):
#   pwsh docs/research/sherpa-wasm/fetch-sherpa-wasm.ps1
# Depois:  npx serve docs/research   → abra /sherpa-lab.html
#
# Requisitos: Invoke-WebRequest (nativo) + `tar` (nativo no Windows 10+; extrai .tar.bz2).

$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# 1) Bundle WASM pronto (motor Emscripten + wrapper + espeak-ng-data assado no .data)
$space = 'https://huggingface.co/spaces/k2-fsa/web-assembly-tts-sherpa-onnx-en/resolve/main'
$wasm  = @(
  'sherpa-onnx-wasm-main-tts.js',    # glue Emscripten (define/usa o global Module)
  'sherpa-onnx-wasm-main-tts.wasm',
  'sherpa-onnx-wasm-main-tts.data',  # FS pré-carregado: inclui espeak-ng-data (multilíngue!)
  'sherpa-onnx-tts.js'               # wrapper: define createOfflineTts(Module, config)
)
foreach ($f in $wasm) {
  $out = Join-Path $dir $f
  Write-Host "[wasm] baixando $f ..."
  Invoke-WebRequest -Uri "$space/$f" -OutFile $out
}

# 2) Modelos pt-BR (só precisamos do .onnx + tokens.txt de cada um; o espeak-ng-data vem do bundle)
$models = @('vits-piper-pt_BR-miro-high', 'vits-piper-pt_BR-faber-medium', 'vits-piper-pt_BR-jeff-medium')
$rel = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models'
foreach ($m in $models) {
  $tar = Join-Path $dir "$m.tar.bz2"
  Write-Host "[modelo] baixando $m ..."
  Invoke-WebRequest -Uri "$rel/$m.tar.bz2" -OutFile $tar
  Write-Host "[modelo] extraindo $m ..."
  tar -xf $tar -C $dir
  # normaliza p/ nomes fixos que a página espera: <modelo>/model.onnx e <modelo>/tokens.txt
  $onnx   = Get-ChildItem -Path (Join-Path $dir $m) -Recurse -Filter *.onnx   | Select-Object -First 1
  $tokens = Get-ChildItem -Path (Join-Path $dir $m) -Recurse -Filter tokens.txt | Select-Object -First 1
  if ($onnx)   { Copy-Item $onnx.FullName   (Join-Path $dir "$m/model.onnx")  -Force }
  if ($tokens) { Copy-Item $tokens.FullName (Join-Path $dir "$m/tokens.txt")  -Force }
  Remove-Item $tar -Force
  Write-Host "[modelo] $m -> $m/model.onnx (+ tokens.txt)"
}

Write-Host ""
Write-Host "Pronto. Sirva a pasta e abra a página:"
Write-Host "   npx serve docs/research"
Write-Host "   -> http://localhost:3000/sherpa-lab.html (a porta pode variar)"
