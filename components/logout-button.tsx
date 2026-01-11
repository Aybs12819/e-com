"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export function LogoutButton() {
  const router = useRouter()
  const supabaseClient = supabase

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    router.push("/auth")
  }

  return (
    <button
      onClick={handleLogout}
      className="font-bold hover:underline bg-transparent p-0 text-inherit"
    >
      Logout
    </button>
  )
}