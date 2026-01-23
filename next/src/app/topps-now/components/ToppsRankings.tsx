"use client";

import { SyntheticEvent } from "react";
import { Box, Typography, Chip, Paper, Tabs, Tab } from "@mui/material";
import type { ToppsCard } from "@/lib/types";
import type {
  PlayerRankingItem,
  TeamRankingItem,
  PlayerPrintRankingItem,
  PlayerAvgPrintRankingItem,
  TeamAvgPrintRankingItem,
  NationalityPrintRankingItem,
  CardPrintRanking,
} from "../hooks/useToppsRankings";

interface ToppsRankingsProps {
  rankingTab: number;
  onTabChange: (newValue: number) => void;
  playerRanking: PlayerRankingItem[];
  teamRanking: TeamRankingItem[];
  nationalityPrintRanking: NationalityPrintRankingItem[];
  playerTotalPrintRanking: PlayerPrintRankingItem[];
  playerAvgPrintRanking: PlayerAvgPrintRankingItem[];
  teamAvgPrintRanking: TeamAvgPrintRankingItem[];
  cardPrintRanking: CardPrintRanking;
}

interface RankingItemProps {
  index: number;
  name: string;
  subtitle?: string;
  chipLabel: string;
  topColor: string;
  normalBgColor: string;
  normalTextColor: string;
  borderColor?: string;
  isLast: boolean;
}

function RankingItem({ index, name, subtitle, chipLabel, topColor, normalBgColor, normalTextColor, borderColor, isLast }: RankingItemProps) {
  return (
    <Box
      component="li"
      sx={{
        py: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: !isLast ? `1px solid ${borderColor || normalBgColor}` : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: index < 3 ? topColor : normalBgColor,
            color: index < 3 ? 'white' : normalTextColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          {index + 1}
        </Typography>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: index < 3 ? 700 : 400 }}>
            {name}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Chip
        label={chipLabel}
        size="small"
        sx={{
          bgcolor: index < 3 ? topColor : normalBgColor,
          color: index < 3 ? 'white' : normalTextColor,
          fontWeight: 600,
        }}
      />
    </Box>
  );
}

