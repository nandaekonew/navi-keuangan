@echo off
title Push Navi Keuangan ke GitHub
color 0B
cd /d "%~dp0"
set "PATH=D:\git\cmd;%PATH%"

echo ============================================================
echo   PUSH APLIKASI NAVI KEUANGAN KE GITHUB
echo ============================================================
echo Lokasi Folder: %~dp0
echo Repository Tujuan: https://github.com/nandaekonew/navi-keuangan.git
echo.
echo Menjalankan git push ke branch main...
echo (Jika diminta, masukkan Username dan Personal Access Token GitHub Anda)
echo.

if not exist ".git" (
    git init
    git remote add origin https://github.com/nandaekonew/navi-keuangan.git
)

git add .
git commit -m "feat: update aplikasi navi keuangan" 2>nul
git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ============================================================
    echo   BERHASIL! Kode sudah ter-push ke GitHub.
    echo ============================================================
) else (
    echo Gagal melakukan push. Pastikan repository sudah dibuat di GitHub
    echo dan token atau hak akses Anda sesuai.
)
pause
