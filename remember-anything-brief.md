# Remember Anything - Product & Engineering Brief

## 1. Product idea

**Remember Anything** là một desktop app giúp user ghi lại mọi thông tin trong quá trình làm việc với máy tính, sau đó tìm lại nhanh như Google Search.

Core flow:

```txt
User đang work
→ ghi note nhanh
→ lưu title/category/content
→ search lại bằng keyword
→ mở detail
→ xem related content
→ cuối ngày nhận daily recap
```

Mục tiêu sản phẩm:

```txt
Ghi nhanh mọi thứ trong lúc làm việc.
Tìm lại như Google.
Xem nội dung liên quan như knowledge graph.
Cuối ngày tự nhắc lại những gì đã ghi.
```

Không định vị app như một Notion clone. Định vị nên rõ hơn:

```txt
Personal memory app for developers and knowledge workers.
```

Hoặc:

```txt
Ứng dụng ghi nhớ và tìm lại mọi thứ trong quá trình làm việc.
```

---

## 2. Core features

### 2.1. Quick note capture

Ban đầu note gồm:

```txt
title
category
content dạng WYSIWYG editor
tags optional
created_at
updated_at
```

Content nên lưu theo nhiều dạng:

```txt
content_json   → dữ liệu editor Tiptap
content_text   → plain text phục vụ search/index/summary
content_html   → optional, phục vụ preview/export
```

Không nên chỉ lưu HTML vì sau này khó phân tích block, extract keyword, tạo summary, build graph.

---

### 2.2. Search home giống Google

Trang Home là trung tâm của app.

Yêu cầu:

```txt
search box lớn
search-as-you-type
dropdown search history khi focus
recent searches
suggested keywords
recently opened notes
search results dạng clean list
```

Search cần hỗ trợ:

```txt
có dấu / không dấu
hoa / thường
sai chính tả nhẹ
title/category/content/tags
search-as-you-type
filter theo category/date/pinned
ranking theo độ liên quan
```

Ví dụ:

```txt
"thoi gian" vẫn tìm được "thời gian"
"dong bo" vẫn tìm được "đồng bộ"
"electron sync" tìm ra các note liên quan tới Electron và sync
```

---

### 2.3. Search result detail modal

Khi click một result:

```txt
open modal detail
hiển thị title/category/tags/content
hiển thị related content
có action Edit / Pin / Open Fullscreen / Close
```

Modal không nên quá nhỏ. Nó phải đủ lớn để đọc note, nhưng vẫn giữ cảm giác nhanh.

---

### 2.4. Fullscreen note detail

Khi click `Open Fullscreen`, mở page detail toàn màn hình.

Dùng cho:

```txt
đọc kỹ note
edit note
xem related content rõ hơn
```

---

### 2.5. Related content

Khi mở note, app hiển thị nội dung liên quan.

Nguồn related ban đầu:

```txt
same category
same tags
Meilisearch similarity
title/content keyword matching
manual relation future
AI detected relation future
```

MVP có thể chưa cần lưu relations vào DB, mà tính realtime bằng Meilisearch.

Phase sau mới thêm bảng `note_relations`.

---

### 2.6. Daily recap

Cuối ngày backend tổng hợp notes hôm nay và gửi recap.

Kênh MVP:

```txt
Telegram Bot API trực tiếp
Email optional
Desktop notification optional
```

Không dùng Telegraf trong MVP nếu chỉ gửi message một chiều.

Flow:

```txt
22:00 mỗi ngày
→ BullMQ scheduled job
→ query notes created/updated today
→ group by category
→ build recap text
→ call Telegram Bot API sendMessage
→ log delivery status
```

MVP recap chưa cần AI summary. Có thể chỉ group theo category + title list.

Ví dụ message:

```txt
📌 Remember Anything - Daily Recap

Hôm nay bạn đã ghi 8 notes:

Electron
- Cơ chế sync offline-first
- SQLite FTS5 local search

Search
- Meilisearch tiếng Việt
- Related content strategy

Product idea
- Remember Anything MVP
```

---

### 2.7. Category graph

Khi click category, user có thể xem graph.

Graph mode:

```txt
category là node trung tâm
notes thuộc category là nodes xung quanh
related notes nối bằng edges
click node mở preview
double click note node mở detail modal
```

