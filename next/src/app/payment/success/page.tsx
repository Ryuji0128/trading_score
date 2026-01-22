"use client";

import { Box, Button, Container, Paper, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HomeIcon from "@mui/icons-material/Home";
import Link from "next/link";

export default function SuccessPage() {
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
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: "success.main",
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
            お支払い完了
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: 4,
              lineHeight: 1.8,
            }}
          >
            ご利用ありがとうございます。
            <br />
            お支払いが正常に完了しました。
          </Typography>
          <Box
            sx={{
              bgcolor: "primary.pale",
              borderRadius: 2,
              p: 3,
              mb: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              確認メールをお送りしました。
              <br />
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </Typography>
          </Box>
          <Link href="/" passHref>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
              }}
            >
              トップページへ戻る
            </Button>
          </Link>
        </Paper>
      </Container>
    </Box>
  );
}
