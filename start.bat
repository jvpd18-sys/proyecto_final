@echo off
echo Iniciando SplitSmart...
echo.

echo [Backend] Activando entorno virtual e iniciando Django...
start "SplitSmart Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && python manage.py runserver 8000"

timeout /t 3 /nobreak > nul

echo [Frontend] Iniciando servidor de desarrollo React...
start "SplitSmart Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo Abriendo navegador en http://localhost:5173
start http://localhost:5173