Graph không nên làm quá sớm nếu search/note chưa tốt.

Roadmap:

```txt
Phase 1: related content dạng sidebar/list
Phase 2: category graph
Phase 3: note graph + relation types
```

---

## 3. Suggested tech stack

### 3.1. Desktop frontend

```txt
ElectronJS
React
TypeScript
Vite
Tailwind CSS
shadcn/ui hoặc Radix UI
Zustand
TanStack Query
React Hook Form
Zod
Tiptap
React Flow / @xyflow/react
ELK.js hoặc dagre
```

### 3.2. Backend

```txt
NestJS
Prisma
PostgreSQL
Meilisearch
Redis
BullMQ
Telegram Bot API direct HTTP call
```

### 3.3. Future offline phase

```txt
SQLite local
better-sqlite3 hoặc Drizzle/Kysely
SQLite FTS5
sync_queue
local search fallback
push/pull sync
```

---

## 4. Why this stack

### ElectronJS

Phù hợp vì app cần desktop-first:

```txt
quick capture window
global shortcut future
tray icon future
local cache/settings
offline phase sau
desktop notification
```

Electron giúp MVP nhanh hơn Tauri vì dùng JS/TS + Node ecosystem.

### NestJS

Phù hợp vì:

```txt
TypeScript đồng bộ với frontend
module rõ ràng
hợp API + queue + scheduled jobs
dễ maintain
```

### PostgreSQL

Phù hợp vì:

```txt
JSONB cho Tiptap content
query mạnh
mở rộng tốt
phù hợp notes/categories/tags/relations
```

### Meilisearch

Phù hợp với Google-like search:

```txt
fast search
search-as-you-type
typo tolerance
ranking
filter/sort
nhẹ hơn Elasticsearch
dễ deploy hơn
```

### Tiptap

Phù hợp cho WYSIWYG editor:

```txt
customizable
lưu JSON document
support heading/list/code/link/table/task list
free core đủ cho MVP
```

Tiptap table cơ bản dùng được free qua Table/TableKit.

### React Flow

Phù hợp cho graph:

```txt
category → notes
note → related notes
custom node UI
interactive graph
```

---

## 5. MVP scope

MVP nên tập trung:

```txt
quick note
home search
search result detail modal
basic related content
daily recap Telegram
```

Không nên làm graph/AI/offline quá sớm.

MVP screens:

```txt
Home/Search
Create/Edit Note
Note Detail Modal
Fullscreen Note Detail
Categories
Daily Recap
Settings
```

---

## 6. Product roadmap

### Phase 1 - Online-first MVP

```txt
Electron app shell
NestJS API
Note CRUD
Category CRUD
Tiptap editor
Meilisearch index/search
Search history
Note detail modal
Basic related notes
Telegram daily recap
```

### Phase 2 - Better discovery

```txt
Recently active panel
Pinned notes
Tags
Advanced filters
Better related content
Category page
```

### Phase 3 - Graph

```txt
Category graph
Note graph
Relation types
Graph filters
Node preview
```

### Phase 4 - Offline

```txt
SQLite local cache
sync_queue
offline create/edit
SQLite FTS5 local search
online search ưu tiên Meilisearch
offline search fallback
```

### Phase 5 - AI memory

```txt
auto summary
auto tag/category suggestion
auto relation detection
semantic search by embeddings
daily/weekly insights
```

---

## 7. Database design

### 7.1. Core tables

```txt
notes
- id
- title
- content_json
- content_text
- content_html
- summary
- category_id
- created_at
- updated_at
- archived_at
- deleted_at

categories
- id
- name
- color
- icon
- parent_id
- created_at
- updated_at

tags
- id
- name
- created_at

note_tags
- note_id
- tag_id

search_histories
- id
- user_id
- keyword
- created_at

daily_summaries
- id
- date
- summary_text
- note_count
- telegram_sent_at
- status
- error_message

notification_channels
- id
- user_id
- type
- target
- enabled
- send_daily_recap
- created_at
- updated_at

notification_logs
- id
- user_id
- channel_type
- status
- error_message
- sent_at
```

---

### 7.2. Related records

Nếu một note có nhiều related notes, không lưu array JSON trong `notes`.

