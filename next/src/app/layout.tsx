import Footer from "@/components/Footer";
import { SimpleBarWrapper } from "@/components/SimpleBarWrapper";
import theme from "@/theme/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MLB Fanatic - メジャーリーグを語る",
  description:
    "メジャーリーグの試合速報、選手分析、統計データ、移籍情報まで。メジャーリーグの魅力を余すことなくお届けするブログです。",
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
              {children}
              <Footer />
            </SimpleBarWrapper>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}