# 02 - Global Context (`globalProvider.js`)

## Tổng quan

`GlobalProvider` là state hub chính của ứng dụng. Nó giữ state dùng chung (task, board, modal, theme), cung cấp actions CRUD và điều phối refresh dữ liệu sau thao tác.

## 1) `GlobalProvider`
- File path: `app/context/globalProvider.js`
- Vai trò: tạo và cung cấp `GlobalContext` cho toàn app.
- Khi nào được gọi: trong `ContextProvider`.
- Input: `children`.
- Output: `GlobalContext.Provider` chứa state + actions.
- Luồng xử lý:
  1. Khởi tạo state theme/modals/tasks/boards/currentBoard.
  2. Set `axios.defaults.baseURL` theo `window.location.origin`.
  3. Đồng bộ `data-theme` lên `documentElement` khi đổi theme.
  4. Khi có `user` từ Clerk -> gọi `allTasks()` và `allBoards()`.
  5. Tính các list dẫn xuất: completed/important/incompleted.
- Validation & guard: check `typeof window/document` để tránh SSR crash.
- Tác dụng phụ: localStorage, DOM attribute, API calls.
- Edge cases: race condition khi mở modal và update state liên tiếp.
- Lỗi thường gặp + debug: stale data nếu API thành công nhưng không refresh list.
- Phụ thuộc: `axios`, `toast`, `useUser`.
- Ví dụ: bất kỳ component con nào gọi `useGlobalState()` đều đọc được actions.

## 2) Modal & UI helpers

### `openModal`
- Vai trò: mở modal và force re-render.
- Trigger: click create/edit actions.
- Input: không.
- Output: `modal = true`.
- Side effects: log debug + `forceUpdate({})`.

### `closeModal`
- Vai trò: đóng modal và reset `editingTask`.
- Trigger: đóng modal UI/sau submit thành công.
- Output: `modal = false`, `editingTask = null`.
- Side effects: log debug + force update.

### `setEditingTaskWithLog`
- Vai trò: wrapper set task đang sửa, có log debug.
- Trigger: click task card.
- Input: object task.
- Output: cập nhật `editingTask`.

### `collapseMenu`
- Vai trò: toggle sidebar collapse flag.
- Output: đảo boolean `collapsed`.

### `toggleTheme`
- Vai trò: đổi dark/light index.
- Output: đổi `selectedtheme`.
- Side effects: lưu `theme` và `theme-name` vào localStorage.

## 3) Task actions

### `allTasks`
- Vai trò: lấy toàn bộ task của user.
- Input: không.
- Output: cập nhật `tasks` đã sort `createdAt` desc.
- Luồng xử lý:
  1. `GET /api/tasks`
  2. lấy `res.data.data.tasks`
  3. sort theo `createdAt`
  4. set state
- Guard: bọc try/catch.
- Side effects: set loading.
- Edge cases: API trả shape khác -> fallback `[]`.

### `deleteTask(id)`
- Vai trò: xóa task theo id.
- Input: `id`.
- Output: task bị remove server-side, list local refresh.
- Luồng xử lý:
  1. `DELETE /api/tasks/${id}` (kèm no-cache headers)
  2. toast success
  3. gọi `allTasks()`
- Side effects: network + toast.

### `updateTask(task)`
- Vai trò: cập nhật task qua API chung.
- Input: payload task.
- Output: task update server-side.
- Luồng xử lý: `PUT /api/tasks` -> success toast -> `allTasks()`.

## 4) Board actions

### `allBoards`
- Vai trò: lấy toàn bộ board của user.
- Output: set `boards`.
- Luồng xử lý: `GET /api/boards` -> đọc `res.data.data`.

### `getBoard(boardId)`
- Vai trò: lấy board chi tiết (columns + tasks).
- Input: `boardId`.
- Output: set `currentBoard`, đồng thời return data.
- Luồng xử lý: `GET /api/boards/:id` -> nếu success set state.
- Edge cases: lỗi trả `null` để caller fallback.

### `createBoard(boardData)`
- Vai trò: tạo board mới.
- Input: `{name,description,color}`.
- Output: board mới hoặc `null`.
- Luồng xử lý: `POST /api/boards` -> toast -> refresh `allBoards()`.
- Error handling: đọc `error.response?.data?.error`.

### `updateBoard(boardData)`
- Vai trò: cập nhật board.
- Input: payload có `id`.
- Output: board update server-side.
- Luồng xử lý: `PUT /api/boards` -> refresh danh sách + reload current board nếu trùng id.

### `deleteBoard(boardId)`
- Vai trò: xóa board.
- Input: `boardId`.
- Output: board bị xóa, clear `currentBoard` nếu đang mở.
- Luồng xử lý: `DELETE /api/boards/:id` -> refresh boards.

## 5) Column actions

### `createColumn(columnData)`
- Vai trò: tạo cột mới trong board.
- Input: `{name,color,boardId,position?}`.
- Output: column mới hoặc `null`.
- Luồng xử lý: `POST /api/columns` -> nếu current board trùng thì reload board.

### `updateColumn(columnData)`
- Vai trò: cập nhật tên/màu/vị trí cột.
- Input: `{id,...}`.
- Output: update server-side.
- Luồng xử lý: `PUT /api/columns` -> reload `currentBoard`.

### `deleteColumn(columnId, boardId)`
- Vai trò: xóa cột.
- Input: `columnId`, `boardId`.
- Output: column bị xóa.
- Luồng xử lý: `DELETE /api/columns?id=...` -> reload board tương ứng.

## 6) Hooks xuất ra

### `useGlobalState`
- Vai trò: hook truy cập state + actions từ `GlobalContext`.

### `useGlobalUpdate`
- Vai trò: hook cho `GlobalUpdateContext` (hiện đang để object rỗng).

## 7) Validation & security

- Không có auth guard ở context; auth được enforce ở API route.
- Context assume API trả đúng shape chuẩn `{ success, data, status }`.

## 8) Edge cases & debug nhanh

- Nếu modal không đóng: kiểm tra `closeModal` có bị override bởi event bubbling.
- Nếu task list không refresh: xác nhận `allTasks()` được gọi sau action.
- Nếu theme không giữ: kiểm tra `localStorage` key `theme` và `theme-name`.

## 9) Ví dụ thực tế luồng cập nhật task

1. User click task card -> `setEditingTaskWithLog`.
2. Modal mở form edit.
3. Submit form gọi API update.
4. Form gọi `allTasks()`.
5. Context cập nhật `tasks`, các page lọc tự re-render.
