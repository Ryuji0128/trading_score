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
import { useRouter } from "next/navigation";
import useSWR from "swr";
import MLBLayout from "@/components/MLBLayout";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { fetcher } from "@/lib/fetcher";
import { MLB_API_BASE } from "@/lib/constants";

interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  division: { id: number; name: string };
  league: { id: number; name: string };
}

export default function TeamsPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR(
    `${MLB_API_BASE}/teams?sportId=1&season=2024`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const teams: MLBTeam[] = useMemo(() => data?.teams || [], [data]);

  return (
    <MLBLayout activePath="/teams">
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
            icon={<EmojiEventsIcon sx={{ color: "white !important" }} />}
            label="MLB Teams"
            size="small"
            sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600, borderRadius: 2 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: "2rem", md: "3.5rem" } }}>
            チーム一覧
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
            MLBチーム情報と選手ロースター
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#2e7d32" }} />
          </Box>
        ) : teams.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              チームデータがありません
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {teams.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    height: "100%",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)" },
                  }}
                  onClick={() => router.push(`/teams/${team.id}`)}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: "#2e7d32",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                          {team.abbreviation}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {team.teamName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {team.locationName}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip label={team.division.name} size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32" }} />
                      <Chip label={team.league.name} size="small" sx={{ bgcolor: "#f5f5f5", color: "#666" }} />
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
