"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import MLBLayout from "@/components/MLBLayout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import type { TeamStanding, DivisionStandings } from "@/lib/types";

// Division ID to name mapping
const DIVISION_NAMES: { [key: number]: string } = {
  200: "American League West",
  201: "American League East",
  202: "American League Central",
  203: "National League West",
  204: "National League East",
  205: "National League Central",
};

export default function StatsPage() {
  const [standings, setStandings] = useState<DivisionStandings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<"AL" | "NL">("AL");
  const [selectedSeason, setSelectedSeason] = useState<number>(2024);

  useEffect(() => {
    fetchStandings();
  }, [selectedSeason]);

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${selectedSeason}&standingsTypes=regularSeason`
      );

      if (response.ok) {
        const data = await response.json();
        // Add division names to the records
        const recordsWithNames = data.records.map((record: any) => ({
          ...record,
          division: {
            ...record.division,
            name: DIVISION_NAMES[record.division.id] || `Division ${record.division.id}`,
          },
        }));
        setStandings(recordsWithNames);
      } else {
        console.error("API response not OK:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch standings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueChange = (_event: React.SyntheticEvent, newValue: "AL" | "NL") => {
    setSelectedLeague(newValue);
  };

  const handleSeasonChange = (event: any) => {
    setSelectedSeason(event.target.value);
  };

  const filteredStandings = standings.filter((division) => {
    if (!division.division || !division.division.name) return false;
    return division.division.name.includes(selectedLeague === "AL" ? "American" : "National");
  });

  return (
    <MLBLayout activePath="/stats">
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
            icon={<TrendingUpIcon sx={{ color: "white !important" }} />}
            label="MLB Statistics"
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
            MLB順位表
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: 600, lineHeight: 1.8 }}>
            MLB公式APIから取得したレギュラーシーズンの順位情報
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        ) : (
          <>
            {/* シーズン選択とリーグ切り替えタブ */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="season-select-label">シーズン</InputLabel>
                <Select
                  labelId="season-select-label"
                  id="season-select"
                  value={selectedSeason}
                  label="シーズン"
                  onChange={handleSeasonChange}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e7d32",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1a472a",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#2e7d32",
                    },
                  }}
                >
                  <MenuItem value={2023}>2023年</MenuItem>
                  <MenuItem value={2024}>2024年</MenuItem>
                  <MenuItem value={2025}>2025年</MenuItem>
                </Select>
              </FormControl>

              <Tabs
                value={selectedLeague}
                onChange={handleLeagueChange}
                sx={{
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    fontSize: "1rem",
                  },
                  "& .Mui-selected": {
                    color: "#2e7d32 !important",
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#2e7d32",
                  },
                }}
              >
                <Tab label="アメリカンリーグ" value="AL" />
                <Tab label="ナショナルリーグ" value="NL" />
              </Tabs>
            </Box>

            {/* 地区別順位表 */}
            {filteredStandings.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="h6" sx={{ color: "text.secondary", mb: 2 }}>
                  データが取得できませんでした
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  オフシーズン中はデータが表示されない場合があります
                </Typography>
              </Box>
            ) : (
              filteredStandings.map((division) => (
              <Box key={division.division.id} sx={{ mb: 6 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: "#1a472a",
                  }}
                >
                  {division.division.name}
                </Typography>

                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid #e8f5e9",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                        <TableCell sx={{ fontWeight: 700, color: "#1a472a" }}>順位</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#1a472a" }}>チーム</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          勝
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          敗
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          勝率
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          GB
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          連勝/連敗
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          得点
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: "#1a472a" }}>
                          失点
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {division.teamRecords.map((team) => (
                        <TableRow
                          key={team.team.id}
                          sx={{
                            "&:hover": { bgcolor: "#f8fdf9" },
                            bgcolor: team.divisionRank === "1" ? "#e8f5e9" : "white",
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{team.divisionRank}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{team.team.name}</TableCell>
                          <TableCell align="center">{team.leagueRecord.wins}</TableCell>
                          <TableCell align="center">{team.leagueRecord.losses}</TableCell>
                          <TableCell align="center">{team.leagueRecord.pct}</TableCell>
                          <TableCell align="center">{team.gamesBack === "0.0" ? "-" : team.gamesBack}</TableCell>
                          <TableCell align="center">{team.streak.streakCode}</TableCell>
                          <TableCell align="center">{team.runsScored}</TableCell>
                          <TableCell align="center">{team.runsAllowed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              ))
            )}
          </>
        )}
      </Container>
    </MLBLayout>
  );
}
