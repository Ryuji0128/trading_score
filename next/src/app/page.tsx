import type { Metadata } from "next";
import HomeContent from "./HomeContent";

export const metadata: Metadata = {
  title: "MLB Note - Topps NOW・WBC・MLB情報まとめ",
  description:
    "Topps NOWカードの発行情報、WBCトーナメントデータ、MLB順位表・試合結果など、個人的に気になるMLBのデータをまとめたサイトです。",
  openGraph: {
    title: "MLB Note - Topps NOW・WBC・MLB情報まとめ",
    description:
      "Topps NOWカードの発行情報、WBCトーナメントデータ、MLB順位表・試合結果など、個人的に気になるMLBのデータをまとめたサイトです。",
    type: "website",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