Không nên:

```json
{
  "related_note_ids": ["note_1", "note_2", "note_3"]
}
```

Nên dùng bảng riêng:

```txt
note_relations
- id
- source_note_id
- target_note_id
- relation_type
- score
- reason
- created_at
```

Relation type:

```txt
same_category
same_tag
similar_content
manual
ai_detected
mentioned_together
parent_child
follow_up
duplicate_candidate
```

Index gợi ý:

```sql
CREATE INDEX idx_note_relations_source_score
ON note_relations (source_note_id, score DESC);

CREATE INDEX idx_note_relations_target
ON note_relations (target_note_id);

CREATE INDEX idx_note_relations_type
ON note_relations (relation_type);
```

Query related:

```sql
SELECT 
  n.id,
  n.title,
  n.content_text,
  nr.relation_type,
  nr.score,
  nr.reason
FROM note_relations nr
JOIN notes n ON n.id = nr.target_note_id
WHERE nr.source_note_id = $1
ORDER BY nr.score DESC
LIMIT 20;
```

MVP có thể chưa cần `note_relations`. Dùng Meilisearch realtime trước.

---

## 8. Search design

### 8.1. Meilisearch document

Index `notes` nên chứa:

```json
{
  "id": "note_123",
  "title": "Cách sync Electron app",
  "title_normalized": "cach sync electron app",
  "category_id": "category_1",
  "category_name": "Electron",
  "category_normalized": "electron",
  "content_text": "Electron lưu local trước rồi sync...",
  "content_normalized": "electron luu local truoc roi sync",
  "summary": "Ghi chú về cơ chế sync offline-first...",
  "tags": ["electron", "sync", "offline"],
  "created_at": 1781580000,
  "updated_at": 1781580000,
  "pinned": false,
  "archived": false
}
```

Nên lưu thêm normalized fields để kiểm soát tiếng Việt:

```txt
title_normalized
category_normalized
content_normalized
search_text
```

Normalize tiếng Việt:

```txt
thời gian → thoi gian
đồng bộ → dong bo
```

---

### 8.2. Search API

```txt
GET /api/search/notes?q=electron sync&page=1&limit=20
```

Backend:

```txt
validate query
normalize keyword
call Meilisearch
apply permission/user filter
return clean search result DTO
```

Không để Electron gọi thẳng Meilisearch. Phải đi qua NestJS API để:

```txt
bảo mật key
check user permission
filter theo user/workspace
log search history
dễ thay search engine sau này
```

---

### 8.3. Related content strategy

MVP:

```txt
open note
→ use note title/category/tags/content summary
→ call Meilisearch
→ exclude current note
→ return top related
```

Phase sau:

```txt
on note create/update
→ BullMQ job
→ compute related notes
→ save note_relations
```

---

## 9. Telegram daily recap without Telegraf

MVP không dùng Telegraf.

Dùng Telegram Bot API trực tiếp:

```txt
POST https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
```

NestJS service concept:

```txt
TelegramService.sendMessage(chatId, text)
```

Khi nào cần Telegraf?

```txt
chỉ gửi daily recap một chiều → không cần
bot có command /recap, /search, /create → cân nhắc Telegraf sau
```

---

## 10. Backend modules

NestJS modules gợi ý:

```txt
AuthModule
UsersModule
NotesModule
CategoriesModule
TagsModule
SearchModule
RelatedContentModule
GraphModule
ActivityModule
RecapModule
NotificationModule
TelegramModule
```

### NotesModule

```txt
CRUD notes
extract content_text từ Tiptap JSON
dispatch search indexing job
```

### SearchModule

```txt
search notes
search history
Meilisearch integration
```

### RelatedContentModule

```txt
realtime related via Meilisearch
future persisted note_relations
```

### GraphModule

```txt
category graph
note graph
convert DB relation to nodes/edges
```

### RecapModule

```txt
daily summary
scheduled job
query notes today
build recap text
dispatch notification
```

### TelegramModule

```txt
direct Telegram Bot API HTTP calls
sendMessage
send test message
```

---

## 11. Electron app architecture

Code phải theo hướng senior, dễ maintain, không nhồi tất cả vào một file.

Principles:

