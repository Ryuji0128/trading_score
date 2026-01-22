import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LinkToContactPage from "@/components/LinkToContactPage";
import { SimpleBarWrapper } from "@/components/SimpleBarWrapper";
import theme from "@/theme/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "瀬田製作所",
  description:
    "瀬田製作所は、Webアプリケーションやモバイルアプリの開発を中心に、多様なプロジェクトで信頼を得ているエンジニアチームです。先進技術を用いた、最適なソリューションを提供します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SimpleBarWrapper>
              <Header />
              {children}
              <LinkToContactPage />
              <Footer />
            </SimpleBarWrapper>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}