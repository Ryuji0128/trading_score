"use client";

import { useState } from "react";
import { Box, Container, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import MLBLayout from "@/components/MLBLayout";
import LoginIcon from "@mui/icons-material/Login";
import { saveLoginData } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        saveLoginData(data);
        router.push('/blog');
      } else {
        const data = await response.json();
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MLBLayout activePath="/login">
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LoginIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              ログイン
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 3 }}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              disabled={loading}
              sx={{
                bgcolor: "#2e7d32",
                py: 1.5,
                "&:hover": {
                  bgcolor: "#1a472a",
                },
              }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ※ superuser権限を持つアカウントでログインすることで、ブログの投稿・編集・削除が可能になります
            </Typography>
          </Box>
        </Paper>
      </Container>
    </MLBLayout>
  );
}
