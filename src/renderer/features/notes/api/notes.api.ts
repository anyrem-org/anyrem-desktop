import { apiClient } from "../../../shared/lib/api-client";
import type { Paginated } from "../../../shared/types/api.types";
import { lowlight } from "../editor/lowlight";
import type { NoteFilters, NoteInput, NoteRecord } from "../types/note.types";

type ApiNote = {
  id: string;
  title: string;
  contentJson: Record<string, unknown>;
  contentText: string;
  contentHtml: string;
  pinned: boolean;
  updatedAt: string;
  categories: Array<{ categoryId: string; category: { name: string; color: string } }>;
  relationsLeft: Array<{ rightNoteId: string }>;
  relationsRight: Array<{ leftNoteId: string }>;
};

const mapNote = (note: ApiNote): NoteRecord => ({
  id: note.id,
  title: note.title,
  content: note.contentText,
  contentJson: note.contentJson,
  contentHtml: htmlOf(note.contentJson as RichNode) || note.contentHtml,
  category: note.categories[0]?.category.name ?? "Uncategorized",
  categoryColor: note.categories[0]?.category.color ?? "#64748b",
  categoryIds: note.categories.map((item) => item.categoryId),
  relatedIds: [...note.relationsLeft.map((item) => item.rightNoteId), ...note.relationsRight.map((item) => item.leftNoteId)],
  updatedAt: note.updatedAt,
  pinned: note.pinned,
});

export const getNotes = (filters: NoteFilters) => apiClient.get<Paginated<ApiNote>>("/notes", { params: filters }).then(({ data }) => ({ ...data, items: data.items.map(mapNote) }));
export const getNote = (id: string) => apiClient.get<ApiNote>(`/notes/${id}`).then(({ data }) => mapNote(data));
export const createNote = (input: NoteInput) => apiClient.post<ApiNote>("/notes", input).then(({ data }) => mapNote(data));
export const updateNote = ({ id, input }: { id: string; input: NoteInput }) => apiClient.patch<ApiNote>(`/notes/${id}`, input).then(({ data }) => mapNote(data));
export const pinNote = ({ id, pinned }: { id: string; pinned: boolean }) => apiClient.patch<{ pinned: boolean }>(`/notes/${id}/pin`, { pinned }).then(({ data }) => data);

type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: RichMark[];
  content?: RichNode[];
};

type RichMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

const htmlOf = (node: RichNode): string => {
  if (node.type === "text") {
    return (node.marks ?? []).reduce(applyMark, escapeHtml(node.text ?? ""));
  }

  if (node.type === "codeBlock") return codeBlockHtml(node);

  if (node.type === "image") {
    const src = safeUrl(node.attrs?.src);
    if (!src) return "";
    const alt = typeof node.attrs?.alt === "string" ? escapeHtml(node.attrs.alt) : "";
    return `<img src="${src}" alt="${alt}">`;
  }

  const children = (node.content ?? []).map(htmlOf).join("");
  const tag = tagOf(node);
  if (!tag) return children;
  if (tag === "br") return "<br>";
  return `<${tag}${attrsOf(node)}>${children}</${tag}>`;
};

const tagOf = (node: RichNode) =>
  ({
    paragraph: "p",
    heading: `h${Number(node.attrs?.level ?? 2)}`,
    bulletList: "ul",
    orderedList: "ol",
    listItem: "li",
    blockquote: "blockquote",
    hardBreak: "br",
    table: "table",
    tableRow: "tr",
    tableCell: "td",
    tableHeader: "th",
  })[node.type ?? ""];

const attrsOf = (node: RichNode) =>
  typeof node.attrs?.textAlign === "string" &&
  ["left", "center", "right", "justify"].includes(node.attrs.textAlign)
    ? ` style="text-align: ${escapeHtml(node.attrs.textAlign)}"`
    : "";

const applyMark = (html: string, mark: RichMark) => {
  if (mark.type === "bold") return `<strong>${html}</strong>`;
  if (mark.type === "italic") return `<em>${html}</em>`;
  if (mark.type === "underline") return `<u>${html}</u>`;
  if (mark.type === "strike") return `<s>${html}</s>`;
  if (mark.type === "code") return `<code>${html}</code>`;
  if (mark.type === "superscript") return `<sup>${html}</sup>`;
  if (mark.type === "subscript") return `<sub>${html}</sub>`;
  if (mark.type === "highlight") {
    const color = safeStyleValue(mark.attrs?.color);
    return `<mark${color}>${html}</mark>`;
  }
  if (mark.type === "link") {
    const href = safeUrl(mark.attrs?.href);
    return href ? `<a href="${href}" target="_blank" rel="noreferrer">${html}</a>` : html;
  }
  return html;
};

type HastNode = {
  type?: string;
  value?: string;
  tagName?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
};

const codeBlockHtml = (node: RichNode) => {
  const code = textOf(node);
  const language =
    typeof node.attrs?.language === "string" && node.attrs.language
      ? node.attrs.language
      : undefined;

  try {
    const tree = language
      ? lowlight.highlight(language, code)
      : lowlight.highlightAuto(code);
    const langClass = tree.data?.language ? ` language-${tree.data.language}` : "";
    return `<pre><code class="hljs${langClass}">${(tree.children as HastNode[])
      .map(hastHtml)
      .join("")}</code></pre>`;
  } catch {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
};

const textOf = (node: RichNode): string =>
  node.text ?? (node.content ?? []).map(textOf).join("");

const hastHtml = (node: HastNode): string => {
  if (node.type === "text") return escapeHtml(node.value ?? "");
  const children = (node.children ?? []).map(hastHtml).join("");
  if (node.type !== "element" || !node.tagName) return children;
  const className = node.properties?.className?.length
    ? ` class="${node.properties.className.map(escapeHtml).join(" ")}"`
    : "";
  return `<${node.tagName}${className}>${children}</${node.tagName}>`;
};

const safeUrl = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return escapeHtml(trimmed);
  try {
    const url = new URL(trimmed);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol)
      ? escapeHtml(trimmed)
      : "";
  } catch {
    return "";
  }
};

const safeStyleValue = (value: unknown) =>
  typeof value === "string" && /^[#\w\s(),.%+-]+$/.test(value)
    ? ` style="background-color: ${escapeHtml(value)}"`
    : "";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
      char
    ]!,
  );
