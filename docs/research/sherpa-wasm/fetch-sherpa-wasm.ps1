# SPDX-License-Identifier: GPL-3.0-or-later
# Baixa os modelos VITS/Piper pt-BR (miro/faber/jeff) para o sherpa-lab.html.
# Os artefatos WASM (sherpa-onnx-wasm-main-tts.{js,wasm,data} + sherpa-onnx-tts.js) você GERA você mesmo no WSL
# (emsdk + ./build-wasm-simd-tts.sh, com faber-medium de recheio) e copia para esta mesma pasta — ver README.md.
# O espeak-ng-data vem assado no .data do seu build; aqui só baixamos os .onnx + tokens.txt das vozes.
#
# Uso (PowerShell 7+):  pwsh docs/research/sherpa-wasm/fetch-sherpa-wasm.ps1
# Depois:  npx serve docs/research   → abra /sherpa-lab.html
# Requisitos: Invoke-WebRequest (nativo) + `tar` (nativo no Windows 10+; extrai .tar.bz2).

$ErrorActionPreference = 'Stop'
$dir = $PSScriptRoot
New-Item -ItemType Directory -Force -Path $dir | Out-Null

# Modelos pt-BR (só precisamos do .onnx + tokens.txt de cada um; o espeak-ng-data vem do SEU build wasm)
$models = @('vits-piper-pt_BR-miro-high', 'vits-piper-pt_BR-faber-medium', 'vits-piper-pt_BR-jeff-medium')
$rel = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models'
foreach ($m in $models) {
  try {
    $tar = Join-Path $dir "$m.tar.bz2"
    Write-Host "[modelo] baixando $m ..."
    Invoke-WebRequest -Uri "$rel/$m.tar.bz2" -OutFile $tar
    Write-Host "[modelo] extraindo $m ..."
    tar -xf $tar -C $dir
    $vd = Join-Path $dir $m
    # normaliza p/ os nomes que a página espera: <modelo>/model.onnx e <modelo>/tokens.txt
    # (o tokens.txt já vem com o nome certo — só copiar se a origem for DIFERENTE do destino)
    $onnx = Get-ChildItem -Path $vd -Recurse -Filter *.onnx | Select-Object -First 1
    $dst  = Join-Path $vd 'model.onnx'
    if ($onnx -and ($onnx.FullName -ne $dst)) { Copy-Item $onnx.FullName $dst -Force }
    $tok  = Get-ChildItem -Path $vd -Recurse -Filter tokens.txt | Select-Object -First 1
    $tdst = Join-Path $vd 'tokens.txt'
    if ($tok -and ($tok.FullName -ne $tdst)) { Copy-Item $tok.FullName $tdst -Force }
    Remove-Item $tar -Force
    Write-Host "[modelo] $m -> ok (model.onnx + tokens.txt)"
  } catch { Write-Warning "[modelo] $m falhou: $($_.Exception.Message)" }
}

Write-Host ""
Write-Host "Pronto. Sirva a pasta e abra a página:"
Write-Host "   npx serve docs/research"
Write-Host "   -> http://localhost:3000/sherpa-lab.html (a porta pode variar)"
