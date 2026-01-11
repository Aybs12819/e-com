"use client"

import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface AuthButtonsProps {
  // user: any; // No longer needed as user is fetched client-side
}

export function AuthButtons({}: AuthButtonsProps) {
  const [user, setUser] = useState<any>(null);
  const supabaseClient = supabase;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <div className="flex gap-4 items-center">
      {user ? (
        <>
          <Link 
            href="/customer/dashboard" 
            className="font-bold hover:underline"
          >
            Dashboard
          </Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/auth" className="font-bold hover:underline">
            Register
          </Link>
          <Link href="/auth" className="font-bold hover:underline">
            Login
          </Link>
        </>
      )}
    </div>
  )
}