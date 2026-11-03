@echo off
title Menjalankan Aplikasi Management Keuangan Navi
color 0A
cd /d "D:\2. FILE NANDA\NANDA AI"
set "PATH=D:\nodejs;%PATH%"

echo ============================================================
echo   APLIKASI MANAGEMENT KEUANGAN NAVI (MULTI-USER)
echo ============================================================
echo.
echo Sedang menyiapkan server aplikasi...
echo Jangan tutup jendela ini selama menggunakan aplikasi.
echo.

start "" "http://localhost:3000"
npm run dev
pause
