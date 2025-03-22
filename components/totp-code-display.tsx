"use client"

import { useState, useEffect } from "react"
import { Clock, RefreshCw, Check, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Site {
  id: string
  site_name: string
  account_name?: string
  color?: string
}

interface TOTPCode extends Site {
  code: string
  remainingSeconds: number
}

export default function TOTPCodeDisplay({ initialSites }: { initialSites: Site[] }) {
  const [codes, setCodes] = useState<TOTPCode[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Function to fetch TOTP codes
  const fetchCodes = async () => {
    try {
      // Extract only the site IDs to send to the API
      const siteIds = initialSites.map((site) => site.id)

      const response = await fetch("/api/totp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ siteIds }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch TOTP codes")
      }

      const data = await response.json()
      setCodes(data.codes)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching TOTP codes:", error)
      setLoading(false)
    }
  }

  // Copy code to clipboard
  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)

      toast({
        title: "Code copied",
        description: "The verification code has been copied to your clipboard.",
        duration: 2000,
      })
    })
  }

  // Initial fetch
  useEffect(() => {
    fetchCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set up timer to update remaining seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCodes((prevCodes) => {
        return prevCodes.map((code) => {
          const newRemainingSeconds = code.remainingSeconds - 1

          // If we reach 0, fetch new codes
          if (newRemainingSeconds <= 0) {
            fetchCodes()
            return code
          }

          return {
            ...code,
            remainingSeconds: newRemainingSeconds,
          }
        })
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Set up auto-refresh every 5 seconds
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      fetchCodes()
    }, 5000)

    return () => clearInterval(refreshTimer)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading 2FA codes...</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {codes.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
          onClick={() => copyToClipboard(item.code, item.id)}
          style={{ borderColor: item.color || "#7c3aed" }}
        >
          <CardHeader className="pb-2 px-4 pt-4 h-[76px]">
            <CardTitle className="truncate">{item.site_name}</CardTitle>
            {item.account_name ? (
              <CardDescription className="truncate">{item.account_name}</CardDescription>
            ) : (
              <div className="h-5" aria-hidden="true"></div> // Empty space placeholder with the same height
            )}
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="text-3xl font-mono tracking-wider text-center py-2 font-bold relative group">
              {item.code.match(/.{1,3}/g)?.join(" ")}
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                {copiedId === item.id ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
              </div>
            </div>
          </CardContent>
          <CardFooter
            className="flex justify-between items-center py-0 px-4 h-10"
            style={{ backgroundColor: item.color || "#7c3aed", color: "#ffffff" }}
          >
            <div className="flex items-center h-full text-xs font-medium">
              <Clock className="mr-1 h-3 w-3" />
              <span>{item.remainingSeconds}s</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 p-0 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                fetchCodes()
              }}
            >
              <RefreshCw className="h-3 w-3" />
              <span className="sr-only">Refresh</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

