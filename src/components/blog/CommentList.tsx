import { useDispatch } from "react-redux";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Comment } from "../../features/comments/commentTypes";
import type { AppDispatch } from "../../app/store";
import { deleteComment, updateComment } from "../../features/comments/commentThunks";
import { useAuth } from "../../context/useAuth";
import { uploadCommentImage } from "../../lib/storage";

function CommentList({ comments }: { comments: Comment[] }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [imageAction, setImageAction] = useState<"keep" | "remove" | "replace">("keep");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  if (comments.length === 0) return <p>No comments yet.</p>;

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        
<div className="comment-item" key={comment.id}>
          {editingId === comment.id ? (
            <>
              <textarea
                className="comment-textarea"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {comment.image_url ? (
                imageAction === "remove" ? (
                  <div className="meta">Current image will be removed.</div>
                ) : (
                  <img className="comment-image" src={comment.image_url} alt="Comment image" />
                )
              ) : null}
              {comment.image_url ? (
                <button
                  className="button secondary comment-image-action"
                  type="button"
                  onClick={() =>
                    setImageAction((value) => (value === "remove" ? "keep" : "remove"))
                  }
                >
                  {imageAction === "remove" ? "Undo remove" : "Remove photo"}
                </button>
              ) : null}
              <label className="button secondary image-row image-row--compact comment-image-action">
                {comment.image_url && imageAction !== "remove" ? "Replace image" : "Add image"}
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
                      setImageAction(comment.image_url ? "keep" : "keep");
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p>{comment.content}</p>
              {comment.image_url ? (
                <img className="comment-image" src={comment.image_url} alt="Comment image" />
              ) : null}
            </>
          )}
          <div className="comment-meta">
            <div className="meta">
              by{" "}
              <Link to={`/profile/${comment.user_id}`}>{comment.username}</Link>
            </div>
            <div className="meta">
              Posted at: {new Date(comment.created_at).toLocaleString()}
              {comment.updated_at && comment.updated_at !== comment.created_at ? (
                <>
                  <br />
                  Last edited at: {new Date(comment.updated_at).toLocaleString()}
                </>
              ) : null}
            </div>
          </div>
          {user?.id === comment.user_id ? (
            <div className="comment-actions">
              {editingId === comment.id ? (
                <>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={async () => {
                      const trimmed = draft.trim();
                      if (!trimmed) return;
                      const hasContentChange = trimmed !== comment.content;
                      const hasImageChange =
                        imageAction === "remove" ||
                        (imageAction === "replace" && imageFile);
                      if (!hasContentChange && !hasImageChange) {
                        setEditingId(null);
                        setImageAction("keep");
                        setImageFile(null);
                        if (imageInputRef.current) {
                          imageInputRef.current.value = "";
                        }
                        return;
                      }
                      setSaving(true);
                      try {
                        let image_url: string | null | undefined = undefined;
                        if (imageAction === "replace" && imageFile && user?.id) {
                          image_url = await uploadCommentImage(imageFile, user.id);
                        } else if (imageAction === "remove") {
                          image_url = null;
                        }

                        await dispatch(
                          updateComment({
                            id: comment.id,
                            content: trimmed,
                            image_url
                          })
                        );
                        setEditingId(null);
                        setImageAction("keep");
                        setImageFile(null);
                        if (imageInputRef.current) {
                          imageInputRef.current.value = "";
                        }
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="comment-delete"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setImageAction("keep");
                      setImageFile(null);
                      if (imageInputRef.current) {
                        imageInputRef.current.value = "";
                      }
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => {
                      setEditingId(comment.id);
                      setDraft(comment.content);
                      setImageAction("keep");
                      setImageFile(null);
                      if (imageInputRef.current) {
                        imageInputRef.current.value = "";
                      }
                    }}
                  >
                    Edit
                  </button>
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
                </>
              )}
            </div>
          ) : null}
          {editingId !== comment.id && comment.image_url ? null : null}
        </div>
      ))}
    </div>
  );
}

export default CommentList;
