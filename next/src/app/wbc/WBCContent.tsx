"use client";

import { useState, useMemo } from "react";
import {
  Box, Container, Typography, Tabs, Tab, Paper, Chip,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, IconButton, Link
} from "@mui/material";
import useSWR from "swr";
import CloseIcon from "@mui/icons-material/Close";
import MLBLayout from "@/components/MLBLayout";
import PublicIcon from "@mui/icons-material/Public";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import type { WBCTournament, WBCGame, WBCTournamentDetail, WBCRosterEntry, PlayerCard } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";

export default function WBCContent() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [subTab, setSubTab] = useState(0); // 0: 試合結果, 1: 出場選手
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardDialogPlayer, setCardDialogPlayer] = useState<string>("");
  const [playerCards, setPlayerCards] = useState<PlayerCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // トーナメント一覧取得
  const { data: tournaments = [], isLoading: loading } = useSWR<WBCTournament[]>(
    '/api/wbc-tournaments/',
    fetcher,
    { revalidateOnFocus: false }
  );

  const selectedTournamentId = tournaments[selectedTab]?.id;

  // 選択されたトーナメントの詳細
  const { data: tournamentDetail, isLoading: detailLoading } = useSWR<WBCTournamentDetail>(
    selectedTournamentId ? `/api/wbc-tournaments/${selectedTournamentId}/` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  // 選択されたトーナメントのロスター
  const { data: roster = [] } = useSWR<WBCRosterEntry[]>(
    selectedTournamentId ? `/api/wbc-tournaments/${selectedTournamentId}/roster/` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handlePlayerClick = (playerName: string) => {
    setCardDialogPlayer(playerName);
    setCardDialogOpen(true);
    setCardsLoading(true);
    fetch(`/api/topps-cards/?player=${encodeURIComponent(playerName)}`)
      .then(res => res.json())
      .then(data => {
        setPlayerCards(data);
        setCardsLoading(false);
      })
      .catch(() => {
        setPlayerCards([]);
        setCardsLoading(false);
      });
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    setSubTab(0);
  };

  const selectedTournament = tournaments[selectedTab] || null;

  // 国別にロスターをグルーピング
  const rosterByCountry = useMemo(() => {
    const grouped: Record<string, WBCRosterEntry[]> = {};
    roster.forEach(entry => {
      if (!grouped[entry.country]) {
        grouped[entry.country] = [];
      }
      grouped[entry.country].push(entry);
    });
    // 国名でソート
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [roster]);

  // 試合を日付でグルーピング
  const gamesByDate = useMemo(() => {
    if (!tournamentDetail) return [];
    const grouped: Record<string, WBCGame[]> = {};
    tournamentDetail.games.forEach(game => {
      const date = game.game_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(game);
    });
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tournamentDetail]);

  if (loading) {
    return (
      <MLBLayout activePath="/wbc">
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      </MLBLayout>
    );
  }

  return (
    <MLBLayout activePath="/wbc">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)",
            color: "white",
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <PublicIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                World Baseball Classic
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              WBC各大会のトーナメント結果と出場メンバー
            </Typography>
          </Box>
          <SportsCricketIcon
            sx={{
              position: "absolute",
              right: -20,
              bottom: -20,
              fontSize: 200,
              opacity: 0.08,
            }}
          />
        </Paper>

        {/* Year Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                fontSize: "1rem",
                minWidth: 100,
              },
              "& .Mui-selected": {
                color: "#1a237e",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#1a237e",
                height: 3,
              },
            }}
          >
            {tournaments.map(t => (
              <Tab key={t.id} label={`${t.year}`} />
            ))}
          </Tabs>
        </Paper>

        {/* Tournament Info */}
        {selectedTournament && (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedTournament.champion}
                </Typography>
              </Box>
              <Chip label="優勝" size="small" sx={{ bgcolor: "#ffd700", color: "#000", fontWeight: 700 }} />
              <Typography variant="body2" sx={{ color: "text.secondary" }}>vs</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {selectedTournament.runner_up}
              </Typography>
              <Chip label="準優勝" size="small" sx={{ bgcolor: "#c0c0c0", color: "#000", fontWeight: 600 }} />
              <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
                <Chip label={`${selectedTournament.game_count} 試合`} variant="outlined" />
                <Chip label={`${selectedTournament.country_count} ヶ国`} variant="outlined" />
              </Box>
            </Box>
          </Paper>
        )}

        {/* Sub Tabs: 試合結果 / 出場選手 */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={subTab}
            onChange={(_, v) => setSubTab(v)}
            sx={{
              "& .MuiTab-root": { fontWeight: 600 },
              "& .MuiTabs-indicator": { backgroundColor: "#0d47a1" },
            }}
          >
            <Tab label="試合結果" />
            <Tab label="出場選手" />
          </Tabs>
        </Paper>

        {/* Content */}
        {detailLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : subTab === 0 ? (
          // 試合結果
          <Box>
            {gamesByDate.map(([date, games]) => (
              <Paper key={date} sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ bgcolor: "#e3f2fd", px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a237e" }}>
                    {new Date(date + 'T00:00:00').toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {games.map(game => {
                        const awayWin = (game.away_score ?? 0) > (game.home_score ?? 0);
                        const homeWin = (game.home_score ?? 0) > (game.away_score ?? 0);
                        return (
                          <TableRow key={game.id}>
                            <TableCell sx={{ width: "35%", textAlign: "right", fontWeight: awayWin ? 700 : 400 }}>
                              {game.away_team}
                            </TableCell>
                            <TableCell sx={{ width: "10%", textAlign: "center", fontWeight: awayWin ? 700 : 400 }}>
                              {game.away_score ?? "-"}
                            </TableCell>
                            <TableCell sx={{ width: "10%", textAlign: "center", color: "text.secondary" }}>
                              -
                            </TableCell>
                            <TableCell sx={{ width: "10%", textAlign: "center", fontWeight: homeWin ? 700 : 400 }}>
                              {game.home_score ?? "-"}
                            </TableCell>
                            <TableCell sx={{ width: "35%", fontWeight: homeWin ? 700 : 400 }}>
                              {game.home_team}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
            {gamesByDate.length === 0 && (
              <Typography sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                試合データがありません
              </Typography>
            )}
          </Box>
        ) : (
          // 出場選手
          <Box>
            {rosterByCountry.map(([country, players]) => (
              <Accordion key={country} defaultExpanded={country === selectedTournament?.champion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{country}</Typography>
                    <Chip label={`${players.length}名`} size="small" variant="outlined" />
                    {country === selectedTournament?.champion && (
                      <EmojiEventsIcon sx={{ color: "#ffd700", fontSize: 20 }} />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>選手名</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Topps NOW</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {players.map(player => (
                          <TableRow key={player.id} hover={player.has_topps_card}>
                            <TableCell>
                              {player.has_topps_card ? (
                                <Link
                                  component="button"
                                  onClick={() => handlePlayerClick(player.player_name)}
                                  sx={{ fontWeight: 600, cursor: "pointer", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                >
                                  {player.player_name}
                                </Link>
                              ) : (
                                player.player_name
                              )}
                            </TableCell>
                            <TableCell>
                              {player.has_topps_card ? (
                                <Chip
                                  label="カードあり"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  onClick={() => handlePlayerClick(player.player_name)}
                                  sx={{ cursor: "pointer" }}
                                />
                              ) : (
                                <Typography variant="caption" sx={{ color: "text.disabled" }}>-</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
            {rosterByCountry.length === 0 && (
              <Typography sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                ロスターデータがありません
              </Typography>
            )}
          </Box>
        )}
        {/* Player Cards Dialog */}
        <Dialog
          open={cardDialogOpen}
          onClose={() => setCardDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
              {cardDialogPlayer} - Topps NOW
            </Box>
            <IconButton onClick={() => setCardDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {cardsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : playerCards.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>タイトル</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>発行枚数</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>発行日</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {playerCards.map(card => (
                      <TableRow key={card.id}>
                        <TableCell>{card.card_number}</TableCell>
                        <TableCell>
                          {card.product_url ? (
                            <Link href={card.product_url} target="_blank" rel="noopener noreferrer">
                              {card.title}
                            </Link>
                          ) : (
                            card.title
                          )}
                        </TableCell>
                        <TableCell>
                          {card.total_print ? card.total_print.toLocaleString() : "-"}
                        </TableCell>
                        <TableCell>
                          {card.release_date || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
                カードが見つかりません
              </Typography>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </MLBLayout>
  );
}
