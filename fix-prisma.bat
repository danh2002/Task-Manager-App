@echo off
echo Stopping any running Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Removing old Prisma client...
if exist "node_modules\.prisma" rmdir /S /Q "node_modules\.prisma"

echo Generating Prisma client...
npx prisma generate --schema=prisma/schema.prisma

echo Done!
pause
