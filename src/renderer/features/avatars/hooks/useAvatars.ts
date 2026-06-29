import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../auth/store/auth.store";
import {
  getAvatars,
  getAvatarStyles,
  selectAvatar,
} from "../api/avatars.api";

export const avatarKeys = {
  styles: ["avatars", "styles"] as const,
  list: (style?: string) => ["avatars", "list", style ?? "all"] as const,
};

export const useAvatarStyles = () => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: avatarKeys.styles,
    queryFn: getAvatarStyles,
    enabled: authenticated,
    retry: 1,
  });
};

export const useAvatars = (style?: string) => {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  return useQuery({
    queryKey: avatarKeys.list(style),
    queryFn: () => getAvatars(style),
    enabled: authenticated && Boolean(style),
    retry: 1,
  });
};

export const useSelectAvatar = () => {
  const client = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: selectAvatar,
    onSuccess: (avatar) => {
      if (user) {
        setUser({
          ...user,
          avatarId: avatar.id,
          avatar,
        });
      }
      client.invalidateQueries({ queryKey: avatarKeys.styles });
      client.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
};
