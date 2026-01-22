"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import PageMainTitle from "@/components/PageMainTitle";
import BaseContainer from "@/components/BaseContainer";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const presetAmounts = [3000, 5000, 10000, 30000, 50000, 100000];

export default function PaymentPage() {
  const [paymentType, setPaymentType] = useState<"onetime" | "subscription">("onetime");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountSelect = (amount: number | null) => {
    if (amount === null) {
      setIsCustom(true);
      setSelectedAmount(null);
    } else {
      setIsCustom(false);
      setSelectedAmount(amount);
      setCustomAmount("");
    }
  };

  const getFinalAmount = (): number => {
    if (isCustom) {
      const parsed = parseInt(customAmount, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedAmount || 0;
  };

  const handleCheckout = async () => {
    const amount = getFinalAmount();
    if (amount < 100) {
      setError("100円以上を指定してください");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = paymentType === "onetime"
        ? "/api/checkout/onetime"
        : "/api/checkout/subscription";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "エラーが発生しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <BaseContainer>
        <PageMainTitle japanseTitle="オンライン決済" englishTitle="Payment" />
      </BaseContainer>

      <Container maxWidth="md" sx={{ pb: 10 }}>
        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            {/* 支払いタイプ選択 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                お支払い方法
              </Typography>
              <ToggleButtonGroup
                value={paymentType}
                exclusive
                onChange={(_, value) => value && setPaymentType(value)}
                fullWidth
              >
                <ToggleButton value="onetime" sx={{ py: 2 }}>
                  <CreditCardIcon sx={{ mr: 1 }} />
                  単発払い
                </ToggleButton>
                <ToggleButton value="subscription" sx={{ py: 2 }}>
                  <AutorenewIcon sx={{ mr: 1 }} />
                  月額サブスク
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {paymentType === "onetime"
                  ? "1回限りのお支払いです"
                  : "毎月自動で課金されます（いつでもキャンセル可能）"}
              </Typography>
            </Box>

            {/* 金額選択 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                金額を選択
              </Typography>
              <Grid container spacing={2}>
                {presetAmounts.map((amount) => (
                  <Grid item xs={6} sm={4} key={amount}>
                    <Button
                      variant={selectedAmount === amount && !isCustom ? "contained" : "outlined"}
                      fullWidth
                      onClick={() => handleAmountSelect(amount)}
                      sx={{ py: 1.5 }}
                    >
                      ¥{amount.toLocaleString()}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* カスタム金額 */}
              <Box sx={{ mt: 3 }}>
                <FormControlLabel
                  control={
                    <Radio
                      checked={isCustom}
                      onChange={() => handleAmountSelect(null)}
                    />
                  }
                  label="金額を入力"
                />
                {isCustom && (
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="金額を入力（100円以上）"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>¥</Typography>,
                    }}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
            </Box>

            {/* 確認 */}
            <Box
              sx={{
                bgcolor: "primary.pale",
                borderRadius: 2,
                p: 3,
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {paymentType === "onetime" ? "お支払い金額" : "月額料金"}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                ¥{getFinalAmount().toLocaleString()}
                {paymentType === "subscription" && (
                  <Typography component="span" variant="body1" sx={{ ml: 1 }}>
                    / 月
                  </Typography>
                )}
              </Typography>
            </Box>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleCheckout}
              disabled={loading || getFinalAmount() < 100}
              sx={{ py: 2, fontSize: "1.1rem" }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Stripeで${paymentType === "onetime" ? "支払う" : "申し込む"}`
              )}
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
              決済はStripeの安全なページで行われます
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
