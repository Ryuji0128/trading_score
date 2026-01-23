"use client";

import { useState, useMemo } from "react";
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
  SelectChangeEvent,
} from "@mui/material";
import useSWR from "swr";
import MLBLayout from "@/components/MLBLayout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import type { DivisionStandings } from "@/lib/types";
import { fetcher } from "@/lib/fetcher";
import { MLB_API_BASE, DIVISION_IDS } from "@/lib/constants";

const DIVISION_NAMES: Record<number, string> = {
  [DIVISION_IDS.AL_WEST]: "American League West",
  [DIVISION_IDS.AL_EAST]: "American League East",
  [DIVISION_IDS.AL_CENTRAL]: "American League Central",
  [DIVISION_IDS.NL_WEST]: "National League West",
  [DIVISION_IDS.NL_EAST]: "National League East",
  [DIVISION_IDS.NL_CENTRAL]: "National League Central",
};

const SEASON_OPTIONS = [2023, 2024, 2025];

export default function StatsPage() {
  const [selectedLeague, setSelectedLeague] = useState<"AL" | "NL">("AL");
  const [selectedSeason, setSelectedSeason] = useState<number>(2024);

  const { data, isLoading } = useSWR(
    `${MLB_API_BASE}/standings?leagueId=103,104&season=${selectedSeason}&standingsTypes=regularSeason`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const standings: DivisionStandings[] = useMemo(() => {
    if (!data?.records) return [];
    return data.records.map((record: DivisionStandings) => ({
      ...record,
      division: {
        ...record.division,
        name: DIVISION_NAMES[record.division.id] || `Division ${record.division.id}`,
      },
    }));
  }, [data]);

  const filteredStandings = useMemo(() => {
    return standings.filter((division) =>
      division.division.name.includes(selectedLeague === "AL" ? "American" : "National")
    );
  }, [standings, selectedLeague]);

  return (
    <MLBLayout activePath="/stats">
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)",
          color: "white",
          py: { xs: 6, md: 10 },
          px: 3,
        }}
      >
        <Container maxWidth="lg">
          <Chip
            icon={<TrendingUpIcon sx={{ color: "white !important" }} />}
            label="MLB Statistics"
            size="small"
            sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, borderRadius: 2 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            MLB順位表
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            レギュラーシーズンの順位情報
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        ) : (
          <>
            {/* シーズン選択とリーグ切り替え */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="season-select-label">シーズン</InputLabel>
                <Select
                  labelId="season-select-label"
                  value={selectedSeason}
                  label="シーズン"
                  onChange={(e: SelectChangeEvent<number>) => setSelectedSeason(e.target.value as number)}
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2e7d32" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#1a472a" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#2e7d32" },
                  }}
                >
                  {SEASON_OPTIONS.map((year) => (
                    <MenuItem key={year} value={year}>{year}年</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Tabs
                value={selectedLeague}
                onChange={(_e, v: "AL" | "NL") => setSelectedLeague(v)}
                sx={{
                  "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem" },
                  "& .Mui-selected": { color: "#2e7d32 !important" },
                  "& .MuiTabs-indicator": { backgroundColor: "#2e7d32" },
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
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#1a472a" }}>
                    {division.division.name}
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e8f5e9" }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f1f8f4" }}>
                          {["順位", "チーム", "勝", "敗", "勝率", "GB", "連勝/連敗", "得点", "失点"].map((label) => (
                            <TableCell
                              key={label}
                              align={["順位", "チーム"].includes(label) ? "left" : "center"}
                              sx={{ fontWeight: 700, color: "#1a472a" }}
                            >
                              {label}
                            </TableCell>
                          ))}
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
