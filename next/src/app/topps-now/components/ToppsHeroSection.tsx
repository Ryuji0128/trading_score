"use client";

import { Box, Container, Typography, Chip } from "@mui/material";
import StyleIcon from "@mui/icons-material/Style";

export default function ToppsHeroSection() {
  return (
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
          width: "40%",
          height: "100%",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Chip
          icon={<StyleIcon sx={{ color: "white !important" }} />}
          label="Topps NOW Database"
          size="small"
          sx={{
            mb: 2,
            bgcolor: "rgba(255,255,255,0.2)",
            color: "white",
            fontWeight: 600,
            borderRadius: 2,
          }}
        />
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            mb: 2,
            fontSize: { xs: "2rem", md: "3.5rem" },
          }}
        >
          Topps NOW カード一覧
        </Typography>
        <Typography
          variant="h6"
          sx={{
            opacity: 0.9,
            fontWeight: 400,
            maxWidth: 600,
            lineHeight: 1.8,
          }}
        >
          MLB公式Topps NOWカードのデータベース。発行枚数、選手情報、チーム別の統計を確認できます。
        </Typography>
      </Container>
    </Box>
  );
}
