export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarId?: string | null;
  avatar?: {
    id: string;
    style: string;
    styleName: string;
    filePath: string;
  } | null;
};
export type LoginInput = { email: string; password: string; deviceName?: string };
export type RegisterInput = { email: string; password: string; name: string };
export type TokenResponse = { accessToken: string; refreshToken: string; expiresIn: number };
