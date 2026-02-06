import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createBlog, fetchBlogs, updateBlog, deleteBlog } from "./blogThunks";
import type { Blog, Category } from "../../types/blog";

interface BlogState {
  blogs: Blog[];
  selectedCategories: Category[];
  page: number;
  pageSize: number;
  total: number;
}

const initialState: BlogState = {
  blogs: [],
  selectedCategories: [],
  page: 1,
  pageSize: 4,
  total: 0,
};

const blogSlice = createSlice({
  name: "blogs", //slice name
  initialState,
  reducers: {
    toggleCategory(state, action: PayloadAction<Category>) {
      const category = action.payload; //category the user has clicked

      if (state.selectedCategories.includes(category)) {
        state.selectedCategories = state.selectedCategories.filter(
          //state.selectedCategories = all categories active
          (c) => c !== category,
        );
      } else {
        state.selectedCategories = [];
        state.selectedCategories.push(category);
      }
      state.page = 1;
    },
    clearCategories(state) {
      state.selectedCategories = [];
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload);
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.blogs.findIndex((b) => b.id === updated.id);
        if (index !== -1) {
          state.blogs[index] = updated;
        }
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b) => b.id !== action.payload);
      });
  },
});

export const { toggleCategory, clearCategories, setPage } = blogSlice.actions;
export default blogSlice.reducer;
