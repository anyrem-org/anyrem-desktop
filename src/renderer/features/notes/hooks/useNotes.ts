import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { createNote, getNote, getNotes, pinNote, updateNote } from "../api/notes.api";
import type { NoteRecord } from "../types/note.types";
import type { NoteFilters } from "../types/note.types";

export const noteKeys = { all: ["notes"] as const, detail: (id: string) => ["notes", id] as const, list: (filters: NoteFilters) => ["notes", "list", filters] as const };
export const useGetNotes = (filters: NoteFilters) => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: noteKeys.list(filters), queryFn: () => getNotes(filters), enabled: authenticated }); };
export const useGetNote = (id?: string) => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: noteKeys.detail(id ?? ""), queryFn: () => getNote(id!), enabled: authenticated && Boolean(id) }); };

const invalidateNoteLists = (client: ReturnType<typeof useQueryClient>) => Promise.all([
  client.invalidateQueries({ queryKey: noteKeys.all }),
  client.invalidateQueries({ queryKey: ["categories"] }),
  client.invalidateQueries({ queryKey: ["graph"] }),
  client.invalidateQueries({ queryKey: ["search", "notes"] }),
  client.invalidateQueries({ queryKey: ["dashboard"] }),
  client.invalidateQueries({ queryKey: ["activity"] }),
]);

export function useCreateNote() { const client = useQueryClient(); return useMutation({ mutationFn: createNote, onSuccess: (note) => { client.setQueryData(noteKeys.detail(note.id), note); return invalidateNoteLists(client); } }); }
export function useUpdateNote() { const client = useQueryClient(); return useMutation({ mutationFn: updateNote, onSuccess: (note) => { client.setQueryData(noteKeys.detail(note.id), note); return invalidateNoteLists(client); } }); }
export function usePinNote() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: pinNote,
    onSuccess: ({ pinned }, { id }) => {
      client.setQueryData<NoteRecord | undefined>(noteKeys.detail(id), (note) =>
        note ? { ...note, pinned } : note,
      );
      return invalidateNoteLists(client);
    },
  });
}
