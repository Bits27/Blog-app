export interface Comment {
  id: string;
  created_at: string;
  blog_id: string;
  user_id: string;
  username: string;
  content: string;
  image_url?: string | null;
}
