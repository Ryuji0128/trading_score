"use client";

import { useState, useEffect, useMemo, useCallback, SyntheticEvent, MouseEvent } from "react";
import { Box, Container, Typography, Chip, Paper, CircularProgress, Link, Switch, FormControlLabel, Snackbar, Alert, Tabs, Tab } from "@mui/material";
import { DataGrid, GridColDef, GridToolbar, useGridApiRef } from "@mui/x-data-grid";
import MLBLayout from "@/components/MLBLayout";
import StyleIcon from "@mui/icons-material/Style";
import EditIcon from "@mui/icons-material/Edit";

interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
  nickname: string;
  primary_color: string;
  mlb_team_id: number | null;
}

interface ToppsCard {
  id: number;
  card_number: string;
  player: {
    id: number;
    full_name: string;
    mlb_player_id: number | null;
    nationality: string | null;
    wbc_years: string;
    wbc_country: string;
  } | null;
  team: Team | null;
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [filteredRowCount, setFilteredRowCount] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [rankingTab, setRankingTab] = useState(0);
  const apiRef = useGridApiRef();

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

  // チーム一覧を取得
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams/');
        if (response.ok) {
          const data = await response.json();
          setTeams(data.results || data);
        }
      } catch (error) {
        console.error('Failed to fetch teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const isSuperuser = user?.is_superuser ?? false;

  // カード更新処理
  const handleProcessRowUpdate = useCallback(async (newRow: ToppsCard, oldRow: ToppsCard) => {
    console.log('=== handleProcessRowUpdate called ===');
    console.log('newRow:', newRow);
    console.log('oldRow:', oldRow);

    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('認証が必要です');
    }

    // release_dateがDateオブジェクトの場合は文字列に変換
    let releaseDate = newRow.release_date;
    if (releaseDate && typeof releaseDate === 'object' && 'toISOString' in releaseDate) {
      releaseDate = (releaseDate as Date).toISOString().split('T')[0];
    }

    const updateData: Record<string, unknown> = {
      product_url: newRow.product_url,
      product_url_long: newRow.product_url_long,
      release_date: releaseDate,
      total_print: newRow.total_print,
    };

    // team_idが変更された場合は追加
    if (newRow.team?.id !== oldRow.team?.id) {
      updateData.team_id = newRow.team?.id || null;
    }

    console.log('Updating card:', newRow.id, updateData);

    try {
      const response = await fetch(`/api/topps-cards/${newRow.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Update failed:', error);
        throw new Error(error.error || '更新に失敗しました');
      }

      const updatedCard = await response.json();
      console.log('Update response:', updatedCard);
      setSnackbar({ open: true, message: '更新しました', severity: 'success' });

      // 更新されたカードをマージ（ネストされたオブジェクトを保持）
      const mergedCard = {
        ...oldRow,
        product_url: updatedCard.product_url,
        product_url_long: updatedCard.product_url_long,
        release_date: updatedCard.release_date,
        total_print: updatedCard.total_print,
        team: updatedCard.team,
      };

      // ローカルステートを更新
      setToppsCards(prev => prev.map(card => card.id === newRow.id ? mergedCard : card));
      return mergedCard;
    } catch (error) {
      console.error('Update error:', error);
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
      field: 'release_date',
      headerName: '発行日',
      width: 140,
      headerClassName: 'data-grid-header',
      editable: editMode,
      type: 'date',
      valueGetter: (value: string | null) => {
        if (!value) return null;
        // 文字列からDateオブジェクトに変換
        return new Date(value);
      },
      valueSetter: (value: Date | string | null, row: ToppsCard) => {
        if (value instanceof Date) {
          return { ...row, release_date: value.toISOString().split('T')[0] };
        }
        return { ...row, release_date: value };
      },
      renderCell: (params: { row: ToppsCard }) => {
        const releaseDate = params.row.release_date;
        if (!releaseDate) return '-';

        const date = new Date(releaseDate);
        const formattedDate = date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

        // 編集モード時はシンプルに日付表示
        if (editMode) {
          return formattedDate;
        }

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

        const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
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
    {
      field: 'player',
      headerName: '選手名',
      width: 200,
      headerClassName: 'data-grid-header',
      valueGetter: (_value: unknown, row: ToppsCard) => row.player?.full_name || 'Team Set',
      filterable: true,
      renderCell: (params: { row: ToppsCard }) => {
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
      editable: editMode,
      type: editMode ? 'singleSelect' : undefined,
      valueOptions: editMode ? [
        { value: '', label: '-' },
        ...teams.map((t: Team) => ({ value: t.id, label: t.full_name }))
      ] : undefined,
      valueGetter: (_value: unknown, row: ToppsCard) => {
        if (editMode) {
          return row.team?.id || '';
        }
        return row.team?.full_name || '-';
      },
      valueSetter: (value: number | string | null, row: ToppsCard) => {
        if (value === '' || value === null) {
          return { ...row, team: null };
        }
        const selectedTeam = teams.find((t: Team) => t.id === value);
        return { ...row, team: selectedTeam || null };
      },
      renderCell: (params: { row: ToppsCard }) => {
        return params.row.team?.full_name || '-';
      },
      filterable: true,
    },
    // 編集モード時のみURLを編集可能列として追加
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
      field: 'nationality',
      headerName: '国籍',
      width: 100,
      headerClassName: 'data-grid-header',
      valueGetter: (_value: unknown, row: ToppsCard) => row.player?.nationality || '-',
      filterable: true,
    },
    {
      field: 'wbc',
      headerName: 'WBC',
      width: 160,
      headerClassName: 'data-grid-header',
      valueGetter: (_value: unknown, row: ToppsCard) => {
        if (!row.player?.wbc_years) return '';
        return `${row.player.wbc_country} (${row.player.wbc_years})`;
      },
      filterable: true,
      renderCell: (params: { row: ToppsCard }) => {
        const player = params.row.player;
        if (!player?.wbc_years) return '-';
        return (
          <Box sx={{ lineHeight: 1.3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
              {player.wbc_country}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {player.wbc_years}
            </Typography>
          </Box>
        );
      },
    },
  ], [editMode, teams]);

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

  // 選手登場回数ランキング
  const playerRanking = useMemo(() => {
    const playerCounts = new Map<number, { name: string; count: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player) {
        const existing = playerCounts.get(card.player.id);
        if (existing) {
          existing.count += 1;
        } else {
          playerCounts.set(card.player.id, { name: card.player.full_name, count: 1 });
        }
      }
    });

    return Array.from(playerCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [toppsCards]);

  // チーム登場回数ランキング
  const teamRanking = useMemo(() => {
    const teamCounts = new Map<number, { name: string; count: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.team) {
        const existing = teamCounts.get(card.team.id);
        if (existing) {
          existing.count += 1;
        } else {
          teamCounts.set(card.team.id, { name: card.team.full_name, count: 1 });
        }
      }
    });

    return Array.from(teamCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [toppsCards]);

  // 選手ごとの合計発行数ランキング
  const playerTotalPrintRanking = useMemo(() => {
    const playerPrints = new Map<number, { name: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player && card.total_print) {
        const existing = playerPrints.get(card.player.id);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          playerPrints.set(card.player.id, {
            name: card.player.full_name,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(playerPrints.values())
      .sort((a, b) => b.totalPrint - a.totalPrint)
      .slice(0, 10);
  }, [toppsCards]);

  // 選手ごとの1枚あたり平均発行数ランキング
  const playerAvgPrintRanking = useMemo(() => {
    const playerPrints = new Map<number, { name: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player && card.total_print) {
        const existing = playerPrints.get(card.player.id);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          playerPrints.set(card.player.id, {
            name: card.player.full_name,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(playerPrints.values())
      .map(p => ({
        ...p,
        avgPrint: Math.round(p.totalPrint / p.cardCount),
      }))
      .filter(p => p.cardCount >= 2) // 2枚以上のカードがある選手のみ
      .sort((a, b) => b.avgPrint - a.avgPrint)
      .slice(0, 10);
  }, [toppsCards]);

  // チームごとの1枚あたり平均発行数ランキング
  const teamAvgPrintRanking = useMemo(() => {
    const teamPrints = new Map<number, { name: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.team && card.total_print) {
        const existing = teamPrints.get(card.team.id);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          teamPrints.set(card.team.id, {
            name: card.team.full_name,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(teamPrints.values())
      .map(t => ({
        ...t,
        avgPrint: Math.round(t.totalPrint / t.cardCount),
      }))
      .sort((a, b) => b.avgPrint - a.avgPrint)
      .slice(0, 10);
  }, [toppsCards]);

  // 1枚単位の発行数ランキング（最大・最小）
  const cardPrintRanking = useMemo(() => {
    const cardsWithPrint = toppsCards.filter((card: ToppsCard) => card.total_print !== null && card.total_print > 0);

    const sortedByPrint = [...cardsWithPrint].sort((a, b) => (b.total_print || 0) - (a.total_print || 0));

    const maxPrintCards = sortedByPrint.slice(0, 10);
    const minPrintCards = sortedByPrint.slice(-10).reverse();

    return { maxPrintCards, minPrintCards };
  }, [toppsCards]);

  // 国籍別合計発行数ランキング
  const nationalityPrintRanking = useMemo(() => {
    const nationalityPrints = new Map<string, { nationality: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player?.nationality && card.total_print) {
        const nationality = card.player.nationality;
        const existing = nationalityPrints.get(nationality);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          nationalityPrints.set(nationality, {
            nationality,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(nationalityPrints.values())
      .map(n => ({
        ...n,
        avgPrint: Math.round(n.totalPrint / n.cardCount),
      }))
      .sort((a, b) => b.totalPrint - a.totalPrint);
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

            {/* ランキングセクション - タブUI */}
            <Paper
              elevation={0}
              sx={{
                mt: 4,
                borderRadius: 3,
                border: "1px solid #e8f5e9",
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={rankingTab}
                onChange={(_: SyntheticEvent, newValue: number) => setRankingTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  bgcolor: '#f1f8f4',
                  borderBottom: '1px solid #e8f5e9',
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    color: '#1a472a',
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: '#2e7d32',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2e7d32',
                  },
                }}
              >
                <Tab label="選手登場回数" />
                <Tab label="チーム登場回数" />
                <Tab label="国籍別発行数" />
                <Tab label="選手合計発行数" />
                <Tab label="選手1枚平均" />
                <Tab label="チーム1枚平均" />
                <Tab label="最多発行（1枚）" />
                <Tab label="最少発行（1枚）" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {/* 選手登場回数ランキング */}
                {rankingTab === 0 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {playerRanking.map((player: { name: string; count: number }, index: number) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < playerRanking.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                              color: index < 3 ? 'white' : '#1a472a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                            {player.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${player.count}枚`}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                            color: index < 3 ? 'white' : '#1a472a',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* チーム登場回数ランキング */}
                {rankingTab === 1 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {teamRanking.map((team: { name: string; count: number }, index: number) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < teamRanking.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                              color: index < 3 ? 'white' : '#1a472a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                            {team.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${team.count}枚`}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                            color: index < 3 ? 'white' : '#1a472a',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* 国籍別合計発行数ランキング */}
                {rankingTab === 2 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {nationalityPrintRanking.map((item: { nationality: string; totalPrint: number; cardCount: number; avgPrint: number }, index: number) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < nationalityPrintRanking.length - 1 ? '1px solid #fff3e0' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#e65100' : '#fff3e0',
                              color: index < 3 ? 'white' : '#e65100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                              {item.nationality}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.cardCount}枚 / 平均{item.avgPrint.toLocaleString()}枚
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={item.totalPrint.toLocaleString()}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#e65100' : '#fff3e0',
                            color: index < 3 ? 'white' : '#e65100',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* 選手合計発行数ランキング */}
                {rankingTab === 3 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {playerTotalPrintRanking.map((player: { name: string; totalPrint: number; cardCount: number }, index: number) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < playerTotalPrintRanking.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                              color: index < 3 ? 'white' : '#1a472a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                              {player.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {player.cardCount}種類のカード
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={player.totalPrint.toLocaleString()}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                            color: index < 3 ? 'white' : '#1a472a',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* 1枚あたり平均発行数ランキング */}
                {rankingTab === 4 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {playerAvgPrintRanking.map((player: { name: string; totalPrint: number; cardCount: number; avgPrint: number }, index: number) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < playerAvgPrintRanking.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#1565c0' : '#e3f2fd',
                              color: index < 3 ? 'white' : '#1565c0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                              {player.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {player.cardCount}種類 / 合計{player.totalPrint.toLocaleString()}枚
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`${player.avgPrint.toLocaleString()}/枚`}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#1565c0' : '#e3f2fd',
                            color: index < 3 ? 'white' : '#1565c0',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* チーム1枚あたり平均発行数ランキング */}
                {rankingTab === 5 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {teamAvgPrintRanking.map((team: { name: string; totalPrint: number; cardCount: number; avgPrint: number }, index: number) => (
                      <Box
                        component="li"
                        key={index}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < teamAvgPrintRanking.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#7b1fa2' : '#f3e5f5',
                              color: index < 3 ? 'white' : '#7b1fa2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                              {team.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {team.cardCount}種類 / 合計{team.totalPrint.toLocaleString()}枚
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`${team.avgPrint.toLocaleString()}/枚`}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#7b1fa2' : '#f3e5f5',
                            color: index < 3 ? 'white' : '#7b1fa2',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* 1枚単位 最多発行数ランキング */}
                {rankingTab === 6 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {cardPrintRanking.maxPrintCards.map((card: ToppsCard, index: number) => (
                      <Box
                        component="li"
                        key={card.id}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < cardPrintRanking.maxPrintCards.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                              color: index < 3 ? 'white' : '#1a472a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                              {card.player?.full_name || 'Team Set'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              #{card.card_number}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={card.total_print?.toLocaleString()}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#2e7d32' : '#e8f5e9',
                            color: index < 3 ? 'white' : '#1a472a',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* 1枚単位 最少発行数ランキング */}
                {rankingTab === 7 && (
                  <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                    {cardPrintRanking.minPrintCards.map((card: ToppsCard, index: number) => (
                      <Box
                        component="li"
                        key={card.id}
                        sx={{
                          py: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < cardPrintRanking.minPrintCards.length - 1 ? '1px solid #e8f5e9' : 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              bgcolor: index < 3 ? '#d32f2f' : '#ffebee',
                              color: index < 3 ? 'white' : '#c62828',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
                              {card.player?.full_name || 'Team Set'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              #{card.card_number}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={card.total_print?.toLocaleString()}
                          size="small"
                          sx={{
                            bgcolor: index < 3 ? '#d32f2f' : '#ffebee',
                            color: index < 3 ? 'white' : '#c62828',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Paper>
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
                {filteredRowCount !== null && filteredRowCount !== toppsCards.length
                  ? `${filteredRowCount}件 / 全${toppsCards.length}件のカードデータ`
                  : `全${toppsCards.length}件のカードデータ`}
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
                apiRef={apiRef}
                rows={toppsCards}
                columns={columns}
                editMode="cell"
                processRowUpdate={handleProcessRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                onFilterModelChange={() => {
                  // フィルタが変更された時に行数を更新
                  setTimeout(() => {
                    // フィルタ後の表示行数を取得
                    const filteredRows = apiRef.current?.getRowModels?.();
                    if (filteredRows) {
                      // フィルタリング後の実際の行数
                      let count = 0;
                      const lookup = apiRef.current?.state?.filter?.filteredRowsLookup;
                      if (lookup) {
                        count = Object.values(lookup).filter(v => v).length;
                      } else {
                        count = filteredRows.size;
                      }
                      setFilteredRowCount(count);
                    }
                  }, 50);
                }}
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
