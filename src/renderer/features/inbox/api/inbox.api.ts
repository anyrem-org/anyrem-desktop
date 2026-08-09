import { apiClient } from "../../../shared/lib/api-client";
import type { InboxFilters, InboxItem } from "../types/inbox.types";

export const getInboxItems = (filters: InboxFilters) =>
  apiClient.get<InboxItem[]>("/inboxes", { params: filters }).then(({ data }) => data);

export const createInboxItem = (name: string) =>
  apiClient.post<InboxItem>("/inboxes", { name }).then(({ data }) => data);

export const updateInboxItem = ({ id, name }: { id: string; name: string }) =>
  apiClient.patch<InboxItem>(`/inboxes/${id}`, { name }).then(({ data }) => data);

export const deleteInboxItem = (id: string) =>
  apiClient.delete<{ deleted: true }>(`/inboxes/${id}`).then(({ data }) => data);

export const toggleInboxItem = (id: string) =>
  apiClient.post<{ switched: true }>(`/inboxes/switch-status-mark-inbox/${id}`).then(({ data }) => data);
