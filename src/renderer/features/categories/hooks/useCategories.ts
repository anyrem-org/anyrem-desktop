import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCategory, deleteCategory, getCategories, getCategory, getCategoryNotes, updateCategory } from "../api/categories.api";
import type { CategoryNoteFilters } from "../types/category.types";
import { useAuthStore } from "../../auth/store/auth.store";

export const categoryKeys = { all: ["categories"] as const, detail: (id: string) => ["categories", id] as const, notes: (id: string, filters: CategoryNoteFilters) => ["categories", id, "notes", filters] as const };
export const useGetCategories = () => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: categoryKeys.all, queryFn: getCategories, enabled: authenticated, retry: 1 }); };
export const useGetCategory = (id?: string) => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: categoryKeys.detail(id ?? ""), queryFn: () => getCategory(id!), enabled: authenticated && Boolean(id), retry: 1 }); };
export const useGetCategoryNotes = (id: string | undefined, filters: CategoryNoteFilters) => { const authenticated = useAuthStore((state) => Boolean(state.accessToken)); return useQuery({ queryKey: categoryKeys.notes(id ?? "", filters), queryFn: () => getCategoryNotes({ id: id!, filters }), enabled: authenticated && Boolean(id), retry: 1 }); };
export function useCreateCategory() { const client = useQueryClient(); return useMutation({ mutationFn: createCategory, onSuccess: () => { client.invalidateQueries({ queryKey: categoryKeys.all }); client.invalidateQueries({ queryKey: ["graph"] }); } }); }
export function useUpdateCategory() { const client = useQueryClient(); return useMutation({ mutationFn: updateCategory, onSuccess: (category) => { client.invalidateQueries({ queryKey: categoryKeys.all }); client.invalidateQueries({ queryKey: categoryKeys.detail(category.id) }); client.invalidateQueries({ queryKey: ["graph"] }); } }); }
export function useDeleteCategory() { const client = useQueryClient(); return useMutation({ mutationFn: deleteCategory, onSuccess: (_data, id) => { client.removeQueries({ queryKey: categoryKeys.detail(id) }); client.invalidateQueries({ queryKey: categoryKeys.all }); client.invalidateQueries({ queryKey: ["graph"] }); } }); }
