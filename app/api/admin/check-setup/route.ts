import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found, which is expected if no admin exists
    console.error("Error checking admin status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ adminExists: !!data });
}