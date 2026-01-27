import type { Metadata } from "next";
import StatsContent from "./StatsContent";

export const metadata: Metadata = {
  title: "順位表",
  description:
    "MLBの順位表・スタンディング。アメリカンリーグ・ナショナルリーグの各地区順位、勝敗、勝率などを確認できます。",
  openGraph: {
    title: "順位表 | MLB Note",
    description:
      "MLBの順位表・スタンディング。アメリカンリーグ・ナショナルリーグの各地区順位、勝敗、勝率などを確認できます。",
    type: "website",
  },
};

export default function StatsPage() {
  return <StatsContent />;
}
