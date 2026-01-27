import Footer from "@/components/Footer";
import { SimpleBarWrapper } from "@/components/SimpleBarWrapper";
import theme from "@/theme/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://baseball-now.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MLB Note - Topps NOW・WBC・MLB情報まとめ",
    template: "%s | MLB Note",
  },
  description:
    "Topps NOWカードの発行情報、WBCトーナメントデータ、MLB順位表・試合結果など、個人的に気になるMLBのデータをまとめたサイトです。",
  keywords: ["MLB", "Topps NOW", "WBC", "野球", "メジャーリーグ", "大谷翔平", "順位表"],
  authors: [{ name: "MLB Note" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "MLB Note",
    title: "MLB Note - Topps NOW・WBC・MLB情報まとめ",
    description:
      "Topps NOWカードの発行情報、WBCトーナメントデータ、MLB順位表・試合結果など、個人的に気になるMLBのデータをまとめたサイトです。",
  },
  twitter: {
    card: "summary_large_image",
    title: "MLB Note - Topps NOW・WBC・MLB情報まとめ",
    description:
      "Topps NOWカードの発行情報、WBCトーナメントデータ、MLB順位表・試合結果など、個人的に気になるMLBのデータをまとめたサイトです。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console の認証コードをここに設定
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MLB Note",
  url: siteUrl,
  description:
    "Topps NOWカードの発行情報、WBCトーナメントデータ、MLB順位表・試合結果など、個人的に気になるMLBのデータをまとめたサイトです。",
  inLanguage: "ja",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/topps-now?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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