```txt
KISS
DRY
YAGNI
Separation of Concerns
Feature-based structure
Small focused components
Typed interfaces
No giant files
No business logic inside JSX
No direct API calls inside components
```

Electron security:

```txt
không bật nodeIntegration trong renderer nếu không cần
dùng preload script
dùng contextBridge
main/preload/renderer tách rõ
```

Suggested structure:

```txt
src/
  main/
    index.ts
    window.ts
    menu.ts
    ipc/
      index.ts
      app.ipc.ts

  preload/
    index.ts
    api.ts

  renderer/
    app/
      App.tsx
      routes.tsx
      providers.tsx

    shared/
      components/
        ui/
        layout/
        feedback/
      hooks/
      lib/
      types/
      constants/

    layouts/
      AppShell.tsx
      Sidebar.tsx
      TopHeader.tsx
      RightPanel.tsx

    features/
      notes/
        components/
          NoteCard.tsx
          NoteDetailModal.tsx
          NoteEditor.tsx
          RelatedNotes.tsx
        hooks/
          useNotes.ts
          useNoteDetail.ts
        api/
          notes.api.ts
        types/
          note.types.ts
        pages/
          NoteDetailPage.tsx
          NewNotePage.tsx

      search/
        components/
          SearchBox.tsx
          SearchHistoryDropdown.tsx
          SearchResultList.tsx
          SearchResultItem.tsx
          SearchFilters.tsx
        hooks/
          useSearchNotes.ts
          useSearchHistory.ts
        api/
          search.api.ts
        types/
          search.types.ts
        pages/
          SearchHomePage.tsx

      categories/
        components/
          CategoryCard.tsx
          CategoryList.tsx
          CategoryHeader.tsx
        hooks/
        api/
        types/
        pages/
          CategoryPage.tsx

      graph/
        components/
          KnowledgeGraph.tsx
          GraphToolbar.tsx
          GraphNode.tsx
          GraphPreviewPanel.tsx
        hooks/
          useGraphData.ts
        api/
          graph.api.ts
        types/
          graph.types.ts
        pages/
          GraphPage.tsx

      recap/
        components/
          DailyRecapCard.tsx
          TelegramStatus.tsx
          RecapScheduleForm.tsx
        hooks/
        api/
        types/
        pages/
          DailyRecapPage.tsx

      activity/
        components/
          RecentlyActivePanel.tsx
          RecentlyActiveItem.tsx
        hooks/
        api/
        types/

      settings/
        components/
        pages/
          SettingsPage.tsx
```

---

## 12. Frontend state management

Use:

```txt
TanStack Query → server state
Zustand → UI/local state
```

TanStack Query:

```txt
notes
search results
categories
graph data
daily recap
recently active
```

Zustand:

```txt
sidebar collapsed
right panel visible
selected note modal
command palette state
theme
```

Không đưa toàn bộ server data vào Zustand nếu TanStack Query đã xử lý.

---

## 13. API layer rule

Không gọi API trực tiếp trong component.

Không làm:

```ts
fetch('/api/notes')
```

trực tiếp trong component.

Nên làm:

```txt
features/notes/api/notes.api.ts
features/search/api/search.api.ts
features/graph/api/graph.api.ts
```

Component dùng hook:

```txt
useNotes()
useSearchNotes()
useGraphData()
useNoteDetail()
```

---

## 14. TypeScript types

Ví dụ:

```ts
export type Note = {
  id: string;
  title: string;
  categoryId: string | null;
  categoryName?: string;
  contentText: string;
  contentJson: unknown;
  summary?: string;
  createdAt: string;
  updatedAt: string;
};

export type SearchResult = {
  id: string;
  title: string;
  categoryName?: string;
  snippet: string;
  score?: number;
  updatedAt: string;
};

export type GraphNode = {
  id: string;
  type: 'category' | 'note' | 'tag';
  label: string;
  data?: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  type: 'contains' | 'same_category' | 'similar_content' | 'manual';
  score?: number;
};
```

Tránh `any` nếu không cần.

---

## 15. UI layout requirements

App layout:

```txt
Left sidebar toggle
Top header fixed
Main content dynamic by page
Right panel Recently Active toggle
```

### Sidebar

Menu:

```txt
Home
Search
New Note
Categories
Graph
Daily Recap
Settings
```