export default function ToppsRankings({
  rankingTab,
  onTabChange,
  playerRanking,
  teamRanking,
  nationalityPrintRanking,
  playerTotalPrintRanking,
  playerAvgPrintRanking,
  teamAvgPrintRanking,
  cardPrintRanking,
}: ToppsRankingsProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        borderRadius: 3,
        border: "1px solid #e8f5e9",
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={rankingTab}
        onChange={(_: SyntheticEvent, newValue: number) => onTabChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          bgcolor: '#f1f8f4',
          borderBottom: '1px solid #e8f5e9',
          '& .MuiTab-root': {
            fontWeight: 600,
            color: '#1a472a',
            minHeight: 48,
            '&.Mui-selected': {
              color: '#2e7d32',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#2e7d32',
          },
        }}
      >
        <Tab label="選手登場回数" />
        <Tab label="チーム登場回数" />
        <Tab label="国籍別発行数" />
        <Tab label="選手合計発行数" />
        <Tab label="選手1枚平均" />
        <Tab label="チーム1枚平均" />
        <Tab label="最多発行（1枚）" />
        <Tab label="最少発行（1枚）" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {/* 選手登場回数ランキング */}
        {rankingTab === 0 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {playerRanking.map((player, index) => (
              <RankingItem
                key={index}
                index={index}
                name={player.name}
                chipLabel={`${player.count}枚`}
                topColor="#2e7d32"
                normalBgColor="#e8f5e9"
                normalTextColor="#1a472a"
                borderColor="#e8f5e9"
                isLast={index === playerRanking.length - 1}
              />
            ))}
          </Box>
        )}

        {/* チーム登場回数ランキング */}
        {rankingTab === 1 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {teamRanking.map((team, index) => (
              <RankingItem
                key={index}
                index={index}
                name={team.name}
                chipLabel={`${team.count}枚`}
                topColor="#2e7d32"
                normalBgColor="#e8f5e9"
                normalTextColor="#1a472a"
                borderColor="#e8f5e9"
                isLast={index === teamRanking.length - 1}
              />
            ))}
          </Box>
        )}

        {/* 国籍別合計発行数ランキング */}
        {rankingTab === 2 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {nationalityPrintRanking.map((item, index) => (
              <RankingItem
                key={index}
                index={index}
                name={item.nationality}
                subtitle={`${item.cardCount}枚 / 平均${item.avgPrint.toLocaleString()}枚`}
                chipLabel={item.totalPrint.toLocaleString()}
                topColor="#e65100"
                normalBgColor="#fff3e0"
                normalTextColor="#e65100"
                borderColor="#fff3e0"
                isLast={index === nationalityPrintRanking.length - 1}
              />
            ))}
          </Box>
        )}

        {/* 選手合計発行数ランキング */}
        {rankingTab === 3 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {playerTotalPrintRanking.map((player, index) => (
              <RankingItem
                key={index}
                index={index}
                name={player.name}
                subtitle={`${player.cardCount}種類のカード`}
                chipLabel={player.totalPrint.toLocaleString()}
                topColor="#2e7d32"
                normalBgColor="#e8f5e9"
                normalTextColor="#1a472a"
                borderColor="#e8f5e9"
                isLast={index === playerTotalPrintRanking.length - 1}
              />
            ))}
          </Box>
        )}

        {/* 1枚あたり平均発行数ランキング */}
        {rankingTab === 4 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {playerAvgPrintRanking.map((player, index) => (
              <RankingItem
                key={index}
                index={index}
                name={player.name}
                subtitle={`${player.cardCount}種類 / 合計${player.totalPrint.toLocaleString()}枚`}
                chipLabel={`${player.avgPrint.toLocaleString()}/枚`}
                topColor="#1565c0"
                normalBgColor="#e3f2fd"
                normalTextColor="#1565c0"
                borderColor="#e8f5e9"
                isLast={index === playerAvgPrintRanking.length - 1}
              />
            ))}
          </Box>
        )}

        {/* チーム1枚あたり平均発行数ランキング */}
        {rankingTab === 5 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {teamAvgPrintRanking.map((team, index) => (
              <RankingItem
                key={index}
                index={index}
                name={team.name}
                subtitle={`${team.cardCount}種類 / 合計${team.totalPrint.toLocaleString()}枚`}
                chipLabel={`${team.avgPrint.toLocaleString()}/枚`}
                topColor="#7b1fa2"
                normalBgColor="#f3e5f5"
                normalTextColor="#7b1fa2"
                borderColor="#e8f5e9"
                isLast={index === teamAvgPrintRanking.length - 1}
              />
            ))}
          </Box>
        )}

        {/* 1枚単位 最多発行数ランキング */}
        {rankingTab === 6 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {cardPrintRanking.maxPrintCards.map((card: ToppsCard, index: number) => (
              <RankingItem
                key={card.id}
                index={index}
                name={card.player?.full_name || 'Team Set'}
                subtitle={`#${card.card_number}`}
                chipLabel={card.total_print?.toLocaleString() || '-'}
                topColor="#2e7d32"
                normalBgColor="#e8f5e9"
                normalTextColor="#1a472a"
                borderColor="#e8f5e9"
                isLast={index === cardPrintRanking.maxPrintCards.length - 1}
              />
            ))}
          </Box>
        )}

        {/* 1枚単位 最少発行数ランキング */}
        {rankingTab === 7 && (
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            {cardPrintRanking.minPrintCards.map((card: ToppsCard, index: number) => (
              <RankingItem
                key={card.id}
                index={index}
                name={card.player?.full_name || 'Team Set'}
                subtitle={`#${card.card_number}`}
                chipLabel={card.total_print?.toLocaleString() || '-'}
                topColor="#d32f2f"
                normalBgColor="#ffebee"
                normalTextColor="#c62828"
                borderColor="#e8f5e9"
                isLast={index === cardPrintRanking.minPrintCards.length - 1}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
