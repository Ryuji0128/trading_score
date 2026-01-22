"use client";

import { Box, Container, Typography, Chip, Paper, Grid } from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import StyleIcon from "@mui/icons-material/Style";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const toppsCards = [
  {
    title: "大谷翔平 完全試合級の投球",
    date: "2024年1月20日",
    description: "9イニング13奪三振の圧巻のピッチング。相手打線を完全に封じ込めた歴史的パフォーマンス。",
    cardNumber: "#TN-123",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    icon: <LocalFireDepartmentIcon />,
  },
  {
    title: "アーロン・ジャッジ サヨナラ満塁弾",
    date: "2024年1月19日",
    description: "9回裏、劇的なサヨナラ満塁ホームラン。チームを勝利に導いた歴史的な一打。",
    cardNumber: "#TN-122",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    icon: <EmojiEventsIcon />,
  },
  {
    title: "マイク・トラウト 3本塁打",
    date: "2024年1月18日",
    description: "1試合3本塁打の快挙達成。シーズン序盤から圧倒的な長打力を見せつける。",
    cardNumber: "#TN-121",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    icon: <StarIcon />,
  },
  {
    title: "フアン・ソト 連続四球記録",
    date: "2024年1月17日",
    description: "5試合連続四球の新記録達成。選球眼の良さが際立つパフォーマンス。",
    cardNumber: "#TN-120",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    icon: <TrendingUpIcon />,
  },
  {
    title: "ロナルド・アクーニャJr. 盗塁王",
    date: "2024年1月16日",
    description: "今季30盗塁目を記録。圧倒的なスピードでベースを駆け抜ける。",
    cardNumber: "#TN-119",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    icon: <SportsBaseballIcon />,
  },
  {
    title: "ムーキー・ベッツ サイクル安打",
    date: "2024年1月15日",
    description: "サイクル安打達成。単打、二塁打、三塁打、本塁打を全て記録した完璧な試合。",
    cardNumber: "#TN-118",
    gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    icon: <StarIcon />,
  },
];

const cardFeatures = [
  {
    title: "限定カード",
    description: "24時間限定で販売される特別なカード",
    icon: <StyleIcon />,
    color: "#2e7d32",
  },
  {
    title: "リアルタイム",
    description: "試合直後に発行される即時性",
    icon: <LocalFireDepartmentIcon />,
    color: "#d32f2f",
  },
  {
    title: "コレクション",
    description: "歴史的瞬間を記録する価値",
    icon: <EmojiEventsIcon />,
    color: "#ed6c02",
  },
];

export default function ToppsNowPage() {
  return (
    <MLBLayout activePath="/topps-now">
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
            icon={<StyleIcon sx={{ color: "white !important" }} />}
            label="Topps Now"
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
            Topps Now
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            歴史的瞬間を記録する限定トレーディングカード。試合直後に発行される特別なカードコレクション。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Topps Nowの特徴 */}
        <Box sx={{ mb: 10 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Topps Nowとは
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              What is Topps Now
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {cardFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px solid #e8f5e9",
                    height: "100%",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(46, 125, 50, 0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      bgcolor: `${feature.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      color: feature.color,
                      "& svg": { fontSize: 32 },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#1a472a" }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 最新カード */}
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              最新カード
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Latest Cards
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {toppsCards.map((card, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #e8f5e9",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 40px rgba(46, 125, 50, 0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 180,
                      background: card.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        color: "white",
                        "& svg": { fontSize: 80, opacity: 0.3 },
                      }}
                    >
                      {card.icon}
                    </Box>
                    <Chip
                      label={card.cardNumber}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#1a472a",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#1a472a", lineHeight: 1.4 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mb: 2, lineHeight: 1.7, flexGrow: 1 }}>
                      {card.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                      <SportsBaseballIcon sx={{ fontSize: 16, color: "#2e7d32" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        {card.date}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </MLBLayout>
  );
}
