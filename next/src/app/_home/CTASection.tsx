"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

const CTASection = () => {
  return (
    <Box
      sx={{
        py: 10,
        background: "linear-gradient(135deg, #00ACC1 0%, #1565C0 100%)",
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 3,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            「こんなの作れる？」
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.9)",
              mb: 4,
              lineHeight: 1.8,
            }}
          >
            まずは気軽にご相談ください。
            <br />
            アイデア段階からでも、一緒に考えます。
          </Typography>
          <Link href="/contact" passHref>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                },
              }}
              endIcon={<ArrowForwardIcon />}
            >
              無料相談を予約する
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;
