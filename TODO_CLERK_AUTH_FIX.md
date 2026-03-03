# Clerk Auth Fix - TODO List

## Task
Sửa lỗi `getAuth(req)` thành `await auth()` cho Clerk Next.js v6+

## Status
- [x] app/api/boards/route.ts - Fixed
- [x] app/api/columns/route.ts - Fixed
- [x] app/api/tasks/route.ts - Fixed
- [x] app/api/labels/route.ts - Fixed
- [x] app/api/comments/route.ts - Fixed
- [x] app/api/activity-logs/route.ts - Fixed
- [x] app/api/export/route.ts - Fixed
- [x] app/api/boards/[id]/route.ts - Fixed
- [x] app/api/tasks/[id]/route.ts - Fixed
- [x] app/api/reminders/route.ts - Already correct

## Changes Made
1. Thay `import { getAuth } from "@clerk/nextjs/server"` thành `import { auth } from "@clerk/nextjs/server"`
2. Thay `const { userId } = getAuth(req)` thành `const { userId } = await auth()`
3. Thêm `await` cho các hàm async

## Testing
- [ ] Chạy `npm run build` để kiểm tra lỗi
- [ ] Test các API endpoints
