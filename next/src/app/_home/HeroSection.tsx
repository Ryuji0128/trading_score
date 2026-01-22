"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

const HeroSection = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #00ACC1 100%)",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ maxWidth: 800 }}>
          <Typography
            variant="h1"
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "4rem" },
              lineHeight: 1.2,
              mb: 3,
            }}
          >
            つくりたいものを、
            <br />
            つくる。
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 400,
              mb: 4,
              lineHeight: 1.8,
            }}
          >
            ソフトウェアからハードウェアまで。
            <br />
            アイデアをカタチにする、ものづくり集団です。
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Link href="/contact" passHref>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.9)",
                  },
                }}
                endIcon={<ArrowForwardIcon />}
              >
                お問い合わせ
              </Button>
            </Link>
            <Link href="/discription" passHref>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "white",
                  borderColor: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                詳しく見る
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
