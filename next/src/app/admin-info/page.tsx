import type { Metadata } from "next";
import AdminInfoContent from "./AdminInfoContent";

export const metadata: Metadata = {
  title: "サイト管理者情報 | MLB Note",
  description:
    "MLB Noteの運営者情報・連絡先についてのページです。",
  openGraph: {
    title: "サイト管理者情報 | MLB Note",
    description:
      "MLB Noteの運営者情報・連絡先についてのページです。",
    type: "website",
  },
};

export default function AdminInfoPage() {
  return <AdminInfoContent />;
}
