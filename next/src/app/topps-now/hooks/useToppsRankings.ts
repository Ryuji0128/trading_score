import { useMemo } from "react";
import type { ToppsCard } from "@/lib/types";

export interface ToppsStats {
  totalCards: number;
  avgPrint: number;
  maxPrintCard: ToppsCard | undefined;
  minPrintCard: ToppsCard | undefined;
}

export interface PlayerRankingItem {
  name: string;
  count: number;
}

export interface TeamRankingItem {
  name: string;
  count: number;
}

export interface PlayerPrintRankingItem {
  name: string;
  totalPrint: number;
  cardCount: number;
}

export interface PlayerAvgPrintRankingItem {
  name: string;
  totalPrint: number;
  cardCount: number;
  avgPrint: number;
}

export interface TeamAvgPrintRankingItem {
  name: string;
  totalPrint: number;
  cardCount: number;
  avgPrint: number;
}

export interface NationalityPrintRankingItem {
  nationality: string;
  totalPrint: number;
  cardCount: number;
  avgPrint: number;
}

export interface CardPrintRanking {
  maxPrintCards: ToppsCard[];
  minPrintCards: ToppsCard[];
}

export function useToppsRankings(toppsCards: ToppsCard[]) {
  const stats = useMemo((): ToppsStats | null => {
    if (toppsCards.length === 0) return null;

    const totalCards = toppsCards.length;
    const cardsWithPrint = toppsCards.filter(card => card.total_print !== null);
    const avgPrint = cardsWithPrint.length > 0
      ? Math.round(cardsWithPrint.reduce((sum, card) => sum + (card.total_print || 0), 0) / cardsWithPrint.length)
      : 0;

    const maxPrintCard = cardsWithPrint.reduce((max, card) =>
      (card.total_print || 0) > (max.total_print || 0) ? card : max
    , cardsWithPrint[0]);

    const minPrintCard = cardsWithPrint.reduce((min, card) =>
      (card.total_print || 0) < (min.total_print || 0) ? card : min
    , cardsWithPrint[0]);

    return { totalCards, avgPrint, maxPrintCard, minPrintCard };
  }, [toppsCards]);

  const playerRanking = useMemo((): PlayerRankingItem[] => {
    const playerCounts = new Map<number, { name: string; count: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player) {
        const existing = playerCounts.get(card.player.id);
        if (existing) {
          existing.count += 1;
        } else {
          playerCounts.set(card.player.id, { name: card.player.full_name, count: 1 });
        }
      }
    });

    return Array.from(playerCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [toppsCards]);

  const teamRanking = useMemo((): TeamRankingItem[] => {
    const teamCounts = new Map<number, { name: string; count: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.team) {
        const existing = teamCounts.get(card.team.id);
        if (existing) {
          existing.count += 1;
        } else {
          teamCounts.set(card.team.id, { name: card.team.full_name, count: 1 });
        }
      }
    });

    return Array.from(teamCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [toppsCards]);

  const playerTotalPrintRanking = useMemo((): PlayerPrintRankingItem[] => {
    const playerPrints = new Map<number, { name: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player && card.total_print) {
        const existing = playerPrints.get(card.player.id);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          playerPrints.set(card.player.id, {
            name: card.player.full_name,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(playerPrints.values())
      .sort((a, b) => b.totalPrint - a.totalPrint)
      .slice(0, 10);
  }, [toppsCards]);

  const playerAvgPrintRanking = useMemo((): PlayerAvgPrintRankingItem[] => {
    const playerPrints = new Map<number, { name: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player && card.total_print) {
        const existing = playerPrints.get(card.player.id);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          playerPrints.set(card.player.id, {
            name: card.player.full_name,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(playerPrints.values())
      .map(p => ({
        ...p,
        avgPrint: Math.round(p.totalPrint / p.cardCount),
      }))
      .filter(p => p.cardCount >= 2)
      .sort((a, b) => b.avgPrint - a.avgPrint)
      .slice(0, 10);
  }, [toppsCards]);

  const teamAvgPrintRanking = useMemo((): TeamAvgPrintRankingItem[] => {
    const teamPrints = new Map<number, { name: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.team && card.total_print) {
        const existing = teamPrints.get(card.team.id);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          teamPrints.set(card.team.id, {
            name: card.team.full_name,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(teamPrints.values())
      .map(t => ({
        ...t,
        avgPrint: Math.round(t.totalPrint / t.cardCount),
      }))
      .sort((a, b) => b.avgPrint - a.avgPrint)
      .slice(0, 10);
  }, [toppsCards]);

  const cardPrintRanking = useMemo((): CardPrintRanking => {
    const cardsWithPrint = toppsCards.filter((card: ToppsCard) => card.total_print !== null && card.total_print > 0);

    const sortedByPrint = [...cardsWithPrint].sort((a, b) => (b.total_print || 0) - (a.total_print || 0));

    const maxPrintCards = sortedByPrint.slice(0, 10);
    const minPrintCards = sortedByPrint.slice(-10).reverse();

    return { maxPrintCards, minPrintCards };
  }, [toppsCards]);

  const nationalityPrintRanking = useMemo((): NationalityPrintRankingItem[] => {
    const nationalityPrints = new Map<string, { nationality: string; totalPrint: number; cardCount: number }>();

    toppsCards.forEach((card: ToppsCard) => {
      if (card.player?.nationality && card.total_print) {
        const nationality = card.player.nationality;
        const existing = nationalityPrints.get(nationality);
        if (existing) {
          existing.totalPrint += card.total_print;
          existing.cardCount += 1;
        } else {
          nationalityPrints.set(nationality, {
            nationality,
            totalPrint: card.total_print,
            cardCount: 1,
          });
        }
      }
    });

    return Array.from(nationalityPrints.values())
      .map(n => ({
        ...n,
        avgPrint: Math.round(n.totalPrint / n.cardCount),
      }))
      .sort((a, b) => b.totalPrint - a.totalPrint);
  }, [toppsCards]);

  return {
    stats,
    playerRanking,
    teamRanking,
    playerTotalPrintRanking,
    playerAvgPrintRanking,
    teamAvgPrintRanking,
    cardPrintRanking,
    nationalityPrintRanking,
  };
}
