@echo off
REM ==============================================================================
REM SNMR FAB INDIA PRIVATE LIMITED - Database Automatic Backup Script (Windows)
REM Runs pg_dump to backup PostgreSQL database to a timestamped file.
REM Keeps the last 7 days of backups to save storage.
REM ==============================================================================

setlocal enabledelayedexpansion

set PGUSER=hrms_admin
set PGPASSWORD=hrms_password
set PGHOST=localhost
set PGPORT=5433
set PGDATABASE=hrms_db

set BACKUP_DIR=%~dp0..\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%%datetime:~12,2%
set BACKUP_FILE=%BACKUP_DIR%\snmr_hrms_backup_%TIMESTAMP%.sql

echo [%date% %time%] Starting PostgreSQL backup for SNMR FAB INDIA...
pg_dump -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -F p -f "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo [%date% %time%] Backup SUCCESSFUL: %BACKUP_FILE%
) else (
    echo [%date% %time%] Backup FAILED! Please verify PostgreSQL service and credentials.
)

REM Cleanup: Delete backup files older than 7 days
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -7 /c "cmd /c del @path" 2>nul

echo [%date% %time%] Done.
