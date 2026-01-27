import type { Metadata } from "next";
import TeamsContent from "./TeamsContent";

export const metadata: Metadata = {
  title: "チーム一覧",
  description:
    "MLB全30チームの情報一覧。各チームのロースター、地区情報、リーグ情報を確認できます。",
  openGraph: {
    title: "チーム一覧 | MLB Note",
    description:
      "MLB全30チームの情報一覧。各チームのロースター、地区情報、リーグ情報を確認できます。",
    type: "website",
  },
};

export default function TeamsPage() {
  return <TeamsContent />;
}
