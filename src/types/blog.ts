export type Category = "school" | "travel" | "food" | "others";

export interface Blog {
  id: string;
  title: string;
  content: string;
  category: Category;
  created_at: string;
  image_url?: string | null;
  user_id?: string | null;
  username: string;
}

