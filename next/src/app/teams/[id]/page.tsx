"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";

interface TeamInfo {
  id: number;
  name: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  division: {
    id: number;
    name: string;
  };
  league: {
    id: number;
    name: string;
  };
  venue: {
    name: string;
  };
}

interface Player {
  person: {
    id: number;
    fullName: string;
  };
  jerseyNumber?: string;
  position: {
    code: string;
    name: string;
    type: string;
  };
}

interface TeamStats {
  wins: number;
  losses: number;
  winningPercentage: string;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [roster, setRoster] = useState<Player[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // チーム情報を取得
      const teamResponse = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${teamId}`
      );

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeam(teamData.teams[0]);
      }

      // ロースター（選手一覧）を取得
      const rosterResponse = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/Active`
      );

      if (rosterResponse.ok) {
        const rosterData = await rosterResponse.json();
        setRoster(rosterData.roster || []);
      }

      // チーム成績を取得（2024年シーズン）
      const statsResponse = await fetch(
        `https://statsapi.mlb.com/api/v1/teams/${teamId}?hydrate=record(season=2024)`
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const record = statsData.teams[0]?.record?.records?.[0];
        if (record) {
          setStats({
            wins: record.wins,
            losses: record.losses,
            winningPercentage: record.winningPercentage,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupPlayersByPosition = (players: Player[]) => {
    const pitchers = players.filter(p => p.position.type === 'Pitcher');
    const catchers = players.filter(p => p.position.code === 'C');
    const infielders = players.filter(p =>
      ['1B', '2B', '3B', 'SS'].includes(p.position.code)
    );
    const outfielders = players.filter(p =>
      ['LF', 'CF', 'RF', 'OF'].includes(p.position.code)
    );
    const dh = players.filter(p => p.position.code === 'DH');

    return { pitchers, catchers, infielders, outfielders, dh };
  };

  const groupedPlayers = roster.length > 0 ? groupPlayersByPosition(roster) : null;

  if (loading) {
    return (
      <MLBLayout activePath="/teams">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        </Container>
      </MLBLayout>
    );
  }

  if (!team) {
    return (
      <MLBLayout activePath="/teams">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Typography variant="h5" sx={{ textAlign: "center", color: "text.secondary" }}>
            チーム情報が見つかりませんでした
          </Typography>
        </Container>
      </MLBLayout>
    );
  }

  return (
    <MLBLayout activePath="/teams">
      {/* ヘッダー */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 4, md: 6 },
          px: 3,
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/teams')}
            sx={{
              color: "white",
              mb: 2,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            チーム一覧に戻る
          </Button>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "white",
                color: "#2e7d32",
                fontSize: "1.5rem",
                fontWeight: 700,
                mr: 3,
              }}
            >
              {team.abbreviation}
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                {team.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  label={team.division.name}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={team.venue.name}
                  icon={<SportsBaseballIcon sx={{ color: "white !important" }} />}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* チーム成績 */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: "#e8f5e9" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                    {stats.wins}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    勝利
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: "#ffebee" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#c62828" }}>
                    {stats.losses}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    敗北
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ bgcolor: "#f5f5f5" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: "#424242" }}>
                    {stats.winningPercentage}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    勝率
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* 選手一覧 */}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#1a472a" }}>
          ロースター
        </Typography>

        {groupedPlayers && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* 投手 */}
            {groupedPlayers.pitchers.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
                  投手 ({groupedPlayers.pitchers.length}名)
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700 }}>背番号</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>選手名</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>ポジション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedPlayers.pitchers.map((player) => (
                        <TableRow key={player.person.id} hover>
                          <TableCell>{player.jerseyNumber || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{player.person.fullName}</TableCell>
                          <TableCell>{player.position.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* 捕手 */}
            {groupedPlayers.catchers.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
                  捕手 ({groupedPlayers.catchers.length}名)
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700 }}>背番号</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>選手名</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>ポジション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedPlayers.catchers.map((player) => (
                        <TableRow key={player.person.id} hover>
                          <TableCell>{player.jerseyNumber || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{player.person.fullName}</TableCell>
                          <TableCell>{player.position.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* 内野手 */}
            {groupedPlayers.infielders.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
                  内野手 ({groupedPlayers.infielders.length}名)
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700 }}>背番号</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>選手名</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>ポジション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedPlayers.infielders.map((player) => (
                        <TableRow key={player.person.id} hover>
                          <TableCell>{player.jerseyNumber || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{player.person.fullName}</TableCell>
                          <TableCell>{player.position.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* 外野手 */}
            {groupedPlayers.outfielders.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
                  外野手 ({groupedPlayers.outfielders.length}名)
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700 }}>背番号</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>選手名</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>ポジション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedPlayers.outfielders.map((player) => (
                        <TableRow key={player.person.id} hover>
                          <TableCell>{player.jerseyNumber || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{player.person.fullName}</TableCell>
                          <TableCell>{player.position.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* 指名打者 */}
            {groupedPlayers.dh.length > 0 && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: "#2e7d32" }}>
                  指名打者 ({groupedPlayers.dh.length}名)
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700 }}>背番号</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>選手名</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>ポジション</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupedPlayers.dh.map((player) => (
                        <TableRow key={player.person.id} hover>
                          <TableCell>{player.jerseyNumber || '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{player.person.fullName}</TableCell>
                          <TableCell>{player.position.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </MLBLayout>
  );
}
