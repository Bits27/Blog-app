import { supabase } from "./supabase";

const BLOG_IMAGE_BUCKET = "blog-images";
const COMMENT_IMAGE_BUCKET = "comment-images";

export async function uploadBlogImage(file: File, userId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BLOG_IMAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(BLOG_IMAGE_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function uploadCommentImage(file: File, userId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(COMMENT_IMAGE_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(COMMENT_IMAGE_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}
