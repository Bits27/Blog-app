import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/useAuth";
import type { Blog } from "../types/blog";
import { deleteBlog } from "../features/blog/blogThunks";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { signOut } from "../lib/auth";
import { NavLinkPill, Topbar } from "../components/common/Topbar";

type ProfileData = {
  id: string;
  username: string;
  created_at: string;
};

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.id === id;

  useEffect(() => {
    if (!id) return;

    supabase
      .from("profiles")
      .select("id, username, created_at")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        if (!data) {
          setErrorMsg("Profile not found");
          return;
        }
        setProfile(data);
      });

    supabase
      .from("blogs")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        setBlogs(data ?? []);
      });
  }, [id]);

  if (errorMsg) return <p>{errorMsg}</p>;
  if (!profile) return <p>Loading...</p>;

  const handleDeleteProfile = async () => {
    if (!isOwner || !profile) return;
    if (!confirm("Delete your profile and all your blogs? This cannot be undone.")) return;
    setDeleting(true);
    setErrorMsg("");

    const { data: authData, error: authError } = await supabase.auth.getUser();
    const authUserId = authData.user?.id;
    if (authError || !authUserId || authUserId !== profile.id) {
      setErrorMsg(authError?.message ?? "Not authorized to delete this profile.");
      setDeleting(false);
      return;
    }

    const { error: blogsError } = await supabase
      .from("blogs")
      .delete()
      .eq("user_id", authUserId);

    if (blogsError) {
      setErrorMsg(blogsError.message);
      setDeleting(false);
      return;
    }

    const { data: deletedProfiles, error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", authUserId)
      .select("id");

    if (profileError) {
      setErrorMsg(profileError.message);
      setDeleting(false);
      return;
    }
    if (!deletedProfiles || deletedProfiles.length === 0) {
      setErrorMsg("Profile delete was blocked. Check Supabase RLS policies for profiles.");
      setDeleting(false);
      return;
    }

    const { data: verifyProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authUserId)
      .maybeSingle();

    if (verifyError) {
      setErrorMsg(verifyError.message);
      setDeleting(false);
      return;
    }
    if (verifyProfile) {
      setErrorMsg("Profile still exists after delete. Check RLS and foreign key constraints.");
      setDeleting(false);
      return;
    }

    await signOut();
    navigate("/register");
  };

  return (
    <div className="app-shell">
      <Topbar>
        <NavLinkPill to="/">Home</NavLinkPill>
        <NavLinkPill to={`/profile/${profile.id}`}>Profile</NavLinkPill>
      </Topbar>

      <div className="profile-header">
        {isOwner ? <div className="profile-owner">Your profile</div> : null}
        <h1 className="section-title">{profile.username}</h1>
        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Joined</span>
            <span className="detail-value">
              {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Username</span>
            <span className="detail-value">{profile.username}</span>
          </div>
          {isOwner && user?.email ? (
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
          ) : null}
        </div>
      </div>

      {isOwner ? (
        <div className="danger-zone">
          <button
            className="danger-link"
            type="button"
            onClick={handleDeleteProfile}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Profile"}
          </button>
        </div>
      ) : null}

      <h2 className="section-title">Blogs</h2>
      {blogs.length === 0 ? <p>No blogs yet.</p> : null}
      <div className="grid">
        {blogs.map((blog) => (
          <div className="card card--preview" key={blog.id}>
            {blog.image_url ? (
              <img src={blog.image_url} alt={blog.title} />
            ) : null}
            <h3>{blog.title}</h3>
            <p>{blog.content}</p>
            <div className="card-footer">
              <div className="meta">
                {blog.category === "others" ? "Other" : blog.category} • by{" "}
                {blog.username ?? profile.username} •{" "}
                {new Date(blog.created_at).toLocaleDateString()}
              </div>
              <div className="card-actions">
                <Link className="button secondary" to={`/blogs/${blog.id}`}>View</Link>
                {isOwner ? (
                  <>
                    <Link className="button" to={`/blogs/${blog.id}/edit`}>Edit</Link>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("Delete this blog? This cannot be undone.")) return;
                        await dispatch(deleteBlog({ id: blog.id }));
                        setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
