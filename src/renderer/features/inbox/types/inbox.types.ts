export type InboxItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type InboxFilters = {
  completed?: boolean;
  date?: "all" | "today" | "this_week" | "this_month" | "this_year";
};
