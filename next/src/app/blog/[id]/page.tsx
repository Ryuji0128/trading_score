"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Chip, CircularProgress, Button } from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import MLBLayout from "@/components/MLBLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  author_name: string | null;
  author_email: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function BlogDetailPage() {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetchBlog();
      checkUserPermission();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermission = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('/api/auth/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setIsSuperuser(user.is_superuser || false);
      }
    } catch (error) {
      console.error('Failed to check user permission:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このブログを削除しますか?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/blogs/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push('/blog');
      } else {
        alert('削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to delete blog:', error);
      alert('削除に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  if (!blog) {
    return (
      <MLBLayout activePath="/blog">
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            ブログが見つかりません
          </Typography>
        </Container>
      </MLBLayout>
    );
  }

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
          {blog.image_url && (
            <Box
              component="img"
              src={blog.image_url}
              alt={blog.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mb: 3,
              }}
            />
          )}

          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
            {blog.title}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label={blog.author_name || '管理者'}
              size="small"
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
            />
            <Chip
              label={formatDate(blog.created_at)}
              size="small"
              variant="outlined"
            />
          </Box>

          <Typography
            variant="body1"
            sx={{
              lineHeight: 2,
              whiteSpace: 'pre-wrap',
              mb: 4,
            }}
          >
            {blog.content}
          </Typography>

          {mounted && isSuperuser && (
            <Box sx={{ display: 'flex', gap: 2, borderTop: '1px solid #e0e0e0', pt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/blog/${id}/edit`)}
              >
                編集
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                削除
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </MLBLayout>
  );
}
