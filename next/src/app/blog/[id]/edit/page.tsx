"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import MLBLayout from "@/components/MLBLayout";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { Blog } from "@/lib/types";

export default function BlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}/`);
      if (response.ok) {
        const data: Blog = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setImageUrl(data.image_url || "");
      } else {
        setError('ブログの取得に失敗しました');
      }
    } catch (err) {
      setError('ブログの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('ログインが必要です');
        setSubmitting(false);
        return;
      }

      const response = await fetch(`/api/blogs/${id}/`, {
        method: 'PUT',
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
        router.push(`/blog/${id}`);
      } else {
        const data = await response.json();
        setError(data.error || 'ブログの更新に失敗しました');
      }
    } catch (err) {
      setError('ブログの更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MLBLayout activePath="/blog">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: '#2e7d32' }} />
          </Box>
        </Container>
      </MLBLayout>
    );
  }

  return (
    <MLBLayout activePath="/blog">
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/blog/${id}`)}
          sx={{ mb: 3 }}
        >
          ブログに戻る
        </Button>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
            ブログ編集
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
                disabled={submitting}
                sx={{
                  bgcolor: "#2e7d32",
                  "&:hover": {
                    bgcolor: "#1a472a",
                  },
                }}
              >
                更新する
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push(`/blog/${id}`)}
                disabled={submitting}
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
