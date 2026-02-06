import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import type { Blog,Category } from "../../types/blog"


interface CreateBlogPayload {title: string; content: string;category: Category; username: string; user_id: string; image_url?: string | null;}

export const createBlog = createAsyncThunk<Blog, CreateBlogPayload>(
  "blogs/createBlog",
  async (payload, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("blogs")
      .insert(payload)
      .select()
      .single();

    if (error) return rejectWithValue(error.message);

    return data;
  }
);

export const fetchBlogs = createAsyncThunk<
  { items: Blog[]; total: number },
  { page: number; pageSize: number; categories: Category[] }
>(
  "blogs/fetchBlogs",
  async ({ page, pageSize, categories }, { rejectWithValue }) => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (categories.length > 0) {
      query = query.in("category", categories);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) return rejectWithValue(error.message);

    return { items: data ?? [], total: count ?? 0 };
  }
);

export const updateBlog = createAsyncThunk<
  Blog,
  { id: string; title: string; content: string; category: Category; image_url?: string | null }
>("blogs/updateBlog", async ({ id, title, content, category, image_url }, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from("blogs")
    .update({ title, content, category, image_url })
    .eq("id", id)
    .select()
    .single();

  if (error) return rejectWithValue(error.message);

  return data;
});

export const deleteBlog = createAsyncThunk<string, { id: string }>(
  "blogs/deleteBlog",
  async ({ id }, { rejectWithValue }) => {
    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) return rejectWithValue(error.message);

    return id;
  }
);