### Top header

```txt
logo + Remember Anything
page title / breadcrumb
command/search shortcut
quick add note
right panel toggle
user avatar/settings
```

### Right panel

```txt
Recently Active
Recently Viewed
Recently Edited
Today’s Notes
Quick Filters
```

### Main content pages

```txt
Home/Search
Create/Edit Note
Note Detail
Category Page
Graph Page
Daily Recap
Settings
```

---

## 16. UI style direction

Style:

```txt
modern productivity app
clean
calm
minimal
light theme
neutral background
soft blue/purple accent
rounded cards
subtle shadows
clear typography
desktop-first
```

Inspiration direction:

```txt
Google Search simplicity
Notion clarity
Linear polish
Obsidian knowledge graph vibe
```

Không copy UI của app tham khảo. Chỉ lấy cấu trúc frame.

---

## 17. Prompt for UI mock generation

Use this prompt when generating UI mockups:

```txt
Design a high-fidelity desktop UI mockup for a knowledge management app called "Remember Anything".

This is an Electron desktop app focused on quick note capture, search-driven recall, related content discovery, category graph exploration, and daily recap.

Core stack:
- ElectronJS
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui or Radix UI
- Zustand
- TanStack Query
- Tiptap editor
- React Flow / @xyflow/react
- NestJS backend
- Prisma
- PostgreSQL
- Meilisearch
- Redis + BullMQ
- Telegram Bot API direct integration

Do not use Telegraf.

Layout:
- Collapsible left sidebar
- Fixed top header
- Main content area
- Toggleable right panel for Recently Active

Visual style:
- Clean, modern, minimal, polished productivity app
- Light theme
- Neutral palette
- Soft blue or purple accent
- Generous whitespace
- Rounded cards
- Subtle shadows
- Clear typography

Main Home/Search page:
- Large Google-inspired search box
- Search history dropdown when focused
- Recent searches
- Suggested keywords
- Recently opened notes
- Search results list with title, category badge, updated time, truncated snippet, optional tags and pinned indicator
- Filter chips: All, Notes, Categories, Today, This week, Pinned

Search result interaction:
- Clicking a result opens a centered note detail modal
- Modal includes title, category, tags, metadata, content preview, related content, and buttons: Edit, Pin, Open Fullscreen, Close

Category page:
- Category title, description, note count
- Toggle List View / Graph View

Graph view:
- Category as central node
- Notes as surrounding nodes
- Edges connect category to notes and related notes to each other
- Node preview on click
- Modern, readable, not too dense

Daily Recap page:
- Today’s notes
- Category summary
- Telegram delivery status
- Send test recap
- Configure Telegram

Do not generate code.
Do not copy any reference image directly.
Use reference images only for layout framing and spacing inspiration.
Prioritize the Home/Search screen first, then Note Detail Modal and Category Graph as secondary states.
```

---

## 18. Prompt when uploading UI reference image

Use this prompt with a reference UI image:

```txt
I will upload a UI reference image.

Use the reference image only to understand:
- layout structure
- screen regions
- sidebar/header/main/right-panel composition
- spacing rhythm
- interface density

Do not copy:
- exact colors
- icons
- logo
- text
- card/component design
- visual identity

Redesign it into a new desktop UI for "Remember Anything".

Remember Anything is an Electron desktop app for quick note capture, search-driven recall, related content discovery, category graph navigation, and daily recap via Telegram Bot API.

Required layout:
- collapsible left sidebar
- top header
- main content
- toggleable right panel
- desktop-first

Main screen:
- Home/Search page
- large Google-inspired search box
- search history dropdown
- recent searches
- suggested keywords
- search results with title, category, updated time, truncated snippet
- click result opens detail modal
- modal includes related content and Open Fullscreen button

Left sidebar:
- Home
- Search
- New Note
- Categories
- Graph
- Daily Recap
- Settings

Right panel:
- Recently Active
- Recently Viewed
- Recently Edited
- Today’s Notes
- Quick Filters

Top header:
- Remember Anything logo/name
- page title/breadcrumb
- quick add note
- right panel toggle
- user avatar/settings

Graph requirement:
- Category node in the center
- Notes around it
- Related notes connected by edges
- Preview on node click

Style:
- light theme
- neutral background
- soft blue/purple accent
- rounded cards
- clean typography
- subtle shadows
- spacious but information-rich
- modern productivity app

Output:
- high-fidelity UI mockup
- no code
- do not copy the original UI
- only use the reference for structural inspiration
```

