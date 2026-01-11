"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function AdminSetupConfirmPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003DA5] to-[#001F3F] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-[#001F3F] mb-3">Confirm Your Email</h1>
        <p className="text-gray-600 mb-6">
          A confirmation email has been sent to your address. Please check your inbox and click the
          confirmation link to activate your admin account.
        </p>
        <Button onClick={() => router.push("/auth")} className="w-full bg-[#003DA5] hover:bg-[#002580] text-white">
          Go to Login
        </Button>
      </Card>
    </div>
  )
}