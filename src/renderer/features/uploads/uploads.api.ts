import { apiClient } from "../../shared/lib/api-client";

export const uploadAssetUrl = (path: string) => {
  const apiUrl = new URL(import.meta.env.VITE_API_URL ?? "http://localhost:3000/api");
  return new URL(path, `${apiUrl.origin}/`).toString();
};

export const uploadImage = (input: { dataUrl: string; name: string }) =>
  apiClient.post<{ url: string }>("/uploads/images", input).then(({ data }) => ({
    url: uploadAssetUrl(data.url),
  }));
