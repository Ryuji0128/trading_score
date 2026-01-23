import type { Team } from "./api";

/** Topps Nowカード */
export interface ToppsCard {
  id: number;
  card_number: string;
  player: {
    id: number;
    full_name: string;
    mlb_player_id: number | null;
    nationality: string | null;
    wbc_years: string;
    wbc_country: string;
  } | null;
  team: Team | null;
  title: string;
  total_print: number | null;
  image_url: string;
  product_url: string;
  product_url_long: string;
  release_date: string | null;
  mlb_game_id: number | null;
  created_at: string;
  topps_set: {
    year: number;
    name: string;
  };
}
