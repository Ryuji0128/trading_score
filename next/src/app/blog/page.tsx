"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Container, Typography, Card, CardContent, CardMedia, Grid, Chip, CircularProgress, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import MLBLayout from "@/components/MLBLayout";
import ArticleIcon from "@mui/icons-material/Article";
import AddIcon from "@mui/icons-material/Add";
import type { Blog, User } from "@/lib/types";
import { fetcher, authFetcher } from "@/lib/fetcher";

export default function BlogPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const { data: blogsData, isLoading: loading } = useSWR('/api/blogs/', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: user } = useSWR<User | null>('/api/auth/me/', authFetcher, {
    revalidateOnFocus: false,
  });

  const blogs: Blog[] = useMemo(() => {
    if (!blogsData) return [];
    return blogsData.results || blogsData;
  }, [blogsData]);

  const isSuperuser = user?.is_superuser ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <MLBLayout activePath="/blog">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
          px: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<ArticleIcon sx={{ color: "white !important" }} />}
            label="Blog"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
                  ブログ
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
                  MLBについて個人的に気になったことを書いています
                </Typography>
              </Box>
              {mounted && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/blog/create')}
                  sx={{
                    bgcolor: "white",
                    color: "#2e7d32",
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.9)",
                    },
                    display: isSuperuser ? 'flex' : 'none',
                  }}
                >
                  新規投稿
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#2e7d32' }} />
          </Box>
        ) : blogs.length > 0 ? (
          <Grid container spacing={4}>
            {blogs.map((blog) => (
              <Grid item xs={12} md={6} lg={4} key={blog.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => router.push(`/blog/${blog.id}`)}
                >
                  {blog.image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={blog.image_url}
                      alt={blog.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {blog.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {blog.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {blog.author_name || '管理者'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(blog.created_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              まだブログ投稿がありません
            </Typography>
          </Box>
        )}
      </Container>
    </MLBLayout>
  );
}
