/** チーム情報 */
export interface Team {
  id: number;
  full_name: string;
  abbreviation: string;
  nickname: string;
  primary_color: string;
  mlb_team_id: number | null;
}

/** ユーザー情報 */
export interface User {
  id: number;
  email: string;
  is_superuser: boolean;
}

/** 選手情報（詳細） */
export interface Player {
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

/** 選手成績 */
export interface PlayerStats {
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
