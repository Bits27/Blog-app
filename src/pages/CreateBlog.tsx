
import { useState } from "react";
import { useDispatch } from "react-redux";
import { createBlog } from "../features/blog/blogThunks"
import type { AppDispatch } from "../app/store";
import type { Category } from "../types/blog"
import { NavLink, useNavigate } from "react-router-dom";
import { getMyUsername, getMyUserId } from "../lib/profile";
import { uploadBlogImage } from "../lib/storage";

function CreateBlog() {
const dispatch = useDispatch<AppDispatch>()
const navClass = ({ isActive }: { isActive: boolean }) =>
  `link-pill${isActive ? " active" : ""}`;

const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
const navigate = useNavigate();


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setErrorMsg("");

      if (!title.trim() || !content.trim() || !category) {
        setErrorMsg("Please fill in title, content, and category.");
        return;
      }

    const user_id = await getMyUserId();
  const username = await getMyUsername();

  if (!user_id || !username) return;

  let image_url: string | null = null;
  if (imageFile) {
    try {
      setUploading(true);
      image_url = await uploadBlogImage(imageFile, user_id);
    } catch { setErrorMsg("Image upload failed. Please try again.");
      setUploading(false);
      return;
    }
  }

  try {
    const created = await dispatch(
      createBlog({title, content, category, username, user_id, image_url})
    ).unwrap();
    navigate(`/blogs/${created.id}`);
  } catch {
    setErrorMsg("Blog creation failed. Please try again.");
  }

  setTitle("");
  setContent("");
  setCategory("");
  setImageFile(null);
  setUploading(false);
};




  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">Inkframe</div>
        <div className="nav-links">
          <NavLink className={navClass} to="/">Home</NavLink>
          <NavLink className={navClass} to="/create">Create Blog</NavLink>
        </div>
      </div>

      <h1 className="section-title">Create Blog</h1>

      <form className="form form--blog" onSubmit={handleSubmit}>
        <input className="title-input" type="text" placeholder="Title" value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="content-field content-width">
          <textarea
            className="blog-textarea"
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        <label className="image-row">
          Add image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {imageFile ? <div className="meta">Selected: {imageFile.name}</div> : null}

        <p className="meta">Choose category for your blog</p>
        <div className="radio-group">
          <label>
            <input type="radio" name="category" value="school" checked={category === "school"}
              onChange={e => setCategory(e.target.value as Category)}
            />
            School
          </label>

          <label>
            <input type="radio" name="category" value="travel" checked={category === "travel"}
              onChange={e => setCategory(e.target.value as Category)}
            />
            Travel
          </label>

          <label>
            <input type="radio" name="category" value="food" checked={category === "food"}
              onChange={e => setCategory(e.target.value as Category)}
            />
            Food
          </label>

          <label>
            <input type="radio" name="category" value="others" checked={category === "others"} 
              onChange={e => setCategory(e.target.value as Category)}
            />
            Others
          </label>
        </div>

        <button className="submit-button" type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Create"}
        </button>
      </form>
      {errorMsg && <p className="notice">{errorMsg}</p>}
    </div>
  );}
export default CreateBlog
