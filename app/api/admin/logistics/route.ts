import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createAdminClient();

  const { email, password, full_name } = await req.json();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "logistics" },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Upsert into profiles table
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user?.id,
    full_name: full_name,
    email: email,
    role: "logistics",
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Head Logistics user created successfully", user: { ...data.user, full_name, role: "logistics" } });
}