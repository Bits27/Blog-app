import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import type { Comment } from "../../features/comments/commentTypes";
import type { AppDispatch } from "../../app/store";
import { deleteComment } from "../../features/comments/commentThunks";
import { useAuth } from "../../context/useAuth";

function CommentList({ comments }: { comments: Comment[] }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();

  if (comments.length === 0) return <p>No comments yet.</p>;

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        
<div className="comment-item" key={comment.id}>
          <p>{comment.content}</p>
          <div className="comment-meta">
            <div className="meta">
              by{" "}
              <Link to={`/profile/${comment.user_id}`}>{comment.username}</Link> •{" "}
              {new Date(comment.created_at).toLocaleString()}
            </div>
            {user?.id === comment.user_id ? (
              <button
                className="comment-delete"
                type="button"
                onClick={() => {
                  if (!confirm("Delete this comment?")) return;
                  dispatch(deleteComment({ id: comment.id }));
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
          {comment.image_url ? (
            <img className="comment-image" src={comment.image_url} alt="Comment image" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default CommentList;
