import { Box, Container, Typography, Paper, Divider } from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | MLB Note",
  description: "MLB Noteの利用規約・免責事項です。",
};

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          利用規約・免責事項
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          最終更新日: 2025年1月
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            データについて
          </Typography>
          <Typography variant="body1" paragraph>
            本サイト（MLB Note）で公開しているTopps NOWカードのデータは、運営者が個人的に収集・整理したものです。
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: "bold", color: "error.main" }}>
            本サイトは、Topps社、MLB（Major League Baseball）、その他公式機関とは一切関係がありません。
          </Typography>
          <Typography variant="body1" paragraph>
            掲載しているデータの正確性・完全性・最新性は保証いたしません。最新かつ正確な情報については、各公式サイトをご確認ください。
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            商標について
          </Typography>
          <Typography variant="body1" component="div">
            <Box component="ul">
              <li>「Topps」「Topps NOW」はTopps Company, Inc.の商標です</li>
              <li>「MLB」「Major League Baseball」はMLB Advanced Media, L.P.の商標です</li>
              <li>その他、本サイトに掲載されている商標・ロゴ等は各権利者に帰属します</li>
            </Box>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="section" sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            免責事項
          </Typography>
          <Typography variant="body1" component="div">
            <Box component="ul">
              <li>本サイトの利用により生じた損害について、運営者は一切の責任を負いません</li>
              <li>本サイトの内容は予告なく変更・削除される場合があります</li>
              <li>外部サイトへのリンク先の内容については、運営者は責任を負いません</li>
            </Box>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="section">
          <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
            お問い合わせ
          </Typography>
          <Typography variant="body1">
            本サイトに関するお問い合わせは、
            <Box component="a" href="/contact" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              お問い合わせページ
            </Box>
            よりご連絡ください。
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
