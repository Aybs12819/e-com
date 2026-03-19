"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
  const [defaultTab, setDefaultTab] = useState("login")
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const supabaseClient = supabase

  // Login states
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Add useEffect for countdown timer
  React.useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => {
        setRateLimitCountdown(rateLimitCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [rateLimitCountdown])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if rate limited
    if (rateLimitCountdown > 0) {
      toast({ 
        title: "Rate Limited", 
        description: `Please wait ${rateLimitCountdown} seconds before trying again.`, 
        variant: "destructive" 
      })
      return
    }
    
    console.log("Registration attempt started")
    console.log("Form data:", { email, firstName, lastName, address, mobileNumber, password, confirmPassword })
    
    setLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      console.log("Password mismatch")
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" })
      setLoading(false)
      return
    }

    // Validate required fields
    if (!email || !firstName || !lastName || !address || !mobileNumber || !password) {
      console.log("Missing required fields")
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      setLoading(false)
      return
    }

    console.log("Attempting to create user...")
    // Create user with email confirmation
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          address: address,
          mobile_number: mobileNumber,
          role: 'customer'
        },
        emailRedirectTo: `${window.location.origin}/auth`
      }
    })

    console.log("Supabase response:", { data, error })

    if (error) {
      console.log("Registration error:", error)
      
      // Check for rate limit error
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        toast({ 
          title: "Rate Limit Exceeded", 
          description: "Too many registration attempts. Please wait 60 seconds before trying again.", 
          variant: "destructive" 
        })
        setRateLimitCountdown(60) // Start 60 second countdown
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } else if (data.user && data.user.identities?.length === 0) {
      // User exists but not confirmed
      console.log("User exists but not confirmed")
      toast({ title: "Account Exists", description: "Please check your email to confirm your account", variant: "default" })
      setShowConfirmationMessage(true)
    } else {
      // New user created, show confirmation message
      console.log("New user created successfully")
      toast({ title: "Registration Successful", description: "Please check your email to confirm your account", variant: "default" })
      setShowConfirmationMessage(true)
    }
    
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword
    })

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else if (data.user) {
      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        toast({ title: "Email Not Confirmed", description: "Please check your email and confirm your account before logging in", variant: "destructive" })
        await supabaseClient.auth.signOut()
      } else {
        handleSuccessfulLogin(data.user)
      }
    } else {
      toast({ title: "Error", description: "Login failed. Please check your credentials.", variant: "destructive" })
    }
    
    setLoading(false)
  }

  const handleSuccessfulLogin = async (user: any) => {
    console.log("Logged in user:", user);
    if (user?.user_metadata?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/customer/dashboard")
    }
    router.refresh()
  }

  const handleContinue = () => {
    setShowConfirmationMessage(false)
    setDefaultTab("login")
  }

  // Show confirmation message screen
  if (showConfirmationMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 pt-1 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Image 
                  src="/e-com.png" 
                  alt="E-COM Logo" 
                  width={80} 
                  height={80}
                  className="object-contain opacity-80"
                />
              </div>
              <div className="pt-16 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Confirm Your Email</h2>
                  <p className="text-gray-600 mb-4">
                    We've sent a confirmation email to <span className="font-semibold">{email}</span>
                  </p>
                  <p className="text-gray-500 text-sm mb-6">
                    Please check your inbox and click the confirmation link to activate your account. Then you can login.
                  </p>
                </div>
                
                <Button onClick={handleContinue} className="w-full">
                  Continue
                </Button>
                
                <div className="mt-4 text-sm text-gray-500">
                  Didn't receive the email? Check your spam folder or try registering again.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <footer className="py-8 px-8 mt-auto">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2026 E-COM Group. All rights reserved.</p>
            <p className="mt-2">For educational purposes only, and no copyright infringement is intended.</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 pt-1 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Image 
                src="/e-com.png" 
                alt="E-COM Logo" 
                width={80} 
                height={80}
                className="object-contain opacity-80"
              />
            </div>
            <div className="pt-16">
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Loading..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <Input
                      type="text"
                      placeholder="Complete Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    
                    <Input
                      type="tel"
                      placeholder="Mobile Number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                    
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || rateLimitCountdown > 0}
                    >
                      {loading 
                        ? "Loading..." 
                        : rateLimitCountdown > 0 
                          ? `Please wait ${rateLimitCountdown}s` 
                          : "Register"
                      }
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <footer className="py-8 px-8 mt-auto">
        <div className="text-center text-gray-600 text-sm">
          <p>&copy; 2026 E-COM Group. All rights reserved.</p>
          <p className="mt-2">For educational purposes only, and no copyright infringement is intended.</p>
        </div>
      </footer>
    </div>
  )
}
