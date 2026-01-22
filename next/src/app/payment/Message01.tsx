"use client";

import { Box, Button, Paper, Typography } from "@mui/material";

export default function PaymentPage() {
  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", my: 6, px: 2 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Webサイト制作・保守サービスのお支払い
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={4}>
        以下のボタンより、安全な決済画面へ進みます。
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          ご請求金額
        </Typography>

        <Typography variant="body1" mb={3}>
          30,000円（税込）
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleCheckout}
        >
          Stripeで支払う
        </Button>
      </Paper>
    </Box>
  );
}
