import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ブログ | MLB Note",
  description: "MLBについて個人的に気になったことを書いています。",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
