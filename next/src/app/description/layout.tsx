import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて | MLB Note",
  description: "Topps NOWカードやWBCデータなど、個人的に気になるMLBのデータをまとめたサイトの紹介です。",
};

export default function DescriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
