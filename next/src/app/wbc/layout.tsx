import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WBC データ | MLB Note",
  description: "ワールド・ベースボール・クラシックの出場選手や大会情報をまとめています。",
};

export default function WbcLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
