import type { Metadata } from "next";
import DescriptionContent from "./DescriptionContent";

export const metadata: Metadata = {
  title: "このサイトについて",
  description:
    "MLB Noteについて。Topps NOWカードの発行データやWBCの出場選手情報など、個人的に気になるMLBのデータを集めています。",
  openGraph: {
    title: "このサイトについて | MLB Note",
    description:
      "MLB Noteについて。Topps NOWカードの発行データやWBCの出場選手情報など、個人的に気になるMLBのデータを集めています。",
    type: "website",
  },
};

export default function DescriptionPage() {
  return <DescriptionContent />;
}
