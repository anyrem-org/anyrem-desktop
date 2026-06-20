import { notes } from '../../notes/api/notes.api';

export const searchHistory = ['electron sync', 'tìm kiếm tiếng Việt', 'daily recap'];
export const suggestions = ['offline-first', 'Meilisearch', 'Tiptap', 'product ideas'];

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

export async function searchNotes(query: string) {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const keyword = normalize(query.trim());
  if (!keyword) return notes;
  return notes.filter((note) => normalize([note.title, note.category, note.content].join(' ')).includes(keyword));
}
