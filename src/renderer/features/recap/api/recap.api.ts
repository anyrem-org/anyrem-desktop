import { apiClient } from "../../../shared/lib/api-client";

export type RecapProvider = "EMAIL" | "TELEGRAM";

export const testRecap = (provider: RecapProvider) =>
  apiClient
    .post<{ sent: true }>("/recaps/test", { provider })
    .then(({ data }) => data);
