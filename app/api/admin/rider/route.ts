import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the authenticated user is an admin
  const { data: adminUser, error: adminError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authUser.id)
    .single();

  if (
    adminError ||
    (adminUser?.role !== "admin" && adminUser?.role !== "logistics")
  ) {
    return NextResponse.json(
      { error: "Forbidden: Only admins can create rider accounts." },
      { status: 403 }
    );
  }

  const { full_name, email, password, phone_number, address, id_image_url } =
    await req.json();

  // Hash the password
  const hashedPassword = await hash(password, 10);

  // Create the user in Supabase Auth
  const { data: newUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role: "rider",
      },
    },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  // Update the user's profile with full_name, role, phone_number, address, and id_image_url
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({ full_name, role: "rider", phone_number, address, id_image_url })
    .eq("id", newUser.user?.id);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Rider account created successfully", user: newUser.user },
    { status: 201 }
  );
}
