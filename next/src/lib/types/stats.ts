/** チーム順位表エントリー */
export interface TeamStanding {
  team: {
    id: number;
    name: string;
  };
  leagueRecord: {
    wins: number;
    losses: number;
    pct: string;
  };
  gamesBack: string;
  wildCardGamesBack: string;
  divisionRank: string;
  streak: {
    streakCode: string;
  };
  runsScored: number;
  runsAllowed: number;
}

/** ディビジョン順位表 */
export interface DivisionStandings {
  division: {
    id: number;
    name: string;
    abbreviation?: string;
  };
  teamRecords: TeamStanding[];
}

/** MLB試合情報 */
export interface Game {
  gamePk: number;
  gameDate: string;
  status: {
    detailedState: string;
  };
  teams: {
    away: {
      team: {
        id: number;
        name: string;
      };
      score?: number;
      isWinner?: boolean;
    };
    home: {
      team: {
        id: number;
        name: string;
      };
      score?: number;
      isWinner?: boolean;
    };
  };
}
