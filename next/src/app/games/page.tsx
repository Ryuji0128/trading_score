"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import SportsIcon from "@mui/icons-material/Sports";

interface Game {
  gamePk: number;
  gameDate: string;
  status: {
    detailedState: string;
  };
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      score?: number;
      isWinner?: boolean;
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      score?: number;
      isWinner?: boolean;
    };
  };
}

export default function GamesPage() {
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    setLoading(true);
    try {
      // 最近の試合結果を取得
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];

      const gamesResponse = await fetch(
        `https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}`
      );

      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json();
        const allGames = gamesData.dates?.flatMap((date: any) => date.games) || [];
        setRecentGames(allGames.slice(0, 20));
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatGameStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Final': '試合終了',
      'In Progress': '試合中',
      'Scheduled': '予定',
      'Postponed': '延期',
    };
    return statusMap[status] || status;
  };

  return (
    <MLBLayout activePath="/games">
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
            icon={<SportsIcon sx={{ color: "white !important" }} />}
            label="MLB Games"
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
            最近の試合結果
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            直近7日間の試合スコア
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        ) : recentGames.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
              試合データがありません
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              オフシーズン中は試合が行われていません
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {recentGames.map((game) => (
              <Grid item xs={12} md={6} key={game.gamePk}>
                <Card
                  sx={{
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip
                        label={formatGameStatus(game.status.detailedState)}
                        size="small"
                        sx={{
                          bgcolor: game.status.detailedState === 'Final' ? '#e8f5e9' : '#fff3e0',
                          color: game.status.detailedState === 'Final' ? '#2e7d32' : '#f57c00',
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(game.gameDate)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: game.teams.away.isWinner ? 700 : 400,
                            color: game.teams.away.isWinner ? "#2e7d32" : "text.primary",
                          }}
                        >
                          {game.teams.away.team.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mx: 2,
                          color: game.teams.away.isWinner ? "#2e7d32" : "text.secondary",
                        }}
                      >
                        {game.teams.away.score ?? '-'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: game.teams.home.isWinner ? 700 : 400,
                            color: game.teams.home.isWinner ? "#2e7d32" : "text.primary",
                          }}
                        >
                          {game.teams.home.team.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          mx: 2,
                          color: game.teams.home.isWinner ? "#2e7d32" : "text.secondary",
                        }}
                      >
                        {game.teams.home.score ?? '-'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </MLBLayout>
  );
}
