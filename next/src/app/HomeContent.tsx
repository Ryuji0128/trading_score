"use client";

import { useMemo } from "react";
import { Box, Container, Typography, Chip, Card, CardContent, CardMedia, Skeleton } from "@mui/material";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import MLBLayout from "@/components/MLBLayout";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import StyleIcon from "@mui/icons-material/Style";
import ArticleIcon from "@mui/icons-material/Article";
import type { Blog, ToppsCard } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import { formatDateJP, formatDateSlash } from "@/lib/utils";
import { DISPLAY_LIMITS } from "@/lib/constants";

export default function HomeContent() {
  const router = useRouter();

  // ブログ取得
  const { data: blogsData, isLoading: blogsLoading } = useSWR('/api/blogs/', fetcher, { revalidateOnFocus: false });
  const blogs: Blog[] = useMemo(() => {
    if (!blogsData) return [];
    const list = blogsData.results || blogsData;
    return list.slice(0, DISPLAY_LIMITS.HOME_BLOGS);
  }, [blogsData]);

  // Toppsカード取得（発行日が最新順）
  const { data: cardsData, isLoading: cardsLoading } = useSWR('/api/topps-cards/', fetcher, { revalidateOnFocus: false });
  const latestCards: ToppsCard[] = useMemo(() => {
    if (!cardsData) return [];
    const list: ToppsCard[] = cardsData.results || cardsData;
    return list
      .filter(c => c.release_date)
      .sort((a, b) => new Date(b.release_date!).getTime() - new Date(a.release_date!).getTime())
      .slice(0, DISPLAY_LIMITS.HOME_TOPPS_CARDS);
  }, [cardsData]);


  return (
    <MLBLayout activePath="/">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          px: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M50 0 L60 40 L100 40 L68 62 L80 100 L50 76 L20 100 L32 62 L0 40 L40 40 Z\" fill=\"%23ffffff\" fill-opacity=\"0.03\"/%3E%3C/svg%3E')",
            backgroundSize: "80px 80px",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            icon={<SportsBaseballIcon sx={{ color: "white !important" }} />}
            label="Personal MLB Note"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
          <Typography variant="h1" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: "2.5rem", md: "4rem" }, lineHeight: 1.2 }}>
            MLBの気になるデータを<br />個人的にまとめたサイト
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 700, lineHeight: 1.8 }}>
            Topps NOWカードの発行情報やWBCデータなど、<br />
            自分が見たかったMLBデータを集めています。
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>

        {/* 最新ブログセクション */}
        {blogsLoading && (
          <Box sx={{ mb: 8 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {[1, 2, 3].map((i) => (
                <Box key={i}>
                  <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
                  <Skeleton variant="text" height={28} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="60%" />
                </Box>
              ))}
            </Box>
          </Box>
        )}
        {blogs.length > 0 && (
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                    background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  最新ブログ
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Latest Blog Posts
                </Typography>
              </Box>
              <Chip
                icon={<ArticleIcon sx={{ fontSize: 16 }} />}
                label="すべて見る"
                onClick={() => router.push('/blog')}
                sx={{ cursor: 'pointer', bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {blogs.map((blog) => (
                <Card
                  key={blog.id}
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1px solid #e8f5e9',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(46, 125, 50, 0.12)',
                    },
                  }}
                  onClick={() => router.push(`/blog/${blog.id}`)}
                >
                  {blog.image_url ? (
                    <CardMedia
                      component="img"
                      height="160"
                      image={blog.image_url}
                      alt={blog.title}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 160,
                        background: 'linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArticleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.3)' }} />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1a472a', fontSize: '1rem' }}>
                      {blog.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {blog.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {blog.author_name || '管理者'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatDateJP(blog.created_at)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* 最新Topps NOWカードセクション */}
        {cardsLoading && (
          <Box>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={48} sx={{ borderRadius: 2, mb: 1 }} />
            ))}
          </Box>
        )}
        {latestCards.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 0.5,
                    background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  最新 Topps NOW
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Latest Topps NOW Cards
                </Typography>
              </Box>
              <Chip
                icon={<StyleIcon sx={{ fontSize: 16 }} />}
                label="すべて見る"
                onClick={() => router.push('/topps-now')}
                sx={{ cursor: 'pointer', bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {latestCards.map((card) => (
                <Box
                  key={card.id}
                  onClick={() => {
                    if (card.product_url) {
                      window.open(card.product_url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e8f5e9',
                    cursor: card.product_url ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#f8fdf9',
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 700, minWidth: 50 }}>
                      #{card.card_number}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a472a' }}>
                      {card.player?.full_name || card.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {formatDateSlash(card.release_date!)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </MLBLayout>
  );
}
