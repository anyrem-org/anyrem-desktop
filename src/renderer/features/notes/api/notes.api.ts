import type { Note } from "../types/note.types";

export const notes: Note[] = [
  {
    id: "1",
    title: "Cơ chế sync offline-first cho Electron",
    category: "Electron",
    categoryColor: "#6366f1",
    categoryIds: ["electron", "product"],
    relatedIds: ["2", "3"],
    updatedAt: "12 phút trước",
    pinned: true,
    content:
      "Lưu thay đổi vào local store trước, đưa operation vào sync queue, sau đó đẩy lên server khi có mạng. Mỗi operation cần idempotency key để tránh ghi trùng.",
  },
  {
    id: "2",
    title: "Meilisearch và tìm kiếm tiếng Việt",
    category: "Search",
    categoryColor: "#0ea5e9",
    categoryIds: ["search"],
    relatedIds: ["1"],
    updatedAt: "1 giờ trước",
    content:
      "Tạo thêm normalized fields để tìm không dấu. Ranking ưu tiên title, category rồi mới đến content.",
  },
  {
    id: "3",
    title: "Remember Anything — MVP scope",
    category: "Product",
    categoryColor: "#a855f7",
    categoryIds: ["product"],
    relatedIds: ["1", "4"],
    updatedAt: "Hôm qua",
    content:
      "MVP tập trung quick note, tìm kiếm nhanh, related content cơ bản và daily recap. Graph, AI và offline sync để phase sau.",
  },
  {
    id: "4",
    title: "Daily recap message format",
    category: "Recap",
    categoryColor: "#f59e0b",
    categoryIds: ["recap", "product"],
    relatedIds: ["3"],
    updatedAt: "2 ngày trước",
    content:
      "Group note theo category và liệt kê title. Bản đầu chưa cần AI summary; nội dung ngắn, dễ scan cuối ngày.",
  },
  {
    id: "5",
    title: "Tiptap document storage strategy",
    category: "Editor",
    categoryColor: "#10b981",
    categoryIds: ["editor", "electron"],
    relatedIds: ["1"],
    updatedAt: "3 ngày trước",
    content:
      "Lưu content_json làm source of truth, content_text cho search và content_html chỉ dùng preview hoặc export.",
  },
];

const wait = () => new Promise((resolve) => setTimeout(resolve, 120));

export async function getNotes() {
  await wait();
  return notes;
}
export async function getNote(id: string) {
  await wait();
  return notes.find((note) => note.id === id);
}
export async function searchRelatedNotes(query: string) {
  await wait();
  const keyword = query.trim().toLocaleLowerCase();
  return keyword
    ? notes.filter((note) =>
        `${note.title} ${note.category} ${note.content}`
          .toLocaleLowerCase()
          .includes(keyword),
      )
    : notes;
}
