import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { createNote, getNote, getNotes, updateNote } from "../api/notes.api";
import type { NoteFilters } from "../types/note.types";

export const noteKeys = { all: ["notes"] as const, detail: (id: string) => ["notes", id] as const, list: (filters: NoteFilters) => ["notes", "list", filters] as const };
export const useGetNotes = (filters: NoteFilters) => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: noteKeys.list(filters), queryFn: () => getNotes(filters), enabled: authenticated }); };
export const useGetNote = (id?: string) => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: noteKeys.detail(id ?? ""), queryFn: () => getNote(id!), enabled: authenticated && Boolean(id) }); };

const invalidateNoteLists = (client: ReturnType<typeof useQueryClient>) => Promise.all([
  client.invalidateQueries({ queryKey: noteKeys.all }),
  client.invalidateQueries({ queryKey: ["categories"] }),
  client.invalidateQueries({ queryKey: ["search", "notes"] }),
]);

export function useCreateNote() { const client = useQueryClient(); return useMutation({ mutationFn: createNote, onSuccess: (note) => { client.setQueryData(noteKeys.detail(note.id), note); return invalidateNoteLists(client); } }); }
export function useUpdateNote() { const client = useQueryClient(); return useMutation({ mutationFn: updateNote, onSuccess: (note) => { client.setQueryData(noteKeys.detail(note.id), note); return invalidateNoteLists(client); } }); }
