import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Comment } from "./commentTypes";
import { fetchComments, createComment, deleteComment, updateComment } from "./commentThunks";

interface CommentState {
  items: Comment[];
  loading: boolean;
  error: string | null;
  blogId: string | null;
}

const initialState: CommentState = {
  items: [],
  loading: false,
  error: null,
  blogId: null
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.blogId = action.meta.arg.blogId;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteComment.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((comment) => comment.id !== action.payload);
      })
      .addCase(updateComment.fulfilled, (state, action: PayloadAction<Comment>) => {
        const updated = action.payload;
        const index = state.items.findIndex((comment) => comment.id === updated.id);
        if (index !== -1) {
          state.items[index] = updated;
        }
      });
  }
});

export default commentSlice.reducer;
