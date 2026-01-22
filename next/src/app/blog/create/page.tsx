"use client";

import { useState } from "react";
import { Box, Container, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import MLBLayout from "@/components/MLBLayout";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function BlogCreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/blogs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          image_url: imageUrl || null,
          published: true,
        }),
      });

      if (response.ok) {
        router.push('/blog');
      } else {
        const data = await response.json();
        setError(data.error || 'ブログの投稿に失敗しました');
      }
    } catch (err) {
      setError('ブログの投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MLBLayout activePath="/blog">
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/blog')}
          sx={{ mb: 3 }}
        >
          ブログ一覧に戻る
        </Button>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
            ブログ新規投稿
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="画像URL（任意）"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              sx={{ mb: 3 }}
              helperText="ブログのサムネイル画像URLを入力してください"
            />

            <TextField
              fullWidth
              label="本文"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              multiline
              rows={12}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{
                  bgcolor: "#2e7d32",
                  "&:hover": {
                    bgcolor: "#1a472a",
                  },
                }}
              >
                投稿する
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/blog')}
                disabled={loading}
              >
                キャンセル
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </MLBLayout>
  );
}
