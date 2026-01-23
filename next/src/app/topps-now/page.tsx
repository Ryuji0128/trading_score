"use client";

import { useState, useMemo, useCallback } from "react";
import { Box, Container, Snackbar, Alert } from "@mui/material";
import useSWR from "swr";
import dynamic from "next/dynamic";
import MLBLayout from "@/components/MLBLayout";
import type { Team, ToppsCard, User } from "@/lib/types";
import { fetcher, authFetcher } from "@/lib/fetcher";
import { getColumns } from "./columns";
import { useToppsRankings } from "./hooks/useToppsRankings";
import ToppsHeroSection from "./components/ToppsHeroSection";
import ToppsStatCards from "./components/ToppsStatCards";
import ToppsRankings from "./components/ToppsRankings";

const ToppsDataGrid = dynamic(() => import("./components/ToppsDataGrid"), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Box sx={{ width: 40, height: 40, border: '4px solid #e8f5e9', borderTop: '4px solid #2e7d32', borderRadius: '50%', animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
    </Box>
  ),
});

export default function ToppsNowPage() {
  const [editMode, setEditMode] = useState(false);
  const [filteredRowCount, setFilteredRowCount] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [rankingTab, setRankingTab] = useState(0);

  const { data: user } = useSWR<User | null>('/api/auth/me/', authFetcher, {
    revalidateOnFocus: false,
  });
  const { data: cardsData, isLoading: loading, mutate: mutateCards } = useSWR('/api/topps-cards/', fetcher, {
    revalidateOnFocus: false,
  });
  const { data: teamsData } = useSWR('/api/teams/', fetcher, {
    revalidateOnFocus: false,
  });

  const toppsCards: ToppsCard[] = useMemo(() => {
    if (!cardsData) return [];
    return cardsData.results || cardsData;
  }, [cardsData]);

  const teams: Team[] = useMemo(() => {
    if (!teamsData) return [];
    return teamsData.results || teamsData;
  }, [teamsData]);

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

      mutateCards((current: ToppsCard[] | { results: ToppsCard[] }) => {
        const list = Array.isArray(current) ? current : current?.results || [];
        const updated = list.map((card: ToppsCard) => card.id === newRow.id ? mergedCard : card);
        return Array.isArray(current) ? updated : { ...current, results: updated };
      }, false);
      return mergedCard;
    } catch (error) {
      setSnackbar({ open: true, message: error instanceof Error ? error.message : '更新に失敗しました', severity: 'error' });
      throw error;
    }
  }, [mutateCards]);

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

        <ToppsDataGrid
          toppsCards={toppsCards}
          columns={columns}
          loading={loading}
          editMode={editMode}
          setEditMode={setEditMode}
          isSuperuser={isSuperuser}
          onProcessRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onFilteredRowCountChange={setFilteredRowCount}
          filteredRowCount={filteredRowCount}
        />
      </Container>

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
