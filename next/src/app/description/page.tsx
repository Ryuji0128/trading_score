"use client";

import { Box, Container, Paper, Typography, Chip } from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import StyleIcon from "@mui/icons-material/Style";
import PublicIcon from "@mui/icons-material/Public";
import ArticleIcon from "@mui/icons-material/Article";

const features = [
  {
    icon: <StyleIcon sx={{ fontSize: 32, color: "#2e7d32" }} />,
    title: "Topps NOW カードデータ",
    description: "カード番号、選手名、発行日、発行枚数などのデータを収集・整理しています。",
  },
  {
    icon: <PublicIcon sx={{ fontSize: 32, color: "#2e7d32" }} />,
    title: "WBC データ",
    description: "ワールド・ベースボール・クラシックの出場選手や大会情報をまとめています。",
  },
  {
    icon: <ArticleIcon sx={{ fontSize: 32, color: "#2e7d32" }} />,
    title: "ブログ",
    description: "MLBについて個人的に気になったことを書いています。",
  },
];

export default function DescriptionPage() {
  return (
    <MLBLayout activePath="/description">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
          px: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M50 0 L60 40 L100 40 L68 62 L80 100 L50 76 L20 100 L32 62 L0 40 L40 40 Z\" fill=\"%23ffffff\" fill-opacity=\"0.03\"/%3E%3C/svg%3E')",
            backgroundSize: "80px 80px",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<SportsBaseballIcon sx={{ color: "white !important" }} />}
            label="About"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            このサイトについて
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            個人的に気になるMLBのデータを集めてまとめたサイトです。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* サイト説明 */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 6,
            borderRadius: 3,
            border: "1px solid #e8f5e9",
            background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a472a", mb: 2 }}>
            MLB Note
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 2, mb: 2 }}>
            Topps NOWカードの発行データやWBCの出場選手情報など、
            個人的に気になるMLBのデータを集めています。
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 2 }}>
            自分用のメモとして作ったサイトですが、
            同じようにMLBのデータに興味がある方の参考になれば幸いです。
          </Typography>
        </Paper>

        {/* コンテンツ一覧 */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 4,
            background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          コンテンツ
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
          {features.map((feature, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid #e8f5e9",
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(46, 125, 50, 0.1)",
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a472a", mb: 1 }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </MLBLayout>
  );
}
