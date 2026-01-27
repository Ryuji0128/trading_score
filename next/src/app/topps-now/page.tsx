import type { Metadata } from "next";
import ToppsNowContent from "./ToppsNowContent";

export const metadata: Metadata = {
  title: "Topps NOW カード一覧",
  description:
    "Topps NOWカードの発行情報データベース。カード番号、選手名、発行日、発行枚数などを一覧で検索・確認できます。",
  openGraph: {
    title: "Topps NOW カード一覧 | MLB Note",
    description:
      "Topps NOWカードの発行情報データベース。カード番号、選手名、発行日、発行枚数などを一覧で検索・確認できます。",
    type: "website",
  },
  keywords: ["Topps NOW", "MLB", "野球カード", "トレーディングカード", "大谷翔平"],
};

export default function ToppsNowPage() {
  return <ToppsNowContent />;
}
