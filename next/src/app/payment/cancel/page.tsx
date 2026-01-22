"use client";

import { Box, Button, Container, Paper, Typography } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";

export default function CancelPage() {
  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <CancelOutlinedIcon
            sx={{
              fontSize: 80,
              color: "text.disabled",
              mb: 3,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
            }}
          >
            キャンセルされました
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              lineHeight: 1.8,
            }}
          >
            お支払いはキャンセルされました。
            <br />
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </Typography>
          <Link href="/payment" passHref>
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              決済ページへ戻る
            </Button>
          </Link>
        </Paper>
      </Container>
    </Box>
  );
}
