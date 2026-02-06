import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "../features/blog/blogSlice"
import commentReducer from "../features/comments/commentSlice"

export const store = configureStore({
    reducer: {
        blogs: blogReducer,
        comments: commentReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch
