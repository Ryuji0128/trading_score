"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, Paper, Chip, CircularProgress, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import MLBLayout from "@/components/MLBLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";
import type { Blog } from "@/lib/types";
import { getAccessToken, getAuthHeaders } from "@/lib/auth";
import { formatDateJP } from "@/lib/utils";

interface Props {
  id: string;
}

export default function BlogDetailContent({ id }: Props) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (id) {
      fetchBlog();
      checkUserPermission();
      incrementViewCount();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${id}/`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
      }
    } catch {
      // Failed to fetch blog
    } finally {
      setLoading(false);
    }
  };

  const checkUserPermission = async () => {
    try {
      if (!getAccessToken()) return;
      const response = await fetch('/api/auth/me/', { headers: getAuthHeaders() });
      if (response.ok) {
        const user = await response.json();
        setIsSuperuser(user.is_superuser || false);
      }
    } catch {
      // Failed to check permission
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/blogs/${id}/increment_view/`, { method: 'POST' });
    } catch {
      // PV counting is non-critical
    }
  };

  const handleDelete = async () => {
    if (!confirm('このブログを削除しますか?')) return;

    try {
      const response = await fetch(`/api/blogs/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        router.push('/blog');
      } else {
        alert('削除に失敗しました');
      }
    } catch {
      alert('削除に失敗しました');
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

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              label={blog.author_name || '管理者'}
              size="small"
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
            />
            <Chip
              label={formatDateJP(blog.created_at)}
              size="small"
              variant="outlined"
            />
            {mounted && isSuperuser && (
              <Chip
                icon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                label={`${blog.view_count} views`}
                size="small"
                variant="outlined"
                sx={{ color: '#666' }}
              />
            )}
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

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShareIcon />}
              onClick={() => {
                const url = window.location.href;
                const text = `${blog.title}`;
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                  '_blank',
                  'noopener,noreferrer,width=550,height=420'
                );
              }}
              sx={{ color: '#1da1f2', borderColor: '#1da1f2', '&:hover': { borderColor: '#0d8bd9', bgcolor: 'rgba(29,161,242,0.04)' } }}
            >
              Xに共有
            </Button>
          </Box>

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
