import type { Metadata } from "next";
import WBCContent from "./WBCContent";

export const metadata: Metadata = {
  title: "WBC - ワールドベースボールクラシック",
  description:
    "WBC（ワールドベースボールクラシック）の各大会データ。トーナメント結果、出場選手一覧、Topps NOWカード情報を確認できます。",
  openGraph: {
    title: "WBC - ワールドベースボールクラシック | MLB Note",
    description:
      "WBC（ワールドベースボールクラシック）の各大会データ。トーナメント結果、出場選手一覧、Topps NOWカード情報を確認できます。",
    type: "website",
  },
  keywords: ["WBC", "ワールドベースボールクラシック", "World Baseball Classic", "侍ジャパン", "MLB", "大谷翔平"],
};

export default function WBCPage() {
  return <WBCContent />;
}
