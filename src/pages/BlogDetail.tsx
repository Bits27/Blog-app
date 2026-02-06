import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Blog } from "../types/blog";
import { useAuth } from "../context/useAuth";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { deleteBlog } from "../features/blog/blogThunks";
import { fetchComments, createComment } from "../features/comments/commentThunks";
import CommentList from "../components/blog/CommentList";
import { uploadCommentImage } from "../lib/storage";
import { getMyUserId, getMyUsername } from "../lib/profile";

function BlogDetail() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `link-pill${isActive ? " active" : ""}`;
  const { items: comments, loading: commentsLoading } = useSelector(
    (state: RootState) => state.comments
  );

  const [blog, setBlog] = useState<Blog | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentImage, setCommentImage] = useState<File | null>(null);
  const [commentError, setCommentError] = useState("");
  const [commentUploading, setCommentUploading] = useState(false);

  useEffect(() => {
    if (!id) return;

    supabase
      .from("blogs")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        if (!data) {
          setErrorMsg("Blog not found");
          return;
        }
        setBlog(data);
      });

    dispatch(fetchComments({ blogId: id }));
  }, [id, dispatch]);

  if (errorMsg) return <p>{errorMsg}</p>;
  if (!blog) return <p>Loading...</p>;

  const isOwner = blog.user_id && user?.id === blog.user_id;

  const handleDelete = async () => {
    if (!blog) return;
    if (!confirm("Delete this blog? This cannot be undone.")) return;

    await dispatch(deleteBlog({ id: blog.id }));
    navigate("/");
  };

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">Inkframe</div>
        <div className="nav-links">
          <NavLink className={navClass} to="/">Home</NavLink>
          <NavLink className={navClass} to="/create">Create Blog</NavLink>
          {user ? (
            <NavLink className={navClass} to={`/profile/${user.id}`}>Profile</NavLink>
          ) : null}
        </div>
      </div>

      <div className="card content-width">
      {blog.image_url ? (
        <img className="blog-image" src={blog.image_url} alt={blog.title} />
      ) : null}
        <h1>{blog.title}</h1>
      <p className="meta">
        {(blog.category === "others" ? "Other" : blog.category)} • by{" "}
        {blog.username} • {new Date(blog.created_at).toLocaleDateString()}
      </p>
      <p className="blog-content">{blog.content}</p>
      {isOwner ? (
        <div className="toolbar">
          <Link className="button secondary" to={`/blogs/${blog.id}/edit`}>Edit</Link>
          <button type="button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      ) : null}
      </div>

      <div className="comment-section">
        <hr />
        <h2 className="section-title">Comments</h2>
        <form
          className="form comment-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setCommentError("");
            if (!id || !commentText.trim()) return;

            const user_id = await getMyUserId();
            const username = await getMyUsername();
            if (!user_id || !username) {
              setCommentError("You must be logged in to comment.");
              return;
            }

            let image_url: string | null = null;
            if (commentImage) {
              try {
                setCommentUploading(true);
                image_url = await uploadCommentImage(commentImage, user_id);
              } catch {
                setCommentError("Image upload failed. Please try again.");
                setCommentUploading(false);
                return;
              }
            }

            await dispatch(
              createComment({
                blog_id: id,
                user_id,
                username,
                content: commentText.trim(),
                image_url
              })
            );

            setCommentText("");
            setCommentImage(null);
            setCommentUploading(false);
          }}
        >
          <textarea
            className="comment-textarea"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <div className="comment-actions">
            <button type="submit" disabled={commentUploading}>
            {commentUploading ? "Posting..." : "Post Comment"}
            </button>
            <label className="image-row image-row--compact">
              Add image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCommentImage(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          {commentImage ? <div className="meta">Selected: {commentImage.name}</div> : null}
          {commentError ? <p className="notice">{commentError}</p> : null}
        </form>

        {commentsLoading ? <p>Loading comments...</p> : null}
        <CommentList comments={comments} />
      </div>
    </div>
  );
}

export default BlogDetail;
