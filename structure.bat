@echo off
setlocal

set "OUTPUT=filestructure.txt"

rem Use PowerShell to recurse and exclude paths containing .git or venv
powershell -NoProfile -Command ^
  "Get-ChildItem -Recurse -Force | Where-Object { $_.FullName -notmatch '\\.git\\|\\venv\\' } | Sort-Object FullName | ForEach-Object { $_.FullName }" > "%OUTPUT%"

if errorlevel 1 (
  echo Error: PowerShell command failed.
  exit /b 1
)

echo Done. Output saved to %OUTPUT%
endlocal
