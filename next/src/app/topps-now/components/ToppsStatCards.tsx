"use client";

import { Box, Typography, Paper } from "@mui/material";
import type { ToppsStats } from "../hooks/useToppsRankings";

interface ToppsStatCardsProps {
  stats: ToppsStats;
}

export default function ToppsStatCards({ stats }: ToppsStatCardsProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4,
      }}
    >
      {/* 総カード数 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e8f5e9",
          background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
        }}
      >
        <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
          総カード数
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
          {stats.totalCards.toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          枚
        </Typography>
      </Paper>

      {/* 平均発行枚数 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e8f5e9",
          background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
        }}
      >
        <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
          平均発行枚数
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
          {stats.avgPrint.toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          枚
        </Typography>
      </Paper>

      {/* 最多発行枚数 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e8f5e9",
          background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
        }}
      >
        <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
          最多発行枚数
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
          {stats.maxPrintCard?.total_print?.toLocaleString() || '-'}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {stats.maxPrintCard?.player?.full_name || stats.maxPrintCard?.title || '-'}
        </Typography>
      </Paper>

      {/* 最少発行枚数 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid #e8f5e9",
          background: "linear-gradient(135deg, #f1f8f4 0%, #ffffff 100%)",
        }}
      >
        <Typography variant="body2" sx={{ color: "#1a472a", fontWeight: 600, mb: 1 }}>
          最少発行枚数
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#2e7d32" }}>
          {stats.minPrintCard?.total_print?.toLocaleString() || '-'}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {stats.minPrintCard?.player?.full_name || stats.minPrintCard?.title || '-'}
        </Typography>
      </Paper>
    </Box>
  );
}
