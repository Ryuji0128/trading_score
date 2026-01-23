/** WBCトーナメント一覧用 */
export interface WBCTournament {
  id: number;
  year: number;
  champion: string;
  runner_up: string;
  game_count: number;
  country_count: number;
}

/** WBC試合 */
export interface WBCGame {
  id: number;
  game_pk: number;
  game_date: string;
  away_team: string;
  home_team: string;
  away_score: number | null;
  home_score: number | null;
  status: string;
}

/** WBCトーナメント詳細 */
export interface WBCTournamentDetail {
  id: number;
  year: number;
  champion: string;
  runner_up: string;
  games: WBCGame[];
}

/** WBCロスターエントリー */
export interface WBCRosterEntry {
  id: number;
  country: string;
  mlb_player_id: number;
  player_name: string;
  player: number | null;
  has_topps_card: boolean;
}

/** WBC選手のカード情報（ダイアログ表示用） */
export interface PlayerCard {
  id: number;
  card_number: string;
  title: string;
  total_print: number | null;
  release_date: string | null;
  image_url: string;
  product_url: string;
}
