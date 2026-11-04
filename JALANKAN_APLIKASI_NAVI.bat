@echo off
title Menjalankan Aplikasi Management Keuangan Navi
color 0A
cd /d "%~dp0"
set "PATH=D:\nodejs;D:\git\cmd;%PATH%"

echo ============================================================
echo   APLIKASI MANAGEMENT KEUANGAN NAVI (MULTI-USER)
echo ============================================================
echo Lokasi Folder: %~dp0
echo.
echo Sedang menyiapkan server aplikasi...
echo Jangan tutup jendela ini selama menggunakan aplikasi.
echo.

start "" "http://localhost:3000"
npm run dev
pause
