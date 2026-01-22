"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Container, Typography, Chip, Paper, CircularProgress, Link, Switch, FormControlLabel, Snackbar, Alert } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, GridRowModesModel, GridRowModes, GridEventListener, GridRowEditStopReasons, GridRowId } from "@mui/x-data-grid";
import MLBLayout from "@/components/MLBLayout";
import StyleIcon from "@mui/icons-material/Style";
import EditIcon from "@mui/icons-material/Edit";

interface ToppsCard {
  id: number;
  card_number: string;
  player: {
    id: number;
    full_name: string;
    mlb_player_id: number | null;
  } | null;
  team: {
    full_name: string;
    abbreviation: string;
    nickname: string;
    primary_color: string;
    mlb_team_id: number | null;
  } | null;
  title: string;
  total_print: number | null;
  image_url: string;
  product_url: string;
  product_url_long: string;
  release_date: string | null;
  mlb_game_id: number | null;
  created_at: string;
  topps_set: {
    year: number;
    name: string;
  };
}

interface User {
  id: number;
  email: string;
  is_superuser: boolean;
}

export default function ToppsNowPage() {
  const [toppsCards, setToppsCards] = useState<ToppsCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch('/api/auth/me/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

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

  const isSuperuser = user?.is_superuser ?? false;

  // カード更新処理
  const handleProcessRowUpdate = useCallback(async (newRow: ToppsCard, oldRow: ToppsCard) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('認証が必要です');
    }

    try {
      const response = await fetch(`/api/topps-cards/${newRow.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_url: newRow.product_url,
          product_url_long: newRow.product_url_long,
          release_date: newRow.release_date,
          total_print: newRow.total_print,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新に失敗しました');
      }

      const updatedCard = await response.json();
      setSnackbar({ open: true, message: '更新しました', severity: 'success' });

      // 更新されたカードをマージ（ネストされたオブジェクトを保持）
      const mergedCard = {
        ...oldRow,
        product_url: updatedCard.product_url,
        product_url_long: updatedCard.product_url_long,
        release_date: updatedCard.release_date,
        total_print: updatedCard.total_print,
      };

      // ローカルステートを更新
      setToppsCards(prev => prev.map(card => card.id === newRow.id ? mergedCard : card));
      return mergedCard;
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : '更新に失敗しました', severity: 'error' });
      throw error;
    }
  }, []);

  const handleProcessRowUpdateError = useCallback((error: Error) => {
    setSnackbar({ open: true, message: error.message, severity: 'error' });
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
        // product_url を優先、なければ product_url_long を使用
        const linkUrl = shortUrl || longUrl;

        if (linkUrl) {
          return (
            <Link
              href={linkUrl}
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
      renderCell: (params) => {
        const player = params.row.player;
        if (player && player.mlb_player_id) {
          return (
            <Link
              href={`/players/${player.id}`}
              sx={{
                color: '#1a472a',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#2e7d32',
                },
              }}
            >
              {player.full_name}
            </Link>
          );
        }
        return player?.full_name || 'Team Set';
      },
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
      field: 'total_print',
      headerName: '発行枚数',
      width: 130,
      type: 'number',
      headerClassName: 'data-grid-header',
      editable: editMode,
      valueFormatter: (value: number | null) => value ? value.toLocaleString() : '-',
      filterable: true,
    },
    // 編集モード時のみURLと発行日を編集可能列として追加
    ...(editMode ? [
      {
        field: 'product_url',
        headerName: '商品URL',
        width: 200,
        headerClassName: 'data-grid-header',
        editable: true,
        filterable: false,
      },
      {
        field: 'product_url_long',
        headerName: '商品URL (長)',
        width: 200,
        headerClassName: 'data-grid-header',
        editable: true,
        filterable: false,
      },
    ] as GridColDef[] : []),
    {
      field: 'release_date',
      headerName: '発行日',
      width: 130,
      headerClassName: 'data-grid-header',
      editable: editMode,
      type: editMode ? 'date' : undefined,
      valueGetter: (value) => {
        if (!value) return null;
        if (editMode) {
          return new Date(value);
        }
        return value;
      },
      valueSetter: (value, row) => {
        if (value instanceof Date) {
          return { ...row, release_date: value.toISOString().split('T')[0] };
        }
        return { ...row, release_date: value };
      },
      renderCell: (params) => {
        if (editMode) return null; // 編集モード時はデフォルト表示

        const releaseDate = params.row.release_date;
        if (!releaseDate) return '-';

        const date = new Date(releaseDate);
        const formattedDate = date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

        // mlb_game_idが保存されている場合は直接リンク
        const mlbGameId = params.row.mlb_game_id;
        if (mlbGameId) {
          return (
            <Link
              href={`https://www.mlb.com/gameday/${mlbGameId}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#1a472a',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: '#2e7d32',
                },
              }}
            >
              {formattedDate}
            </Link>
          );
        }

        // mlb_game_idがない場合はAPIを呼び出す
        const gameDate = new Date(date);
        gameDate.setDate(gameDate.getDate() - 1);
        const gameDateStr = gameDate.toISOString().split('T')[0];

        const team = params.row.team;

        const handleClick = async (e: React.MouseEvent) => {
          e.preventDefault();

          if (team?.mlb_team_id) {
            try {
              const response = await fetch(`/api/mlb/game/?team_id=${team.mlb_team_id}&date=${gameDateStr}`);
              if (response.ok) {
                const data = await response.json();
                if (data.game_url) {
                  window.open(data.game_url, '_blank');
                  return;
                }
              }
            } catch (error) {
              console.error('Failed to fetch game ID:', error);
            }
          }

          // フォールバック
          if (team?.nickname) {
            const teamSlug = team.nickname.toLowerCase().replace(/\s+/g, '-');
            window.open(`https://www.mlb.com/${teamSlug}/schedule/${gameDateStr}`, '_blank');
          } else {
            window.open(`https://www.mlb.com/scores/${gameDateStr}`, '_blank');
          }
        };

        return (
          <Link
            href="#"
            onClick={handleClick}
            sx={{
              color: '#1a472a',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
                color: '#2e7d32',
              },
            }}
          >
            {formattedDate}
          </Link>
        );
      },
      filterable: true,
      sortable: true,
    },
  ], [editMode]);

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
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
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
            {isSuperuser && (
              <FormControlLabel
                control={
                  <Switch
                    checked={editMode}
                    onChange={(e) => setEditMode(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2e7d32',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#2e7d32',
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EditIcon fontSize="small" />
                    編集モード
                  </Box>
                }
                sx={{
                  bgcolor: editMode ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  border: editMode ? '1px solid #2e7d32' : '1px solid transparent',
                }}
              />
            )}
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
                editMode="row"
                processRowUpdate={handleProcessRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                  sorting: {
                    sortModel: [{ field: 'card_number', sort: 'asc' }],
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: {
                      debounceMs: 500,
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
                  '& .MuiDataGrid-cell--editing': {
                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
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

      {/* 更新通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MLBLayout>
  );
}
