import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;
const BUCKET = process.env.SUPABASE_BUCKET_DECKS ?? "decks";

const supabase = createClient(url, anon);

export async function uploadBuffer(bytes: Uint8Array, path: string, contentType: string) {
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!pub) throw new Error("Failed to get public URL");
  return pub.publicUrl;
}
