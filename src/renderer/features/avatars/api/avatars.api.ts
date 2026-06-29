import { apiClient } from "../../../shared/lib/api-client";

export type AvatarStyle = {
  style: string;
  styleName: string;
  count: number;
};

export type AvatarOption = {
  id: string;
  name: string;
  style: string;
  styleName: string;
  filePath: string;
  seed: string;
  sortOrder: number;
};

export const getAvatarStyles = () =>
  apiClient.get<AvatarStyle[]>("/avatar-styles").then(({ data }) => data);

export const getAvatars = (style?: string) =>
  apiClient
    .get<AvatarOption[]>("/avatars", { params: style ? { style } : undefined })
    .then(({ data }) => data);

export const selectAvatar = (avatarId: string) =>
  apiClient
    .patch<Pick<AvatarOption, "id" | "style" | "styleName" | "filePath">>(
      "/users/me/avatar",
      { avatarId },
    )
    .then(({ data }) => data);

export const avatarAssetUrl = (filePath: string) => {
  const apiUrl = new URL(import.meta.env.VITE_API_URL ?? "http://localhost:3000/api");
  return new URL(filePath, `${apiUrl.origin}/`).toString();
};
