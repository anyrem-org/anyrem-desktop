import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import {
  configureTelegram,
  getSettings,
  removeTelegram,
  testTelegram,
  updateSettings,
  type SettingUpdate,
  type SettingsData,
} from "../api/settings.api";

const settingsKey = ["settings"] as const;

export const useSettings = () => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: settingsKey,
    queryFn: getSettings,
    enabled: authenticated,
    retry: 1,
  });
};

export function useUpdateSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (settings: SettingUpdate[]) => updateSettings(settings),
    onSuccess: (data) => client.setQueryData(settingsKey, data),
  });
}

export function useConfigureTelegram() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: configureTelegram,
    onSuccess: (data) => client.setQueryData(settingsKey, data),
  });
}

export function useTestTelegram() {
  return useMutation({ mutationFn: testTelegram });
}

export function useRemoveTelegram() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: removeTelegram,
    onSuccess: () =>
      client.setQueryData<SettingsData | undefined>(settingsKey, (settings) =>
        settings
          ? {
              ...settings,
              telegram: {
                configured: false,
                maskedChatId: null,
                bot_username: null,
                verified_at: null,
              },
            }
          : settings,
      ),
  });
}
