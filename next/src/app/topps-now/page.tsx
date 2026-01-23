"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Container, Typography, Paper, CircularProgress, Switch, FormControlLabel, Snackbar, Alert } from "@mui/material";
import { DataGrid, GridToolbar, useGridApiRef } from "@mui/x-data-grid";
import MLBLayout from "@/components/MLBLayout";
import EditIcon from "@mui/icons-material/Edit";
import type { Team, ToppsCard, User } from "@/lib/types";
import { getColumns } from "./columns";
import { useToppsRankings } from "./hooks/useToppsRankings";
import ToppsHeroSection from "./components/ToppsHeroSection";
import ToppsStatCards from "./components/ToppsStatCards";
import ToppsRankings from "./components/ToppsRankings";

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
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('認証が必要です');
    }

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

    if (newRow.team?.id !== oldRow.team?.id) {
      updateData.team_id = newRow.team?.id || null;
    }

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
        throw new Error(error.error || '更新に失敗しました');
      }

      const updatedCard = await response.json();
      setSnackbar({ open: true, message: '更新しました', severity: 'success' });

      const mergedCard = {
        ...oldRow,
        product_url: updatedCard.product_url,
        product_url_long: updatedCard.product_url_long,
        release_date: updatedCard.release_date,
        total_print: updatedCard.total_print,
        team: updatedCard.team,
      };

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

  const columns = useMemo(() => getColumns(editMode, teams), [editMode, teams]);

  const {
    stats,
    playerRanking,
    teamRanking,
    playerTotalPrintRanking,
    playerAvgPrintRanking,
    teamAvgPrintRanking,
    cardPrintRanking,
    nationalityPrintRanking,
  } = useToppsRankings(toppsCards);

  return (
    <MLBLayout activePath="/topps-now">
      <ToppsHeroSection />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {stats && (
          <Box sx={{ mb: 6 }}>
            <ToppsStatCards stats={stats} />
            <ToppsRankings
              rankingTab={rankingTab}
              onTabChange={setRankingTab}
              playerRanking={playerRanking}
              teamRanking={teamRanking}
              nationalityPrintRanking={nationalityPrintRanking}
              playerTotalPrintRanking={playerTotalPrintRanking}
              playerAvgPrintRanking={playerAvgPrintRanking}
              teamAvgPrintRanking={teamAvgPrintRanking}
              cardPrintRanking={cardPrintRanking}
            />
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
                  setTimeout(() => {
                    const filteredRows = apiRef.current?.getRowModels?.();
                    if (filteredRows) {
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
