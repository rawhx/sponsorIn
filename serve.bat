@echo off
cd /d "%~dp0"
echo ========================================================
echo   Menjalankan SponsorIn Local Server
echo   Akses di browser: http://localhost:8000
echo ========================================================
"C:\laragon\bin\php\php-8.5.10-Win32-vs17-x64\php.exe" artisan serve --host=127.0.0.1 --port=8000
pause
