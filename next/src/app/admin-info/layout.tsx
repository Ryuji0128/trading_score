import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サイト管理者情報 | MLB Note",
  description: "MLB Noteの運営者情報・連絡先についてのページです。",
};

export default function AdminInfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
