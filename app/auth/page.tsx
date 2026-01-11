"use client"

import type React from "react"

import { Checkbox } from "@/components/ui/checkbox"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabaseClient = supabase
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false); // New state for email OTP
  const [isInitialRegistrationComplete, setIsInitialRegistrationComplete] = useState(false); // New state variable

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (registrationMethod === 'email') {
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          data: { role: 'customer' },
        },
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        setIsEmailOtpSent(true);
        toast({ title: "Success", description: "OTP sent to your email." })
      }
    } else if (registrationMethod === 'phone') {
      const { error } = await supabaseClient.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          data: { role: 'customer' }, // Only role is set initially
        },
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        setIsOtpSent(true);
        toast({ title: "Success", description: "OTP sent to your phone." })
      }
    }
    setLoading(false)
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let otpVerificationResult;

    if (registrationMethod === 'email') {
      otpVerificationResult = await supabaseClient.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email',
      });
    } else if (registrationMethod === 'phone') {
      otpVerificationResult = await supabaseClient.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });
    } else {
      toast({ title: 'Error', description: 'Invalid registration method for OTP verification.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const { data, error } = otpVerificationResult;

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data.user) {
      setIsInitialRegistrationComplete(true); // OTP verified, allow to fill rest of the form
      toast({ title: "Success", description: "Verification successful. Please complete your profile." });
    } else {
      toast({ title: "Error", description: "OTP verification failed or user not found.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabaseClient.auth.updateUser({
      password: password,
      data: { first_name: firstName, middle_name: middleName, last_name: lastName, birthdate: birthdate, address: address, role: 'customer' },
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Automatically sign in the user after profile completion
      let signInOptions: { email: string; password: string } | { phone: string; password: string };

      if (registrationMethod === 'email') {
        signInOptions = { email: email, password: password };
      } else {
        signInOptions = { phone: phoneNumber, password: password };
      }

      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword(signInOptions);

      if (signInError) {
        toast({ title: "Error", description: signInError.message, variant: "destructive" });
      } else if (signInData.user) {
        toast({ title: "Success", description: "Account created successfully! Redirecting to dashboard." });
        handleSuccessfulLogin(signInData.user); // Redirect to appropriate dashboard
      } else {
        toast({ title: "Success", description: "Account created successfully! Please log in." });
        router.push("/auth"); // Fallback to login if auto-signin fails
      }
    }
    setLoading(false);
  };

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
const [loginIdentifier, setLoginIdentifier] = useState('');
const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let signInResult;
    if (loginIdentifier.includes('@')) {
      // Email login
      signInResult = await supabaseClient.auth.signInWithPassword({ email: loginIdentifier, password })
    } else { // Phone login (now only with password)
      signInResult = await supabaseClient.auth.signInWithPassword({ phone: loginIdentifier, password });
    }

    const { data, error } = signInResult;

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else if (data.user) {
      handleSuccessfulLogin(data.user);
    } else {
      toast({ title: "Error", description: "Login failed. Please check your credentials.", variant: "destructive" });
    }
    setLoading(false)
  }

  const handleSuccessfulLogin = async (user: any) => {
    // Check if the user is an admin
    console.log("Logged in user:", user);
    if (user?.user_metadata?.role === "admin") {
      router.push("/admin")
    } else if (user?.user_metadata?.role === "logistics") {
      router.push("/logistics/dashboard")
    } else if (user?.user_metadata?.role === "rider") {
      router.push("/rider/deliveries")
    } else {
      router.push("/customer/dashboard")
    }
    router.refresh()
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">LinkHabi</CardTitle>
          <CardDescription>Experience Mapita's Heritage</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4 pt-4">
              <Input
                type="text"
                placeholder="Email or Phone"
                value={loginIdentifier}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('@')) {
                    // If it contains '@', treat as email, allow all characters
                    setLoginIdentifier(value);
                  } else if (value.length === 0) {
                    setLoginIdentifier('');
                  } else if (value.startsWith('+')) {
                    // If '+' is present, respect user's input for the prefix
                    setLoginIdentifier(value.replace(/[^\d+]/g, ''));
                  } else if (/^\d/.test(value)) {
                    // If it starts with a digit and no '+', prepend '+63'
                    setLoginIdentifier('+63' + value.replace(/[^\d]/g, ''));
                  } else {
                    // If it doesn't start with a phone character, allow all characters (for potential email input)
                    setLoginIdentifier(value);
                  }
                }}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Login"}
              </Button>
            </form>
          </TabsContent>
            <TabsContent value="register">
              <Tabs defaultValue="email" onValueChange={(value) => setRegistrationMethod(value as 'email' | 'phone')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  {!isEmailOtpSent ? (
                    <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Send OTP"}
                      </Button>
                    </form>
                  ) : !isInitialRegistrationComplete ? (
                    <form onSubmit={handleOtpVerification} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Enter OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Verify OTP"}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleCompleteProfile} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName">First Name <span className="text-red-500">*</span></label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="middleName">Middle Name <span className="text-red-500">*</span></label>
                        <Input
                          id="middleName"
                          type="text"
                          placeholder="Middle Name"
                          value={middleName}
                          onChange={(e) => setMiddleName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName">Last Name <span className="text-red-500">*</span></label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="birthdate">Birthdate <span className="text-red-500">*</span></label>
                        <Input
                          id="birthdate"
                          type="date"
                          placeholder="Birthdate"
                          value={birthdate}
                          onChange={(e) => setBirthdate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="address">Address <span className="text-red-500">*</span></label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="password">Password <span className="text-red-500">*</span></label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : "Complete Registration"}
                      </Button>
                    </form>
                  )}
                </TabsContent>
                  <TabsContent value="phone">
                    {!isOtpSent ? (
                      <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Input
                            type="tel"
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!value.startsWith('+63')) {
                                setPhoneNumber('+63' + value.replace(/\D/g, ''));
                              } else {
                                setPhoneNumber(value);
                              }
                            }}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Loading..." : "Send OTP"}
                        </Button>
                      </form>
                    ) : !isInitialRegistrationComplete ? (
                      <form onSubmit={handleOtpVerification} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Loading..." : "Verify OTP"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleCompleteProfile} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Middle Name (Optional)"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            placeholder="Birthdate"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Loading..." : "Complete Registration"}
                        </Button>
                      </form>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
