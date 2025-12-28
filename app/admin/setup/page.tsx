"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleAdminSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
      },
    })

    if (signUpError) {
      toast({ title: "Setup Error", description: signUpError.message, variant: "destructive" })
      setLoading(false)
      return
    }

    if (data.user) {
      // 2. Update the role to 'admin' in the profiles table
      // Note: In a production app, this should be handled by a secure server action
      // or a restricted RPC call. For initial setup, we update it directly.
      const { error: updateError } = await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id)

      if (updateError) {
        toast({
          title: "Profile Error",
          description: "Account created but role update failed: " + updateError.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Admin Created",
          description: "Admin account created successfully. Please confirm your email before logging in.",
        })
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Admin One-Time Setup</CardTitle>
          <CardDescription>Create the initial administrator account for LinkHabi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminSetup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                placeholder="Administrator Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                type="email"
                placeholder="admin@linkhabi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secure Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "Creating..." : "Initialize Admin Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
