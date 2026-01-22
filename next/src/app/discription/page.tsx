"use client";

import { Box, Container, Paper, Typography, Chip, Badge } from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from "@mui/icons-material/Star";

const blogPosts = [
  {
    title: "大谷翔平の二刀流の魅力",
    excerpt: "投手と打者の両方で活躍する大谷翔平。その驚異的なパフォーマンスと、メジャーリーグにおける二刀流の歴史を振り返ります。",
    date: "2024年1月15日",
    views: "2,340",
    tags: ["大谷翔平", "二刀流", "エンゼルス"],
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "2024シーズン注目の若手選手",
    excerpt: "新シーズンで注目すべき若手選手たちをピックアップ。未来のスーパースターになり得る才能あふれる選手たちを紹介します。",
    date: "2024年1月12日",
    views: "1,850",
    tags: ["若手選手", "プロスペクト", "2024"],
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "ワールドシリーズの名勝負TOP5",
    excerpt: "歴史に残るワールドシリーズの名試合を厳選。劇的な展開と感動的な瞬間を振り返ります。",
    date: "2024年1月10日",
    views: "3,120",
    tags: ["ワールドシリーズ", "歴史", "名勝負"],
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

export default function MLBBlogPage() {
  return (
    <MLBLayout activePath="/discription">
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
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            メジャーリーグを<br />もっと楽しく
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            試合の見どころ、選手の活躍、統計データまで。メジャーリーグの魅力を深掘りするブログです。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* 最新記事 */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <EmojiEventsIcon sx={{ color: "#2e7d32", fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                最新記事
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", pl: 6 }}>
              Latest Articles
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {blogPosts.map((post, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #e8f5e9",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(46, 125, 50, 0.15)",
                  },
                }}
              >
                <Box
                  sx={{
                    height: 140,
                    background: post.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <SportsBaseballIcon sx={{ fontSize: 60, color: "rgba(255,255,255,0.3)" }} />
                  <Badge
                    badgeContent="NEW"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      "& .MuiBadge-badge": {
                        bgcolor: "#2e7d32",
                        color: "white",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        px: 1.5,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#1a472a", lineHeight: 1.4 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.7 }}>
                    {post.excerpt}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {post.tags.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        sx={{
                          bgcolor: "#e8f5e9",
                          color: "#2e7d32",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2, borderTop: "1px solid #f0f0f0" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {post.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <VisibilityIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {post.views}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* 人気記事 */}
        <Box>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <FavoriteIcon sx={{ color: "#c62828", fontSize: 32 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #c62828 0%, #e57373 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                人気記事
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", pl: 6 }}>
              Popular Posts
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8f5e9", overflow: "hidden" }}>
            {["投打「二刀流」の歴史を紐解く", "統計から見るホームラン王の条件", "球場ごとの特徴と攻略法"].map((title, index) => (
              <Box
                key={index}
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  transition: "all 0.3s",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f1f8f4" },
                  borderBottom: index < 2 ? "1px solid #e8f5e9" : "none",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: "#1a472a", mb: 0.5 }}>
                    {title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    2024年1月{8 - index}日 · {(5 - index) * 1000}回閲覧
                  </Typography>
                </Box>
                <StarIcon sx={{ color: "#ffd700", fontSize: 24 }} />
              </Box>
            ))}
          </Paper>
        </Box>
      </Container>
    </MLBLayout>
  );
}
