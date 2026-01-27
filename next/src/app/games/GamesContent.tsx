"use client";

import { useMemo } from "react";
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
import useSWR from "swr";
import MLBLayout from "@/components/MLBLayout";
import SportsIcon from "@mui/icons-material/Sports";
import type { Game } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import { formatDateShort } from "@/lib/utils";
import { MLB_API_BASE, DISPLAY_LIMITS } from "@/lib/constants";

const STATUS_MAP: Record<string, string> = {
  Final: "試合終了",
  "In Progress": "試合中",
  Scheduled: "予定",
  Postponed: "延期",
};

export default function GamesContent() {
  const swrKey = useMemo(() => {
    const today = new Date();
    const endDate = today.toISOString().split("T")[0];
    const start = new Date();
    start.setDate(start.getDate() - DISPLAY_LIMITS.GAMES_DAYS_RANGE);
    const startDate = start.toISOString().split("T")[0];
    return `${MLB_API_BASE}/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}`;
  }, []);

  const { data, isLoading } = useSWR(swrKey, fetcher, { revalidateOnFocus: false });

  const recentGames: Game[] = useMemo(() => {
    if (!data) return [];
    const allGames = data.dates?.flatMap((date: { games: Game[] }) => date.games) || [];
    return allGames.slice(0, 20);
  }, [data]);

  const formatGameDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${formatDateShort(dateString)} ${date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <MLBLayout activePath="/games">
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
            top: 0, right: 0, bottom: 0, left: 0,
            background: "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M50 0 L60 40 L100 40 L68 62 L80 100 L50 76 L20 100 L32 62 L0 40 L40 40 Z\" fill=\"%23ffffff\" fill-opacity=\"0.03\"/%3E%3C/svg%3E')",
            backgroundSize: "80px 80px",
          },
        }}
      >
        <Container maxWidth="lg">
          <Chip
            icon={<SportsIcon sx={{ color: "white !important" }} />}
            label="MLB Games"
            size="small"
            sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, borderRadius: 2 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            最近の試合結果
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            直近{DISPLAY_LIMITS.GAMES_DAYS_RANGE}日間の試合スコア
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {isLoading ? (
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
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Chip
                        label={STATUS_MAP[game.status.detailedState] || game.status.detailedState}
                        size="small"
                        sx={{
                          bgcolor: game.status.detailedState === "Final" ? "#e8f5e9" : "#fff3e0",
                          color: game.status.detailedState === "Final" ? "#2e7d32" : "#f57c00",
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatGameDateTime(game.gameDate)}
                      </Typography>
                    </Box>

                    {/* Away Team */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{ flex: 1, fontWeight: game.teams.away.isWinner ? 700 : 400, color: game.teams.away.isWinner ? "#2e7d32" : "text.primary" }}
                      >
                        {game.teams.away.team.name}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mx: 2, color: game.teams.away.isWinner ? "#2e7d32" : "text.secondary" }}>
                        {game.teams.away.score ?? "-"}
                      </Typography>
                    </Box>

                    {/* Home Team */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{ flex: 1, fontWeight: game.teams.home.isWinner ? 700 : 400, color: game.teams.home.isWinner ? "#2e7d32" : "text.primary" }}
                      >
                        {game.teams.home.team.name}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, mx: 2, color: game.teams.home.isWinner ? "#2e7d32" : "text.secondary" }}>
                        {game.teams.home.score ?? "-"}
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
