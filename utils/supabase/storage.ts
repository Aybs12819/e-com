import { supabase } from "@/lib/supabase/client";

export async function uploadProductImage(file: File) {
  const supabaseClient = supabase;

  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { publicUrl: null, error: uploadError };
  }

  const { data } = supabase.storage.from("products").getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    error: null,
  };
}

export async function uploadProfileImage(file: File) {
  const supabaseClient = supabase;

  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("profiles")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { publicUrl: null, error: uploadError };
  }

  const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    error: null,
  };
}
