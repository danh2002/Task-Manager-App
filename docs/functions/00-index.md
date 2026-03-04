# Function Reference Index

Tài liệu này là mục lục tra cứu function cho toàn bộ `task-manager-app` (không gồm `clerk-nextjs/`).

## Quy ước

- `CORE`: function ảnh hưởng trực tiếp đến luồng nghiệp vụ chính.
- `SUPPORT`: function phục vụ UI/logic phụ nhưng vẫn quan trọng.
- `UTILITY`: helper/formatter/hook tiện ích.

Mỗi entry function trong các file 01-06 đều theo cùng template:

1. Tên function + file path
2. Vai trò
3. Khi nào được gọi
4. Input
5. Output
6. Luồng xử lý
7. Validation & guard
8. Tác dụng phụ
9. Edge cases
10. Lỗi thường gặp + debug
11. Phụ thuộc
12. Ví dụ thực tế

## Mục lục theo module

### App routing/layout

Xem: `01-app-routing-layout.md`

- `RootLayout` (`CORE`)
- `Home` page root (`CORE`)
- `BoardPage` (`CORE`)
- `page` cho `completed`, `incomplete`, `important`, `signin`, `signup` (`SUPPORT`)
- `Error`, `handleReload` (`SUPPORT`)
- `middleware` auth flow (`CORE`)

### Global context

Xem: `02-context-global-provider.md`

- `GlobalProvider` (`CORE`)
- `openModal`, `closeModal`, `setEditingTaskWithLog`, `collapseMenu`, `toggleTheme`
- Task actions: `allTasks`, `deleteTask`, `updateTask`
- Board actions: `allBoards`, `getBoard`, `createBoard`, `updateBoard`, `deleteBoard`
- Column actions: `createColumn`, `updateColumn`, `deleteColumn`
- Hooks: `useGlobalState`, `useGlobalUpdate`

### API routes

Xem: `03-api-reference.md`

- `/api/tasks`: `normalizeChecklist`, `parseChecklist`, `normalizeLabelIds`, `normalizeAssigneeIds`, `POST`, `GET`, `PUT`, `DELETE`
- `/api/tasks/[id]`: `normalizeChecklist`, `normalizeAssigneeIds`, `PUT`, `DELETE`, `GET`
- `/api/boards`: `GET`, `POST`, `PUT`
- `/api/boards/[id]`: `GET`, `DELETE`
- `/api/columns`: `GET`, `POST`, `PUT`, `DELETE`
- `/api/labels`: `GET`, `POST`, `PUT`, `DELETE`
- `/api/comments`: `GET`, `POST`, `DELETE`
- `/api/activity-logs`: `GET`, `POST`
- `/api/reminders`: `GET`, `POST`
- `/api/export`: `GET`, `POST`
- `/api/health`: `GET`

### Board/task UI

Xem: `04-board-task-ui.md`

- `BoardList` + handlers
- `BoardView` + DnD helpers
- `DroppableColumn`
- `SortableTask`
- `TaskItem` + parsing/priority helpers
- `Tasks` + local filtering handlers
- `SearchFilter` + tag CRUD handlers
- Form components: `BoardForm`, `ColumnForm`, `CreateTaskForm`, `EditTaskForm`
- Modal wrappers: `Modal`, `CreateContent`
- `Button`

### Reminder/comments/export

Xem: `05-reminder-comments-export.md`

- Reminder helpers: `playReminderSound`, `requestNotificationPermission`, `showDesktopNotification`
- `ReminderNotification` + `checkReminders`
- `CommentsSection`, `CommentForm`, `CommentList`
- `formatTimeAgo`
- `ExportImport`: `handleExport`, `handleImport`

### Providers + utils + schemas

Xem: `06-providers-utils.md`

- Providers: `useTheme`, `toggleTheme`, `ContextProvider`, `GlobalStyleProvider`, `ChunkErrorHandler`, `handleChunkLoadError`, `ClientLayout`
- Lib: `successResponse`, `errorResponse`
- Utils: `formatDate`
- Schema objects: `taskValidationSchema`, `boardValidationSchema`, `columnValidationSchema`, `labelValidationSchema`

## Ghi chú coverage

- Tài liệu đã bao phủ toàn bộ function được khai báo trong `app/**`, `middleware.ts`, và API route handlers.
- Các styled-components constants không được coi là function nghiệp vụ.
