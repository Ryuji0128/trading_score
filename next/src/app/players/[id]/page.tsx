"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Breadcrumbs,
  Link as MuiLink,
  Button,
} from "@mui/material";
import Link from "next/link";
import MLBLayout from "@/components/MLBLayout";
import PersonIcon from "@mui/icons-material/Person";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface PlayerStats {
  id: number;
  season: number;
  stat_type: "hitting" | "pitching";
  // 打撃成績
  games: number | null;
  at_bats: number | null;
  runs: number | null;
  hits: number | null;
  doubles: number | null;
  triples: number | null;
  home_runs: number | null;
  rbi: number | null;
  stolen_bases: number | null;
  batting_avg: string | null;
  obp: string | null;
  slg: string | null;
  ops: string | null;
  // 投球成績
  wins: number | null;
  losses: number | null;
  era: string | null;
  games_pitched: number | null;
  games_started: number | null;
  saves: number | null;
  innings_pitched: string | null;
  strikeouts: number | null;
  walks_allowed: number | null;
  whip: string | null;
}

interface Player {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: string;
  mlb_player_id: number | null;
  team: {
    id: number;
    full_name: string;
    abbreviation: string;
    primary_color: string;
  } | null;
  stats: PlayerStats[];
}

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params.id as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await fetch(`/api/players/${playerId}/`);
        if (response.ok) {
          const data = await response.json();
          setPlayer(data);
        } else {
          setError("選手が見つかりません");
        }
      } catch (err) {
        console.error("Failed to fetch player:", err);
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayer();
    }
  }, [playerId]);

  const hittingStats = player?.stats.filter((s) => s.stat_type === "hitting") || [];
  const pitchingStats = player?.stats.filter((s) => s.stat_type === "pitching") || [];

  // MLB公式選手ページのURL生成
  const getMlbPlayerUrl = (player: Player): string | null => {
    if (!player.mlb_player_id) return null;
    const nameSlug = `${player.first_name}-${player.last_name}`.toLowerCase().replace(/\s+/g, "-");
    return `https://www.mlb.com/player/${nameSlug}-${player.mlb_player_id}`;
  };

  const mlbPlayerUrl = player ? getMlbPlayerUrl(player) : null;

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <MLBLayout activePath="/topps-now">
        <Box sx={{ display: "flex", justifyContent: "center", py: 16 }}>
          <CircularProgress sx={{ color: "#2e7d32" }} />
        </Box>
      </MLBLayout>
    );
  }

  if (error || !player) {
    return (
      <MLBLayout activePath="/topps-now">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h5" color="error">
            {error || "選手が見つかりません"}
          </Typography>
        </Container>
      </MLBLayout>
    );
  }

  return (
    <MLBLayout activePath="/topps-now">
      {/* ヒーローセクション */}
      <Box
        sx={{
          background: player.team?.primary_color
            ? `linear-gradient(135deg, ${player.team.primary_color} 0%, ${player.team.primary_color}dd 100%)`
            : "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 4, md: 6 },
          px: 3,
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs
            sx={{
              mb: 2,
              "& .MuiBreadcrumbs-separator": { color: "rgba(255,255,255,0.7)" },
            }}
          >
            <MuiLink
              component={Link}
              href="/topps-now"
              sx={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", "&:hover": { color: "white" } }}
            >
              Topps Now
            </MuiLink>
            <Typography sx={{ color: "white" }}>{player.full_name}</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Chip
              icon={<PersonIcon sx={{ color: "white !important" }} />}
              label="選手成績"
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
            {player.team && (
              <Chip
                label={player.team.abbreviation}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.3)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: "2rem", md: "3rem" } }}>
            {player.full_name}
          </Typography>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", opacity: 0.9 }}>
            {player.jersey_number && (
              <Typography variant="h6">#{player.jersey_number}</Typography>
            )}
            <Typography variant="h6">{player.position}</Typography>
            {player.team && <Typography variant="h6">{player.team.full_name}</Typography>}
          </Box>

          {/* MLB公式リンク */}
          {mlbPlayerUrl && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                href={mlbPlayerUrl}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon />}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                MLB.com で選手情報を見る
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {player.stats.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              border: "1px solid #e8f5e9",
            }}
          >
            <SportsBaseballIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              成績データがありません
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              MLB Stats APIから成績を取得する必要があります
            </Typography>
          </Paper>
        ) : (
          <>
            {/* タブ切り替え */}
            <Box sx={{ mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    color: "#666",
                    "&.Mui-selected": { color: "#2e7d32" },
                  },
                  "& .MuiTabs-indicator": { backgroundColor: "#2e7d32" },
                }}
              >
                {hittingStats.length > 0 && <Tab label="打撃成績" />}
                {pitchingStats.length > 0 && <Tab label="投球成績" />}
              </Tabs>
            </Box>

            {/* 打撃成績テーブル */}
            {activeTab === 0 && hittingStats.length > 0 && (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 3, border: "1px solid #e8f5e9" }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f1f8f4" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#1a472a" }}>シーズン</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>試合</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>打数</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>安打</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>二塁打</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>三塁打</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>本塁打</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>打点</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>盗塁</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>打率</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>出塁率</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>長打率</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>OPS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hittingStats.map((stat) => (
                      <TableRow key={stat.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{stat.season}</TableCell>
                        <TableCell align="right">{stat.games ?? "-"}</TableCell>
                        <TableCell align="right">{stat.at_bats ?? "-"}</TableCell>
                        <TableCell align="right">{stat.hits ?? "-"}</TableCell>
                        <TableCell align="right">{stat.doubles ?? "-"}</TableCell>
                        <TableCell align="right">{stat.triples ?? "-"}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#d32f2f" }}>
                          {stat.home_runs ?? "-"}
                        </TableCell>
                        <TableCell align="right">{stat.rbi ?? "-"}</TableCell>
                        <TableCell align="right">{stat.stolen_bases ?? "-"}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {stat.batting_avg ?? "-"}
                        </TableCell>
                        <TableCell align="right">{stat.obp ?? "-"}</TableCell>
                        <TableCell align="right">{stat.slg ?? "-"}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#1a472a" }}>
                          {stat.ops ?? "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* 投球成績テーブル */}
            {((activeTab === 1 && hittingStats.length > 0) || (activeTab === 0 && hittingStats.length === 0)) &&
              pitchingStats.length > 0 && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ borderRadius: 3, border: "1px solid #e8f5e9" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700, color: "#1a472a" }}>シーズン</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>勝</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>敗</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>防御率</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>登板</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>先発</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>セーブ</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>投球回</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>奪三振</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>四球</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#1a472a" }}>WHIP</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pitchingStats.map((stat) => (
                        <TableRow key={stat.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{stat.season}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#2e7d32" }}>
                            {stat.wins ?? "-"}
                          </TableCell>
                          <TableCell align="right" sx={{ color: "#d32f2f" }}>
                            {stat.losses ?? "-"}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {stat.era ?? "-"}
                          </TableCell>
                          <TableCell align="right">{stat.games_pitched ?? "-"}</TableCell>
                          <TableCell align="right">{stat.games_started ?? "-"}</TableCell>
                          <TableCell align="right">{stat.saves ?? "-"}</TableCell>
                          <TableCell align="right">{stat.innings_pitched ?? "-"}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: "#1a472a" }}>
                            {stat.strikeouts ?? "-"}
                          </TableCell>
                          <TableCell align="right">{stat.walks_allowed ?? "-"}</TableCell>
                          <TableCell align="right">{stat.whip ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
          </>
        )}
      </Container>
    </MLBLayout>
  );
}
