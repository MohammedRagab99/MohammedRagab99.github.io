@echo off
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0tracker.ps1" %*
exit /b %ERRORLEVEL%
