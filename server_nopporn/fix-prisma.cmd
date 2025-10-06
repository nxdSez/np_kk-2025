@echo off
title Fix Prisma Client Error (Auto Script)
echo ===========================================
echo 🔧 กำลังแก้ปัญหา Prisma Client...
echo ===========================================

REM ไปยังโฟลเดอร์โปรเจกต์ของคุณ (เปลี่ยน path ให้ตรง)
cd /d "C:\Users\Acer\OneDrive - Ubon Ratchathani University\Documents\GitHub\np_kk-2025\server_nopporn"

echo.
echo 🧹 ลบโฟลเดอร์ node_modules และไฟล์ Prisma ที่เสีย...
rmdir /s /q node_modules
del /f /q package-lock.json
echo ✅ ลบเรียบร้อย

echo.
echo 📦 กำลังติดตั้ง dependencies ใหม่...
npm install
if %errorlevel% neq 0 (
  echo ❌ ติดตั้ง dependencies ไม่สำเร็จ!
  pause
  exit /b
)

echo.
echo⚙️ กำลังสร้าง Prisma Client ใหม่...
npx prisma generate --force
if %errorlevel% neq 0 (
  echo ❌ Prisma generate ล้มเหลว!
  pause
  exit /b
)
echo ✅ สร้าง Prisma Client สำเร็จ!

echo.
echo 🚀 กำลังตรวจสอบการเชื่อมต่อ Prisma...
npx prisma version
if %errorlevel% neq 0 (
  echo ❌ Prisma ยังไม่ทำงาน!
  pause
  exit /b
)

echo.
echo ===========================================
echo ✅ Prisma แก้ไขเรียบร้อย พร้อมใช้งาน!
echo ===========================================

pause
