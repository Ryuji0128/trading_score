"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Box, Typography, Button, Link } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BaseContainer from "@/components/BaseContainer";

const LinkToContactPage = () => {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/contact" || pathname === "/portal-login" || pathname.startsWith("/portal-admin")) {
    return null;
  }

  return (
    <BaseContainer backgroundColor="primary.main" marginBottom={10}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: { xs: "center", md: "space-around" },
          textAlign: "center",
          color: "primary.contrastText",
          padding: 4,
          borderRadius: "8px",
          gap: 3,
        }}
      >
        <Box sx={{ mb: { xs: 3, md: 0 } }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: "bold", marginBottom: 1 }}
          >
            プロジェクトのご相談
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontStyle: "italic",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
              marginBottom: 2,
            }}
          >
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: "primary.contrastText" }}>
            新規開発・システム改修など、お気軽にご相談ください
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center", marginTop: 4 }}>
          <Link href="/contact" sx={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              sx={{
                color: "primary.contrastText",
                borderColor: "primary.contrastText",
                borderWidth: 2,
                padding: "10px 20px",
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
                display: "flex",
                alignItems: "center",
                gap: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "primary.contrastText",
                },
              }}
            >
              <Typography>お問い合わせ</Typography>
              <ArrowForwardIcon sx={{ fontSize: "1.5rem" }} />
            </Button>
          </Link>
        </Box>
      </Box>
    </BaseContainer>
  );
};

export default LinkToContactPage;
