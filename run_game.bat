@echo off
chcp 65001 > nul
title Turbo Clash 2P - Multiplayer Racing Server

echo ===================================================================
echo     🏎️  TURBO CLASH 2P - MÁY CHỦ ĐUA XE SOCKET 2 NGƯỜI  🏁
echo ===================================================================
echo.
echo Đang kiểm tra Python và khởi động máy chủ...
echo.

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    py server.py
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    python server.py
    goto end
)

echo [!] Không tìm thấy Python trong hệ thống. Vui lòng cài đặt Python 3!
pause

:end
pause
