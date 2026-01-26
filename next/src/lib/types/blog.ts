/** ブログ記事 */
export interface Blog {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  author_name: string | null;
  author_email: string | null;
  published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}
