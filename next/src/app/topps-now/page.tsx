"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Container, Typography, Chip, Paper, CircularProgress, Link } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import MLBLayout from "@/components/MLBLayout";
import StyleIcon from "@mui/icons-material/Style";

interface ToppsCard {
  id: number;
  card_number: string;
  player: {
    full_name: string;
  } | null;
  team: {
    full_name: string;
    abbreviation: string;
    primary_color: string;
  } | null;
  title: string;
  total_print: number | null;
  image_url: string;
  product_url: string;
  product_url_long: string;
  created_at: string;
  topps_set: {
    year: number;
    name: string;
  };
}

export default function ToppsNowPage() {
  const [toppsCards, setToppsCards] = useState<ToppsCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToppsCards = async () => {
      try {
        // nginxプロキシ経由でAPIにアクセス
        const response = await fetch('/api/topps-cards/');
        if (response.ok) {
          const data = await response.json();
          setToppsCards(data.results || data);
        }
      } catch (error) {
        console.error('Failed to fetch Topps cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToppsCards();
  }, []);

  // カード番号のソート関数
  const sortCardNumber = (a: string, b: string) => {
    // 特殊カード（TS-, SP-）とそうでないものを区別
    const isSpecialA = a.startsWith('TS-') || a.startsWith('SP-');
    const isSpecialB = b.startsWith('TS-') || b.startsWith('SP-');

    // 特殊カードは後ろにソート
    if (isSpecialA && !isSpecialB) return 1;
    if (!isSpecialA && isSpecialB) return -1;

    // 両方特殊カードの場合は文字列比較
    if (isSpecialA && isSpecialB) {
      return a.localeCompare(b);
    }

    // 通常カードの場合: 数値部分を抽出して比較
    // "OS-14" -> prefix: "OS", num: 14
    // "MLBJP" -> prefix: "MLBJP", num: undefined
    // "100" -> prefix: "", num: 100
    const parseCardNumber = (str: string) => {
      // 数値のみの場合
      const numOnly = str.match(/^(\d+)$/);
      if (numOnly) {
        return { prefix: '', num: parseInt(numOnly[1]) };
      }

      // プレフィックス-数値の形式
      const withDash = str.match(/^([A-Z]+)-(\d+)$/);
      if (withDash) {
        return { prefix: withDash[1], num: parseInt(withDash[2]) };
      }

      // 文字列のみの場合
      const alphaOnly = str.match(/^([A-Z]+)$/);
      if (alphaOnly) {
        return { prefix: alphaOnly[1], num: undefined };
      }

      // その他の場合は文字列全体をprefixとする
      return { prefix: str, num: undefined };
    };

    const parsedA = parseCardNumber(a);
    const parsedB = parseCardNumber(b);

    // プレフィックスが異なる場合は文字列比較
    if (parsedA.prefix !== parsedB.prefix) {
      return parsedA.prefix.localeCompare(parsedB.prefix);
    }

    // プレフィックスが同じ場合
    // 両方数値がある場合は数値比較
    if (parsedA.num !== undefined && parsedB.num !== undefined) {
      return parsedA.num - parsedB.num;
    }

    // 片方だけ数値がある場合は数値ありを後ろに
    if (parsedA.num !== undefined) return 1;
    if (parsedB.num !== undefined) return -1;

    // デフォルトは文字列比較
    return a.localeCompare(b);
  };

  // DataGridのカラム定義
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'card_number',
      headerName: 'カード番号',
      width: 130,
      headerClassName: 'data-grid-header',
      sortComparator: sortCardNumber,
      filterable: true,
      renderCell: (params) => {
        const shortUrl = params.row.product_url;
        const longUrl = params.row.product_url_long;
        const hasTwoUrls = shortUrl && longUrl && shortUrl !== longUrl;

        if (shortUrl) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Link
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#1a472a',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#2e7d32',
                  },
                }}
              >
                {params.value}
              </Link>
              {hasTwoUrls && (
                <Link
                  href={longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#666',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: '#2e7d32',
                    },
                  }}
                >
                  (別)
                </Link>
              )}
            </Box>
          );
        }
        return params.value;
      },
    },
    {
      field: 'player',
      headerName: '選手名',
      width: 200,
      headerClassName: 'data-grid-header',
      valueGetter: (value, row) => row.player?.full_name || 'Team Set',
      filterable: true,
    },
    {
      field: 'team',
      headerName: 'チーム',
      width: 180,
      headerClassName: 'data-grid-header',
      valueGetter: (value, row) => row.team?.full_name || '-',
      filterable: true,
    },
    {
      field: 'title',
      headerName: 'タイトル',
      flex: 1,
      minWidth: 300,
      headerClassName: 'data-grid-header',
      filterable: true,
    },
    {
      field: 'total_print',
      headerName: '発行枚数',
      width: 130,
      type: 'number',
      headerClassName: 'data-grid-header',
      valueFormatter: (value) => value ? value.toLocaleString() : '-',
      filterable: true,
    },
  ], []);

  // 統計情報を計算
  const stats = useMemo(() => {
    if (toppsCards.length === 0) return null;

    const totalCards = toppsCards.length;
    const cardsWithPrint = toppsCards.filter(card => card.total_print !== null);
    const avgPrint = cardsWithPrint.length > 0
      ? Math.round(cardsWithPrint.reduce((sum, card) => sum + (card.total_print || 0), 0) / cardsWithPrint.length)
      : 0;

    const maxPrintCard = cardsWithPrint.reduce((max, card) =>
      (card.total_print || 0) > (max.total_print || 0) ? card : max
    , cardsWithPrint[0]);

    const minPrintCard = cardsWithPrint.reduce((min, card) =>
      (card.total_print || 0) < (min.total_print || 0) ? card : min
    , cardsWithPrint[0]);

    return {
      totalCards,
      avgPrint,
      maxPrintCard,
      minPrintCard,
    };
  }, [toppsCards]);

  return (
    <MLBLayout activePath="/topps-now">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
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
            icon={<StyleIcon sx={{ color: "white !important" }} />}
            label="Topps Now"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            Topps Now データベース
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            歴史的瞬間を記録する限定トレーディングカードのデータ分析
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* 統計情報カード */}
        {stats && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              統計情報
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" },
                gap: 3,
              }}
            >
              {/* 総カード数 */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e8f5e9",
                  background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
                  総カード数
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
                  {stats.totalCards.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  枚
                </Typography>
              </Paper>

              {/* 平均発行枚数 */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e8f5e9",
                  background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
                  平均発行枚数
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
                  {stats.avgPrint.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  枚
                </Typography>
              </Paper>

              {/* 最多発行枚数 */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e8f5e9",
                  background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
                  最多発行枚数
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
                  {stats.maxPrintCard?.total_print?.toLocaleString() || '-'}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {stats.maxPrintCard?.player?.full_name || stats.maxPrintCard?.title || '-'}
                </Typography>
              </Paper>

              {/* 最少発行枚数 */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e8f5e9",
                  background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
                  最少発行枚数
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
                  {stats.minPrintCard?.total_print?.toLocaleString() || '-'}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {stats.minPrintCard?.player?.full_name || stats.minPrintCard?.title || '-'}
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}

        {/* データテーブル */}
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              カード一覧
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              全{toppsCards.length}件のカードデータ
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#2e7d32' }} />
            </Box>
          ) : toppsCards.length > 0 ? (
            <Paper
              elevation={0}
              sx={{
                height: 700,
                width: '100%',
                borderRadius: 3,
                border: '1px solid #e8f5e9',
                '& .data-grid-header': {
                  backgroundColor: '#f1f8f4',
                  color: '#1a472a',
                  fontWeight: 700,
                },
                '& .MuiDataGrid-root': {
                  border: 'none',
                },
              }}
            >
              <DataGrid
                rows={toppsCards}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                  sorting: {
                    sortModel: [{ field: 'created_at', sort: 'desc' }],
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: {
                      debounceMs: 500,
                      placeholder: 'カード番号、選手名、チーム、タイトルで検索...',
                    },
                  },
                }}
                disableRowSelectionOnClick
                disableColumnFilter={false}
                disableColumnSelector={false}
                disableDensitySelector={false}
                sx={{
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fdf9',
                  },
                }}
              />
            </Paper>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                カードデータがありません
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                スクレイピングコマンドを実行してカードデータを取得してください
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
    </MLBLayout>
  );
}
