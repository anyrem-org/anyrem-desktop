# AnyRem Desktop — Project Context

## Scope hiện tại

- Chỉ FE Electron; chưa có backend.
- Dùng mock data và mock API.
- Code theo feature-based structure.
- UI core dùng shadcn-style components; Tailwind CSS xử lý layout/UI phức tạp.
- Thiết kế gốc: `remember-anything-brief.md`, `dashboard.md`, `quick-access.md`.

## Stack

- Electron 41, React 19, TypeScript, Vite 6
- Tailwind CSS 3, Radix/shadcn-style components
- Zustand, TanStack Query
- Tiptap, React Flow
- pnpm 10

## Tính năng đã có

- Login/logout mock, Google login mock, persisted auth.
- Dashboard Memory Hub theo `dashboard.md`.
- Search kiểu Notion: danh sách gọn, preview riêng, highlight, filter, sort, keyboard navigation.
- `Recently Active` panel vẫn hiện tại Search; chỉ ẩn tại Knowledge Graph.
- Note editor: rich text, table, format cơ bản kiểu Word, nhiều categories, related memories; bỏ tags.
- Search server-style mock cho categories và related memories; dropdown mở phía trên input.
- Categories: tạo mới, icon/màu tùy chọn, detail chứa danh sách memories.
- Settings UI, Daily Recap mock.
- Knowledge Graph nối categories, notes và related memories.
- Quick Access theo `quick-access.md`:
  - `Ctrl/Cmd+Space`: Quick Search.
  - `Ctrl/Cmd+Shift+N`: Quick Note.
  - Fallback search: `Ctrl/Cmd+Alt+Space` nếu shortcut chính bị OS/IME chiếm.
  - Search/detail là UI riêng; nội dung màn hình nhỏ tự scroll.
  - Quick Note có rich editor, categories, related memories.
  - Open full app khôi phục, focus app và mở note.
- Minimize ẩn app xuống system tray; tray có Open, Quick Search, Quick Create, Quit.

## Kiến trúc chính

- `src/main`: Electron main process, windows, global shortcuts, tray.
- `src/preload`: IPC bridge.
- `src/renderer/app`: router/app bootstrap.
- `src/renderer/layouts`: AppShell, sidebar, header, activity panel.
- `src/renderer/features`: auth, dashboard, search, notes, categories, graph, settings, quick-access.
- `src/renderer/shared/components/ui`: shadcn-style primitives dùng chung.

## Quyết định UI quan trọng

- Search dùng layout Notion để nhìn được nhiều kết quả hơn.
- Search có detail preview riêng, không reuse màn detail cũ.
- Activity panel bên phải phải hiện trong Search.
- Multi-select dùng chips để nhiều categories/related memories không làm UI kéo dài.
- Filter result của dropdown luôn nằm phía trên input.
- Quick Access không dùng `min-width: 1080px`; chỉ vùng content được scroll.

## Lưu ý chạy app

- Sau khi sửa Electron main/preload, phải thoát hẳn Electron đang ẩn dưới tray rồi chạy lại `pnpm dev`.
- Nếu Electron báo `failed to install correctly`, xóa package Electron lỗi rồi cài lại với install scripts được bật.
- `package.json` đã khai báo `pnpm.onlyBuiltDependencies` cho `electron` và `esbuild`.

## Kiểm tra

```powershell
pnpm run typecheck
pnpm run build
```

- Typecheck gần nhất: pass.
- Build gần nhất: pass; còn warning bundle khoảng 1 MB, chưa cần tối ưu ở phase mock FE.

## Trạng thái cuối

Fix gần nhất: khôi phục `Recently Active` panel khi vào Search bằng cách chỉ coi `/graph` là immersive route.

