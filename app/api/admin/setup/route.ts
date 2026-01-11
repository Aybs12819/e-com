import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { email, password, firstName, lastName } = await request.json();

  // Check if an admin already exists
  const { data: adminData, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .single();

  if (adminData) {
    return NextResponse.json(
      { error: "Admin account already exists." },
      { status: 409 }
    );
  }

  if (adminError && adminError.code !== "PGRST116") {
    console.error("Error checking existing admin:", adminError);
    return NextResponse.json(
      { error: "Failed to check admin status." },
      { status: 500 }
    );
  }

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: "admin",
      },
    },
  });

  if (error) {
    console.error("Error signing up admin:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Admin account created successfully!" });
}