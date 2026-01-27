"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import MLBLayout from "@/components/MLBLayout";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";
import type { Blog } from "@/lib/types";

export default function BlogEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [authorDisplayName, setAuthorDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/image/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        const data = await res.json();
        setError(data.error || '画像のアップロードに失敗しました');
      }
    } catch {
      setError('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

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
        setAuthorDisplayName(data.author_display_name || "");
        setSlug(data.slug || "");
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
          author_display_name: authorDisplayName || null,
          slug: slug || null,
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
              label="投稿者名（任意）"
              value={authorDisplayName}
              onChange={(e) => setAuthorDisplayName(e.target.value)}
              sx={{ mb: 3 }}
              helperText="未入力の場合はログインユーザー名が使用されます"
            />

            <TextField
              fullWidth
              label="スラッグ（任意）"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              sx={{ mb: 3 }}
              helperText="URLに使用されます（例: my-first-post → /blog/my-first-post）"
            />

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField
                  fullWidth
                  label="画像URL（任意）"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  helperText="URLを直接入力するか、画像ファイルをアップロード"
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={uploading ? <CircularProgress size={16} /> : <ImageIcon />}
                  disabled={uploading}
                  sx={{ whiteSpace: 'nowrap', minWidth: 120, height: 56 }}
                >
                  {uploading ? '送信中' : '画像選択'}
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Box>
              {imageUrl && (
                <Box component="img" src={imageUrl} alt="プレビュー" sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1, mt: 1 }} />
              )}
            </Box>

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
