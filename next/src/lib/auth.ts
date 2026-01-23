import { STORAGE_KEYS } from "./constants";

/** アクセストークンを取得 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/** ログインユーザー情報を取得 */
export function getUser(): { username: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 認証済みかどうか */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/** ログイン情報を保存 */
export function saveLoginData(data: { access: string; refresh: string; user: object }) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
}

/** ログアウト */
export function clearLoginData() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

/** 認証付きfetchヘッダーを生成 */
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
