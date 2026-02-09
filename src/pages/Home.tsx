import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { fetchBlogs } from "../features/blog/blogThunks";
import { toggleCategory, clearCategories, setPage } from "../features/blog/blogSlice";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getMyUsername } from "../lib/profile";
import { NavLinkPill, Topbar } from "../components/common/Topbar";

const QUOTES = [
  "Small steps done daily become big changes.",
  "Discipline beats motivation on the days you don’t feel like it.",
  "Progress, not perfection.",
  "You don’t have to be fearless—just keep going.",
  "Consistency is a quiet kind of power.",
  "Your future self is watching you choose.",
  "Start where you are. Use what you have. Do what you can.",
  "Energy follows action.",
  "Make it simple. Make it clear. Make it happen.",
  "You are capable of more than you think."
];



function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [myUsername, setMyUsername] = useState<string | null>(null);

  const { blogs, selectedCategories, page, pageSize, total } = useSelector(
    (state: RootState) => state.blogs
  );

  //decide which blogs to show 
  useEffect(()=>{
    dispatch(fetchBlogs({ page, pageSize, categories: selectedCategories }))
}, [dispatch, page, pageSize, selectedCategories])

  useEffect(() => {//displays the name on top
    
    getMyUsername().then((name) => setMyUsername(name));
  }, [user]);

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {//quote generator
    const id = window.setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, []);


  const hasNextPage = page * pageSize < total;




  return (
    <div className="app-shell">
      <Topbar welcomeText={myUsername ? `Welcome, ${myUsername}` : null}>
        <NavLinkPill to="/">Home</NavLinkPill>
        <NavLinkPill to="/create">Create Blog</NavLinkPill>
        {user ? <NavLinkPill to={`/profile/${user.id}`}>Profile</NavLinkPill> : null}
        <NavLinkPill to="/logout">Logout</NavLinkPill>
      </Topbar>

      <div className="hero">
        <div>
          <h1>Inkframe</h1>
          <p>
            A calm, modern space for stories, travel notes, and quiet
            observations. Read what others share and publish your own.
          </p>
        </div>
        <div className="accent-box">
          <strong>Life starts here</strong>
          <p>“{QUOTES[quoteIndex]}”</p>
        </div>
      </div>
        
      <div className="toolbar">
        <button
          className={selectedCategories.length === 0 ? "active" : ""}
          onClick={() => dispatch(clearCategories())}
        >
          All
        </button>
        <button
          className={selectedCategories.includes("school") ? "active" : ""}
          onClick={() => dispatch(toggleCategory("school"))}
        >
          School
        </button>
        <button
          className={selectedCategories.includes("travel") ? "active" : ""}
          onClick={() => dispatch(toggleCategory("travel"))}
        >
          Travel
        </button>
        <button
          className={selectedCategories.includes("food") ? "active" : ""}
          onClick={() => dispatch(toggleCategory("food"))}
        >
          Food
        </button>
        <button
          className={selectedCategories.includes("others") ? "active" : ""}
          onClick={() => dispatch(toggleCategory("others"))}
        >
          Others
        </button>
      </div>

      <h2 className="section-title">Latest Posts</h2>
      {blogs.length === 0 ? (
        <p className="notice">No posts yet.</p>
      ) : (
        <div className="grid">
          {blogs.map(blog => (
            <div className="card card--preview" key={blog.id}>
              {blog.image_url ? (
                <div>
                  <img src={blog.image_url} alt={blog.title} width={240} />
                </div>
              ) : null}
              <h3>{ blog.title }</h3>
              <p>{ blog.content }</p>
              <div className="card-footer">
                <div className="meta">
                  {blog.category === "others" ? "Other" : blog.category} • by{" "}
                  {blog.user_id ? (
                    <Link to={`/profile/${blog.user_id}`}>{blog.username}</Link>
                  ) : (
                    blog.username
                  )}{" "}
                  • {new Date(blog.created_at).toLocaleDateString()}
                </div>
                <div className="card-actions">
                  <Link className="button secondary" to={`/blogs/${blog.id}`}>Read</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="toolbar toolbar--center pagination">
        <button disabled={page === 1}
            onClick={() => dispatch(setPage(page - 1))}>
        Previous</button>

        <span style={{ margin: "0 1rem" }}>Page {page}</span>

        <button
            disabled={!hasNextPage}
            onClick={() => dispatch(setPage(page + 1))}>
        Next</button>
      </div>

    </div>
  );
}

export default Home;
