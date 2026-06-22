import { app, safeStorage } from "electron";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const tokenPath = () => path.join(app.getPath("userData"), "refresh-token.bin");

export async function getRefreshToken() {
  if (!safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(await readFile(tokenPath()));
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string) {
  if (!safeStorage.isEncryptionAvailable()) throw new Error("Secure token storage is unavailable");
  await writeFile(tokenPath(), safeStorage.encryptString(token), { mode: 0o600 });
}

export async function clearRefreshToken() {
  await rm(tokenPath(), { force: true });
}
