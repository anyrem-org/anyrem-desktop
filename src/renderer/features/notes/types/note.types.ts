export type Note = { id: string; title: string; category: string; categoryColor: string; categoryIds: string[]; content: string; contentHtml?: string; relatedIds: string[]; updatedAt: string; pinned?: boolean; showInGlobalSearch?: boolean; effectiveShowInGlobalSearch?: boolean; editorFormat?: "TIPTAP" | "BLOCKNOTE"; };
export type NoteRecord = Note & { contentJson: Record<string, unknown> | unknown[]; contentHtml: string; };
export type NoteInput = { title: string; contentJson: Record<string, unknown> | unknown[]; editorFormat?: "BLOCKNOTE"; categoryIds: string[]; relatedIds: string[]; pinned?: boolean; showInGlobalSearch?: boolean; };
export type NoteFilters = { page: number; limit?: number; q?: string; categoryId?: string; };
