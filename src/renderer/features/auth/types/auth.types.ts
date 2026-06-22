export type AuthUser = { id: string; name: string; email: string; avatarId?: string | null };
export type LoginInput = { email: string; password: string; deviceName?: string };
export type TokenResponse = { accessToken: string; refreshToken: string; expiresIn: number };
