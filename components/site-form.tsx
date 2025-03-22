"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Site {
  id: string
  site_name: string
  account_name?: string
  secret: string
  color?: string
}

export default function SiteForm({
  userId,
  site,
}: {
  userId: string
  site?: Site
}) {
  const [siteName, setSiteName] = useState(site?.site_name || "")
  const [accountName, setAccountName] = useState(site?.account_name || "")
  const [secret, setSecret] = useState(site?.secret || "")
  const [color, setColor] = useState(site?.color || "#7c3aed") // Default to a purple color
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Basic validation - only site name and secret are required
    if (!siteName.trim() || !secret.trim()) {
      setError("Site name and secret key are required")
      setLoading(false)
      return
    }

    // Remove spaces from secret
    const cleanedSecret = secret.replace(/\s+/g, "")

    try {
      if (site) {
        // Update existing site
        const { error: updateError } = await supabase
          .from("totp_sites")
          .update({
            site_name: siteName,
            account_name: accountName || null, // Allow null for account_name
            secret: cleanedSecret,
            color: color,
          })
          .eq("id", site.id)

        if (updateError) throw updateError
      } else {
        // Insert new site
        const { error: insertError } = await supabase.from("totp_sites").insert({
          user_id: userId,
          site_name: siteName,
          account_name: accountName || null, // Allow null for account_name
          secret: cleanedSecret,
          color: color,
        })

        if (insertError) throw insertError
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="site-name">
          Site Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="site-name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="Google, GitHub, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-name">Account Name/Username (Optional)</Label>
        <Input
          id="account-name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secret">
          TOTP Secret Key <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="secret"
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter the secret key provided by the site"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showSecret ? "Hide" : "Show"} secret</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          This is the secret key provided when setting up 2FA. It's usually a string of letters and numbers.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Theme Color</Label>
        <div className="flex gap-3 items-center">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#000000"
            className="flex-1"
            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          />
        </div>
        <p className="text-sm text-muted-foreground">Choose a color to identify this site on your dashboard.</p>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : site ? "Update Site" : "Add Site"}
        </Button>
      </div>
    </form>
  )
}

