import { apiClient } from "../../../shared/lib/api-client";

export type Theme = "LIGHT" | "DARK" | "SYSTEM";
export type TypoTolerance = "STRICT" | "BALANCED" | "FLEXIBLE";

export type SettingsData = {
  appearance: {
    theme: Theme;
    compact_density: boolean;
    show_activity_panel: boolean;
  };
  regional: {
    locale: string;
    timezone: string;
  };
  search: {
    search_as_you_type: boolean;
    save_history: boolean;
    typo_tolerance: TypoTolerance;
  };
  quick_access: {
    shortcuts: Record<"search" | "create", string>;
  };
  recap: {
    enabled: boolean;
    delivery_time: string;
    email_enabled: boolean;
    telegram_enabled: boolean;
  };
  telegram: {
    bot_username?: string | null;
    verified_at?: string | null;
    configured: boolean;
    maskedChatId: string | null;
  };
};

export type SettingUpdate = {
  type: keyof Omit<SettingsData, "telegram">;
  key: string;
  value: string | boolean | number | null | Record<string, string>;
};

export const getSettings = () =>
  apiClient.get<SettingsData>("/settings").then(({ data }) => data);

export const updateSettings = (settings: SettingUpdate[]) =>
  apiClient.patch<SettingsData>("/settings", { settings }).then(({ data }) => data);

export const configureTelegram = (input: { botToken: string; chatId: string }) =>
  apiClient.put<SettingsData>("/settings/telegram", input).then(({ data }) => data);

export const testTelegram = () =>
  apiClient.post<{ sent: true }>("/settings/telegram/test").then(({ data }) => data);

export const removeTelegram = () =>
  apiClient.delete<{ configured: false }>("/settings/telegram").then(({ data }) => data);
