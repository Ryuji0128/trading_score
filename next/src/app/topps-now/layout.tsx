import type { Metadata } from "next";
import { CopyProtection } from "@/components/CopyProtection";

export const metadata: Metadata = {
  title: "Topps NOW カードデータ | MLB Note",
  description: "Topps NOWカードの発行日、カード番号、選手名、発行枚数などのデータ一覧です。",
};

export default function ToppsNowLayout({ children }: { children: React.ReactNode }) {
  return (
    <CopyProtection>
      {children}
    </CopyProtection>
  );
}
