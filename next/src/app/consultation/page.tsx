"use client";

import { Box, Container, Typography, Chip, Paper } from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const statsCategories = [
  {
    title: "打撃成績",
    description: "打率、本塁打、打点などの主要打撃指標",
    icon: <SportsBaseballIcon />,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "投手成績",
    description: "防御率、奪三振、勝利数などの投手指標",
    icon: <BarChartIcon />,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "高度指標",
    description: "WAR、OPS、FIPなどのセイバーメトリクス",
    icon: <TrendingUpIcon />,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    title: "チーム成績",
    description: "順位表、勝率、得失点差などのチーム統計",
    icon: <EmojiEventsIcon />,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
];

export default function StatsPage() {
  return (
    <MLBLayout activePath="/stats">
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
            icon={<AssessmentIcon sx={{ color: "white !important" }} />}
            label="Statistics"
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
            統計データ
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            詳細な統計データで、選手やチームのパフォーマンスを深く理解しましょう。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
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
            統計カテゴリー
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Stats Categories
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {statsCategories.map((category, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #e8f5e9",
                transition: "all 0.4s",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(46, 125, 50, 0.15)",
                },
              }}
            >
              <Box
                sx={{
                  height: 120,
                  background: category.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  "& svg": { fontSize: 56 },
                }}
              >
                {category.icon}
              </Box>
              <Box sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#1a472a" }}>
                  {category.title}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                  {category.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>
    </MLBLayout>
  );
}
