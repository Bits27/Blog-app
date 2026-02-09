import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import type { Comment } from "./commentTypes";

export const fetchComments = createAsyncThunk<Comment[], { blogId: string }>(
  "comments/fetchComments",
  async ({ blogId }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("blog_id", blogId)
      .order("created_at", { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data ?? [];
  }
);

export const createComment = createAsyncThunk<
  Comment,
  { blog_id: string; user_id: string; username: string; content: string; image_url?: string | null }
>("comments/createComment", async (payload, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from("comments")
    .insert(payload)
    .select()
    .single();

  if (error) return rejectWithValue(error.message);
  return data;
});

export const deleteComment = createAsyncThunk<string, { id: string }>(
  "comments/deleteComment",
  async ({ id }, { rejectWithValue }) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) return rejectWithValue(error.message);
    return id;
  }
);

export const updateComment = createAsyncThunk<
  Comment,
  { id: string; content: string; image_url?: string | null }
>("comments/updateComment", async ({ id, content, image_url }, { rejectWithValue }) => {
  const updates: { content: string; image_url?: string | null } = { content };
  if (typeof image_url !== "undefined") {
    updates.image_url = image_url;
  }
  (updates as { updated_at?: string }).updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("comments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return rejectWithValue(error.message);
  return data;
});
