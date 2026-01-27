import React from "react";
import type { Metadata } from "next";
import PrivacyPolicyDetails from "./PrivacyPolicyDetails";
import { Box, Container, Typography, Chip } from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "MLB Noteのプライバシーポリシー・個人情報の取り扱いについて。",
  openGraph: {
    title: "プライバシーポリシー | MLB Note",
    description:
      "MLB Noteのプライバシーポリシー・個人情報の取り扱いについて。",
    type: "website",
  },
};

export default function PrivacyPolicy() {
  return (
    <Box>
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
            icon={<PrivacyTipIcon sx={{ color: "white !important" }} />}
            label="Privacy Policy"
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
            プライバシーポリシー
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            個人情報の取り扱いについて
          </Typography>
        </Container>
      </Box>

      <PrivacyPolicyDetails />
      <Box mb={10}></Box>
    </Box>
  );
}
