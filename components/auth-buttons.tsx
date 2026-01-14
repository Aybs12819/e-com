"use client"

import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"

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
            href="/orders" 
            className="font-bold hover:underline"
          >
            <Button variant="ghost" size="icon">
              <Receipt className="h-5 w-5" />
            </Button>
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