import type { Metadata } from "next";
import GamesContent from "./GamesContent";

export const metadata: Metadata = {
  title: "試合結果",
  description:
    "MLBの最近の試合結果・スコア一覧。各チームの試合情報をリアルタイムで確認できます。",
  openGraph: {
    title: "試合結果 | MLB Note",
    description:
      "MLBの最近の試合結果・スコア一覧。各チームの試合情報をリアルタイムで確認できます。",
    type: "website",
  },
};

export default function GamesPage() {
  return <GamesContent />;
}
