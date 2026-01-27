import type { Metadata } from "next";
import BlogContent from "./BlogContent";

export const metadata: Metadata = {
  title: "ブログ",
  description:
    "MLBについて個人的に気になったことを書いているブログです。Topps NOWカードやMLBの情報を発信しています。",
  openGraph: {
    title: "ブログ | MLB Note",
    description:
      "MLBについて個人的に気になったことを書いているブログです。Topps NOWカードやMLBの情報を発信しています。",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogContent />;
}
