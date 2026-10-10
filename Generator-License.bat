@echo off
chcp 65001 >nul
title BisnisKu - License Generator

REM BisnisKu License Generator
REM Double-click file ini untuk membuat license file baru.
REM Hasilnya ada di folder licenses\

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  ❌ Node.js tidak ditemukan!
  echo.
  echo  Install Node.js dari https://nodejs.org lalu coba lagi.
  echo.
  pause
  exit /b 1
)

echo.
echo  ════════════════════════════════════════════
echo         BisnisKu - License Generator
echo  ════════════════════════════════════════════
echo.
echo  Pilih paket license:
echo    1. Tahunan  (365 hari)  [default]
echo    2. Bulanan  (30 hari)
echo.

set /p choice="Pilihan (1/2): "

if "%choice%"=="2" (
  set PLAN=monthly
) else (
  set PLAN=yearly
)

echo.
echo  Membuat license %PLAN%...
echo.

call npx tsx scripts/generate-license.ts --plan %PLAN%

echo.
echo  ════════════════════════════════════════════
echo  Selesai! File license ada di folder licenses\
echo  ════════════════════════════════════════════
echo.
pause
