export interface Comment {
  id: string;
  created_at: string;
  updated_at?: string | null;
  blog_id: string;
  user_id: string;
  username: string;
  content: string;
  image_url?: string | null;
}
