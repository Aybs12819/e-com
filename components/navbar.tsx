"use client"

import Link from "next/link"
import { Search, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { LogoutButton } from "@/components/logout-button"
import { AuthButtons } from "@/components/auth-buttons"
import { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    const fetchCartItemCount = async () => {
      const { data: { user: fetchedUser } } = await supabase.auth.getUser()
      setUser(fetchedUser)

      if (fetchedUser) {
        const { data: cartItems, error } = await supabase
          .from("cart_items")
          .select("quantity")
          .eq("user_id", fetchedUser.id)

        if (error) {
          console.error("Error fetching cart items:", error)
          setCartItemCount(0)
        } else {
          const totalQuantity = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
          setCartItemCount(totalQuantity)
        }
      } else {
        setCartItemCount(0)
      }
    }

    fetchCartItemCount()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        fetchCartItemCount()
      }
    )

    const cartItemsSubscription = supabase
      .channel('cart_items_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items' },
        (payload) => {
          console.log('Change received!', payload)
          fetchCartItemCount()
        }
      )
      .subscribe()

    return () => {
      authListener.subscription?.unsubscribe()
      cartItemsSubscription.unsubscribe()
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-xs opacity-90">
          <div className="flex gap-4">
            <Link href="#" className="hover:underline">
              Seller Centre
            </Link>
            <Link href="#" className="hover:underline">
              Download
            </Link>
            <Link href="#" className="hover:underline">
              Follow us on
            </Link>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline">
              Notifications
            </Link>
            <Link href="#" className="hover:underline">
              Help
            </Link>
            {user ? <LogoutButton /> : <AuthButtons />}
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex items-center gap-8 py-4">
          <Link href="/customer/dashboard" className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
            <div className="rounded bg-accent p-1 text-accent-foreground">LH</div>
            <span>LinkHabi</span>
          </Link>

          <div className="relative flex-1">
            <Input
              className="h-10 bg-white pr-12 text-black placeholder:text-gray-500"
              placeholder="Search for heritage products..."
            />
            <Button size="icon" className="absolute right-1 top-1 h-8 w-10 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative transition-transform hover:scale-110">
              <ShoppingCart className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {cartItemCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
