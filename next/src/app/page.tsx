"use client";

import { Box, Container, Typography, Chip, Paper, Grid } from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";

const featuredStories = [
  {
    title: "大谷翔平、今季3度目の猛打賞",
    category: "試合速報",
    date: "2024年1月20日",
    image: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "ドジャース、補強に積極姿勢",
    category: "移籍情報",
    date: "2024年1月19日",
    image: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "若手有望株ランキングTOP10",
    category: "プロスペクト",
    date: "2024年1月18日",
    image: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

const quickLinks = [
  { title: "今日の試合結果", icon: <SportsBaseballIcon />, color: "#2e7d32" },
  { title: "最新ニュース", icon: <NewReleasesIcon />, color: "#1976d2" },
  { title: "順位表", icon: <TrendingUpIcon />, color: "#f57c00" },
  { title: "選手ランキング", icon: <StarIcon />, color: "#7b1fa2" },
];

export default function HomePage() {
  return (
    <MLBLayout activePath="/">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
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
            label="MLB Blog"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
          <Typography variant="h1" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: "2.5rem", md: "4rem" }, lineHeight: 1.2 }}>
            メジャーリーグの<br />すべてがここに
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 700, lineHeight: 1.8 }}>
            試合速報、選手分析、統計データ、移籍情報まで。<br />
            メジャーリーグの魅力を余すことなくお届けします。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* クイックリンク */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={3}>
            {quickLinks.map((link, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    border: "1px solid #e8f5e9",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(46, 125, 50, 0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: `${link.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 2,
                      color: link.color,
                      "& svg": { fontSize: 28 },
                    }}
                  >
                    {link.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a472a" }}>
                    {link.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* 注目記事 */}
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
              注目の記事
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Featured Stories
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {featuredStories.map((story, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #e8f5e9",
                    cursor: "pointer",
                    transition: "all 0.4s",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 40px rgba(46, 125, 50, 0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 160,
                      background: story.image,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SportsBaseballIcon sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)" }} />
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Chip
                      label={story.category}
                      size="small"
                      sx={{
                        mb: 2,
                        bgcolor: "#e8f5e9",
                        color: "#2e7d32",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#1a472a" }}>
                      {story.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {story.date}
                    </Typography>
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
