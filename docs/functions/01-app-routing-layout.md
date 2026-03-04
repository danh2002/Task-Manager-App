# 01 - App Routing & Layout Functions

## 1) `RootLayout`
- File path: `app/layout.tsx`
- Vai trò: Root shell của toàn bộ ứng dụng; gắn auth provider, theme provider, context provider, sidebar, header và vùng render chính.
- Khi nào được gọi: Next.js gọi ở mọi route thuộc app router.
- Input: `children: React.ReactNode`.
- Output: cây JSX layout hoàn chỉnh.
- Luồng xử lý:
  1. Bọc app bằng `ClerkProvider`.
  2. Gắn `ChunkErrorHandler` để auto-reload khi lỗi chunk.
  3. Render `<html>/<body>` và top loader.
  4. Bọc `ThemeProvider` -> `ContextProvider` -> `GlobalStyleProvider`.
  5. Nếu đã đăng nhập (`SignedIn`), hiện `Sidebar` và `ReminderNotification`.
- Validation & guard: dựa trên `SignedIn/SignedOut` để ẩn/hiện thành phần theo trạng thái auth.
- Tác dụng phụ: không mutate dữ liệu; chỉ setup cấu trúc render + provider.
- Edge cases: hydration mismatch được giảm bằng `suppressHydrationWarning`.
- Lỗi thường gặp + debug:
  - Nếu header/user button không hiện: kiểm tra Clerk keys và session.
  - Nếu style lệch: kiểm tra CSS variables từ theme providers.
- Phụ thuộc: `ClerkProvider`, `ThemeProvider`, `ContextProvider`, `GlobalStyleProvider`, `Sidebar`, `ReminderNotification`.
- Ví dụ: route `/board/:id` vẫn dùng layout này, chỉ thay `children` bằng `BoardPage`.

## 2) `Home`
- File path: `app/page.tsx`
- Vai trò: trang mặc định root; render danh sách board.
- Khi nào được gọi: truy cập `/`.
- Input: không có.
- Output: `<BoardList />`.
- Luồng xử lý: trả về component `BoardList`.
- Validation & guard: không có.
- Tác dụng phụ: không.
- Edge cases: nếu chưa đăng nhập, middleware/public route + UI auth quyết định hành vi.
- Lỗi thường gặp + debug: nếu trắng trang, kiểm tra `BoardList` và context.
- Phụ thuộc: `BoardList`.
- Ví dụ: user click logo về `/` sẽ vào đây.

## 3) `BoardPage`
- File path: `app/board/[id]/page.tsx`
- Vai trò: route chi tiết board theo `id`.
- Khi nào được gọi: truy cập `/board/<boardId>`.
- Input: `id` từ `useParams()`.
- Output: `<BoardView boardId={id} />` hoặc `Board not found`.
- Luồng xử lý:
  1. Lấy `boardId` từ params.
  2. Trên unmount, gọi `setCurrentBoard(null)` để tránh stale state.
  3. Nếu thiếu id, trả fallback text.
- Validation & guard: check `!boardId`.
- Tác dụng phụ: clear state board khi rời trang.
- Edge cases: params undefined trong phase hydration.
- Lỗi thường gặp + debug: board cũ còn dữ liệu khi đổi route -> kiểm tra cleanup `useEffect`.
- Phụ thuộc: `useGlobalState`, `BoardView`.
- Ví dụ: click card board trong `BoardList` chuyển vào route này.

## 4) `page` cho các màn danh mục task
- File path:
  - `app/completed/page.tsx`
  - `app/incomplete/page.tsx`
  - `app/important/page.tsx`
- Vai trò: lọc task theo nhóm trạng thái và dùng component `Tasks` chung.
- Khi nào được gọi: truy cập `/completed`, `/incomplete`, `/important`.
- Input: state từ global provider (`completedTasks`, `incompletedTasks`, `importantTasks`).
- Output: `<Tasks title="..." tasks={...} />`.
- Luồng xử lý: đọc mảng đã lọc từ context và render.
- Validation & guard: phụ thuộc dữ liệu context.
- Tác dụng phụ: không.
- Edge cases: list rỗng -> `Tasks` hiển thị empty state.
- Lỗi thường gặp + debug: nếu không cập nhật sau thao tác -> kiểm tra `allTasks()` gọi lại sau CRUD.
- Phụ thuộc: `useGlobalState`, `Tasks`.
- Ví dụ: user mở menu Incomplete để xem task chưa hoàn thành.

## 5) `page` cho auth screens
- File path:
  - `app/signin/page.tsx`
  - `app/signup/page.tsx`
- Vai trò: render UI auth của Clerk.
- Khi nào được gọi: truy cập `/signin` hoặc `/signup`.
- Input: không.
- Output: `<SignIn />` hoặc `<SignUp />` bên trong container căn giữa.
- Luồng xử lý: render component Clerk tương ứng.
- Validation & guard: Clerk xử lý auth state.
- Tác dụng phụ: auth cookies/session do Clerk quản lý.
- Edge cases: redirect loop nếu middleware cấu hình sai public routes.
- Lỗi thường gặp + debug: kiểm tra `middleware.ts` và env Clerk keys.
- Phụ thuộc: `@clerk/nextjs`.
- Ví dụ: user chưa login bị redirect vào `/signin`.

## 6) `Error` và `handleReload`
- File path: `app/error.tsx`
- Vai trò: error boundary UI cho app router segment.
- Khi nào được gọi: khi throw lỗi runtime trong tree segment.
- Input:
  - `error: Error & { digest?: string }`
  - `reset: () => void`
- Output: error screen với 2 action `Reload Page` và `Try Again`.
- Luồng xử lý:
  1. Log lỗi trong `useEffect`.
  2. Xác định lỗi chunk load (`Loading chunk`/`ChunkLoadError`).
  3. Render message phù hợp.
- Validation & guard: check chuỗi message lỗi.
- Tác dụng phụ: `handleReload` gọi `window.location.reload()`.
- Edge cases: message lỗi undefined -> fallback generic text.
- Lỗi thường gặp + debug: chunk error lặp -> clear cache trình duyệt + deploy đồng bộ.
- Phụ thuộc: error boundary của Next.js.
- Ví dụ: deploy phiên bản mới trong khi user còn bundle cũ.

## 7) `middleware` auth flow
- File path: `middleware.ts`
- Vai trò: middleware bảo vệ route bằng Clerk.
- Khi nào được gọi: mọi request match theo `config.matcher`.
- Input: `auth`, `req`, `evt` qua `afterAuth` callback.
- Output: `NextResponse.next()` hoặc redirect `/signin`.
- Luồng xử lý:
  1. Cho phép API routes đi qua để handler tự xử lý auth.
  2. Với non-API route: nếu user chưa login và route không public -> redirect signin.
- Validation & guard:
  - `publicRoutes`: `/`, `/signin`, `/signup`
  - `ignoredRoutes`: `/api/public`
- Tác dụng phụ: redirect HTTP.
- Edge cases: nếu thêm route public mới mà quên khai báo sẽ bị redirect sai.
- Lỗi thường gặp + debug:
  - 404/redirect lạ do `matcher` không đúng static asset.
- Phụ thuộc: `authMiddleware` từ Clerk.
- Ví dụ: user anonymous truy cập `/board/abc` -> redirect `/signin`.