---

## 19. Engineering prompt for Codex

Use this instruction for Codex when implementing:

```txt
Build the Electron + React app using a senior-level, maintainable structure.

Do not put all components in one file.
Use feature-based architecture.
Separate UI components, hooks, API modules, types, and utilities.

Follow:
- KISS
- DRY
- YAGNI
- Separation of concerns
- Small focused components
- No direct API calls inside components
- No business logic inside JSX
- Proper TypeScript types
- Avoid any unless necessary
- TanStack Query for server state
- Zustand for UI/local state
- Electron preload + contextBridge for safe renderer/main communication
- Keep main, preload, and renderer separated

Suggested structure:
src/main
src/preload
src/renderer/app
src/renderer/shared
src/renderer/layouts
src/renderer/features/notes
src/renderer/features/search
src/renderer/features/categories
src/renderer/features/graph
src/renderer/features/recap
src/renderer/features/activity
src/renderer/features/settings

Each feature should have:
components/
hooks/
api/
types/
pages/

Prioritize MVP:
1. App shell layout
2. Home/Search page
3. Note CRUD UI
4. Note detail modal
5. Related content placeholder
6. Category page
7. Graph placeholder
8. Daily recap page placeholder

Keep implementation simple and practical.
Do not over-engineer.
```

---

## 20. Key decisions

```txt
MVP desktop framework: ElectronJS
Backend: NestJS
Search: Meilisearch
Editor: Tiptap
Graph: React Flow
Queue: Redis + BullMQ
Telegram: direct Bot API, no Telegraf
DB: PostgreSQL + Prisma
Offline: phase sau với SQLite + FTS5
```

Core priority:

```txt
Search + quick note capture phải tốt trước.
Graph, offline, AI là phase sau.
```

Product priority:

```txt
MVP = quick note + powerful search + daily recap.
```


---

## 21. Current implementation focus - FE repo only first

At the current stage, only create and implement the **frontend desktop repo** first.

Do **not** implement the NestJS backend, PostgreSQL, Prisma, Meilisearch, Redis, BullMQ, Telegram integration, or offline sync yet.

The frontend repo should be built as a clean Electron app foundation that can later connect to the backend APIs.

### Scope for the first repo

Create only:

```txt
ElectronJS
React
TypeScript
Vite
Tailwind CSS
shadcn/ui or Radix UI
Zustand
TanStack Query
Tiptap
React Flow / @xyflow/react
ELK.js or dagre
```

### What to implement now

Prioritize frontend MVP screens and structure:

```txt
App shell layout
Left sidebar toggle
Top header
Right panel toggle
Home/Search page UI
Search history dropdown UI
Search results UI using mock data
Note detail modal UI
Open fullscreen note detail page UI
Create/Edit note page UI
Category page UI
Graph page UI using mock data
Daily Recap page placeholder
Settings page placeholder
```

### Use mock data first

Because the backend repo does not exist yet, use mock data and mock API modules.

Example:

```txt
features/notes/api/notes.api.ts
features/search/api/search.api.ts
features/graph/api/graph.api.ts
```

These API files can return mocked Promise-based data for now.

Do not hardcode mock data directly inside components.

### Do not build backend features yet

Do not create:

```txt
NestJS backend
Prisma schema
PostgreSQL migrations
Meilisearch integration
Redis/BullMQ workers
Telegram Bot API integration
Authentication system
Offline SQLite sync
```

These are future phases.

### Frontend repo goal

The goal of the first repo is to create a maintainable Electron frontend foundation:

```txt
clean project structure
feature-based folders
reusable layout/components
mock-driven UI
easy backend integration later
```

The first repo should answer this question:

```txt
Can the Remember Anything desktop UI feel good, searchable, and usable before the backend exists?
```

### Codex instruction for this phase

When Codex reads this file, it should understand:

```txt
Only create the FE Electron repo first.
Do not implement backend.
Use mock data.
Keep structure ready for future API integration.
Prioritize maintainable UI and app shell.
```
