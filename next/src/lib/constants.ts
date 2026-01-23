// テーマカラー
export const COLORS = {
  primary: "#1a472a",
  primaryLight: "#2e7d32",
  primaryBg: "#e8f5e9",
  primaryBgLight: "#f1f8f4",
  gradient: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
} as const;

// 表示件数
export const DISPLAY_LIMITS = {
  HOME_BLOGS: 3,
  HOME_TOPPS_CARDS: 6,
  GAMES_DAYS_RANGE: 7,
} as const;

// LocalStorageキー
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

// MLB API
export const MLB_API_BASE = "https://statsapi.mlb.com/api/v1";

// MLB Division IDs
export const DIVISION_IDS = {
  AL_EAST: 201,
  AL_CENTRAL: 202,
  AL_WEST: 200,
  NL_EAST: 204,
  NL_CENTRAL: 205,
  NL_WEST: 203,
} as const;
