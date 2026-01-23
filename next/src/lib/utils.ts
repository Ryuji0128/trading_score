/** 日付を "2025年1月23日" 形式にフォーマット */
export function formatDateJP(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}

/** 日付を "1/23" 形式にフォーマット */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

/** 日付を "2025/01/23" 形式にフォーマット */
export function formatDateSlash(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

/** N日前の日付文字列を取得 (yyyy-mm-dd) */
export function getDateBefore(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

/** 今日の日付文字列を取得 (yyyy-mm-dd) */
export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}
