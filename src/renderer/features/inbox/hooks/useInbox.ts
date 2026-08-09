import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import { createInboxItem, deleteInboxItem, getInboxItems, toggleInboxItem, updateInboxItem } from "../api/inbox.api";
import type { InboxFilters } from "../types/inbox.types";

export const inboxKeys = { all: ["inboxes"] as const, list: (filters: InboxFilters) => ["inboxes", "list", filters] as const };

const invalidateInbox = (client: ReturnType<typeof useQueryClient>) => client.invalidateQueries({ queryKey: inboxKeys.all });

export function useInboxItems(filters: InboxFilters) {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({ queryKey: inboxKeys.list(filters), queryFn: () => getInboxItems(filters), enabled: authenticated, retry: 1 });
}

export function useCreateInboxItem() {
  const client = useQueryClient();
  return useMutation({ mutationFn: createInboxItem, onSuccess: () => invalidateInbox(client) });
}

export function useUpdateInboxItem() {
  const client = useQueryClient();
  return useMutation({ mutationFn: updateInboxItem, onSuccess: () => invalidateInbox(client) });
}

export function useDeleteInboxItem() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteInboxItem, onSuccess: () => invalidateInbox(client) });
}

export function useToggleInboxItem() {
  const client = useQueryClient();
  return useMutation({ mutationFn: toggleInboxItem, onSuccess: () => invalidateInbox(client) });
}
