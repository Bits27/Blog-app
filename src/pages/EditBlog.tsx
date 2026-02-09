import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import type { Blog, Category } from "../types/blog";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { updateBlog } from "../features/blog/blogThunks";
import { uploadBlogImage } from "../lib/storage";
import { NavLinkPill, Topbar } from "../components/common/Topbar";

function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(!id ? false : true);
  const [errorMsg, setErrorMsg] = useState("");
  const [blog, setBlog] = useState<Blog | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAction, setImageAction] = useState<"keep" | "remove" | "replace">("keep");
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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
          setLoading(false);
          return;
        }
        if (!data) {
          setErrorMsg("Blog not found");
          setLoading(false);
          return;
        }
        setBlog(data);
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!blog) return;
    if (!title.trim() || !content.trim() || !category) {
      setErrorMsg("Please fill in title, content, and category.");
      return;
    }

    let image_url = blog.image_url ?? null;
    if (imageFile && user?.id) {
      try {
        setSaving(true);
        if (imageAction === "replace") {
        image_url = await uploadBlogImage(imageFile, user.id);
        }
      } catch {
        setErrorMsg("Image upload failed. Please try again.");
        setSaving(false);
        return;
      }
    }
    if (imageAction === "remove") {
      image_url = null;
    }

    try {
      const result = await dispatch(
        updateBlog({
          id: blog.id,
          title,
          content,
          category,
          image_url,
        })
      ).unwrap();

      navigate(`/blogs/${result.id}`);
    } catch {
      setErrorMsg("Blog update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!id) return <p>Blog not found</p>;
  if (loading) return <p>Loading...</p>;
  if (errorMsg) return <p>{errorMsg}</p>;
  if (!blog) return null;

  if (blog.user_id && user?.id !== blog.user_id) {
    return <p>Not authorized to edit this blog.</p>;
  }

  return (
    <div className="app-shell">
      <Topbar>
        <NavLinkPill to="/">Home</NavLinkPill>
        <NavLinkPill to="/create">Create Blog</NavLinkPill>
        {user ? <NavLinkPill to={`/profile/${user.id}`}>Profile</NavLinkPill> : null}
        <Link className="link-pill" to={`/blogs/${blog.id}`}>Back to Blog</Link>
      </Topbar>

      <h1 className="section-title">Edit Blog</h1>

      <form className="form form--blog" onSubmit={handleSubmit}>
        <input
          className="title-input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="content-field content-width">
          <textarea
            className="blog-textarea"
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="radio-group">
          <label className={category === "school" ? "radio-option active" : "radio-option"}>
            <input
              type="radio"
              name="category"
              value="school"
              checked={category === "school"}
              onChange={(e) => setCategory(e.target.value as Category)}
            />
            School
          </label>

          <label className={category === "travel" ? "radio-option active" : "radio-option"}>
            <input
              type="radio"
              name="category"
              value="travel"
              checked={category === "travel"}
              onChange={(e) => setCategory(e.target.value as Category)}
            />
            Travel
          </label>

          <label className={category === "food" ? "radio-option active" : "radio-option"}>
            <input
              type="radio"
              name="category"
              value="food"
              checked={category === "food"}
              onChange={(e) => setCategory(e.target.value as Category)}
            />
            Food
          </label>

          <label className={category === "others" ? "radio-option active" : "radio-option"}>
            <input
              type="radio"
              name="category"
              value="others"
              checked={category === "others"}
              onChange={(e) => setCategory(e.target.value as Category)}
            />
            Others
          </label>
        </div>

        {blog.image_url ? (
          imageAction !== "remove" ? (
            <img className="blog-image blog-image--small" src={blog.image_url} alt={blog.title} />
          ) : (
            <div className="meta">Current image will be removed.</div>
          )
        ) : null}
        {blog.image_url ? (
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              setImageAction((value) => (value === "remove" ? "keep" : "remove"));
              setImageFile(null);
              if (imageInputRef.current) {
                imageInputRef.current.value = "";
              }
            }}
          >
            {imageAction === "remove" ? "Undo remove" : "Remove current image"}
          </button>
        ) : null}
        <label className="image-row">
          {blog.image_url && imageAction !== "remove" ? "Replace image" : "Add image"}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={(e) => {
              setImageFile(e.target.files?.[0] ?? null);
              setImageAction("replace");
            }}
          />
        </label>
        {imageFile ? (
          <div className="meta">
            Selected: {imageFile.name}{" "}
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setImageFile(null);
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
              }}
            >
              Remove
            </button>
          </div>
        ) : null}

        <button className="submit-button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}

export default EditBlog;
