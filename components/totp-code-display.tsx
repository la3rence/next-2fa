"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Clock, RefreshCw, Check, Copy } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import type { TOTPCode } from "@/lib/totp-utils"
import { cn } from "@/lib/utils"

const DEFAULT_SITE_COLOR = "#7c3aed"

function normalizeHexColor(color?: string | null) {
  if (!color) {
    return DEFAULT_SITE_COLOR
  }

  const trimmedColor = color.trim()
  const shortHexMatch = /^#([a-f\d])([a-f\d])([a-f\d])$/i.exec(trimmedColor)

  if (shortHexMatch) {
    return `#${shortHexMatch[1]}${shortHexMatch[1]}${shortHexMatch[2]}${shortHexMatch[2]}${shortHexMatch[3]}${shortHexMatch[3]}`
  }

  return /^#[a-f\d]{6}$/i.test(trimmedColor) ? trimmedColor : DEFAULT_SITE_COLOR
}

function hexToRgb(color: string) {
  const normalizedColor = normalizeHexColor(color)
  const value = Number.parseInt(normalizedColor.slice(1), 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function getRelativeLuminance(color: string) {
  const { r, g, b } = hexToRgb(color)
  const [red, green, blue] = [r, g, b].map((value) => {
    const channel = value / 255

    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function isDarkSiteColor(color: string | null | undefined) {
  return getRelativeLuminance(normalizeHexColor(color)) < 0.08
}

function getFooterColors(color: string | null | undefined) {
  const baseColor = normalizeHexColor(color)
  const textColor = getRelativeLuminance(baseColor) > 0.5 ? "#111827" : "#ffffff"

  return {
    backgroundColor: baseColor,
    borderColor: "rgba(255, 255, 255, 0.18)",
    color: textColor,
  }
}

function getCardChrome(color: string | null | undefined) {
  const baseColor = normalizeHexColor(color)

  return {
    borderColor: baseColor,
  }
}

export default function TOTPCodeDisplay({ initialCodes }: { initialCodes: TOTPCode[] }) {
  const [codes, setCodes] = useState<TOTPCode[]>(initialCodes)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const inFlightFetch = useRef<Promise<void> | null>(null)
  const siteIds = useMemo(() => initialCodes.map((site) => site.id), [initialCodes])

  // Function to fetch TOTP codes
  const fetchCodes = useCallback(async () => {
    if (inFlightFetch.current) {
      return inFlightFetch.current
    }

    const request = (async () => {
      try {
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
      } finally {
        inFlightFetch.current = null
      }
    })()

    inFlightFetch.current = request
    return request
  }, [siteIds])

  useEffect(() => {
    setCodes(initialCodes)
  }, [initialCodes])

  // Set up timer to update remaining seconds and refresh once per TOTP period.
  useEffect(() => {
    const timer = setInterval(() => {
      setCodes((prevCodes) => {
        if (prevCodes.length === 0) {
          return prevCodes
        }

        const nextRemainingSeconds = Math.min(...prevCodes.map((code) => code.remainingSeconds)) - 1

        if (nextRemainingSeconds <= 0) {
          void fetchCodes()

          return prevCodes.map((code) => ({
            ...code,
            remainingSeconds: 0,
          }))
        }

        return prevCodes.map((code) => ({
          ...code,
          remainingSeconds: Math.max(code.remainingSeconds - 1, 0),
        }))
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fetchCodes])

  useEffect(() => {
    return () => {
      inFlightFetch.current = null
    }
  }, [])

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

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading 2FA codes...</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {codes.map((item) => {
        const footerColors = getFooterColors(item.color)
        const cardChrome = getCardChrome(item.color)
        const hasDarkSiteColor = isDarkSiteColor(item.color)

        return (
          <Card
            key={item.id}
            className={cn(
              "overflow-hidden cursor-pointer border-2 ring-1 ring-border/80 transition-all hover:shadow-md dark:ring-white/15",
              hasDarkSiteColor && "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.52),0_0_0_4px_rgba(255,255,255,0.16)]"
            )}
            onClick={() => copyToClipboard(item.code, item.id)}
            style={cardChrome}
          >
            <CardHeader className="h-[58px] px-4 pb-1 pt-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <CardTitle className="min-w-0 flex-1 truncate pr-2">{item.site_name}</CardTitle>
                {item.account_name ? (
                  <CardDescription className="max-w-[46%] shrink-0 truncate pt-0.5 text-right">
                    {item.account_name}
                  </CardDescription>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="text-3xl font-mono tracking-wider text-center pb-3 pt-1 font-bold relative group">
                {item.code.match(/.{1,3}/g)?.join(" ")}
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  {copiedId === item.id ? <Check className="h-6 w-6 text-green-500" /> : <Copy className="h-6 w-6" />}
                </div>
              </div>
            </CardContent>
            <CardFooter
              className={cn(
                "flex justify-between items-center py-0 px-4 h-10 border-t",
                hasDarkSiteColor && "dark:border-white/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.36)]"
              )}
              style={footerColors}
            >
              <div className="flex items-center h-full text-xs font-medium">
                <Clock className="mr-1 h-3 w-3" />
                <span>{item.remainingSeconds}s</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 hover:bg-white/20"
                style={{ color: footerColors.color }}
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
        )
      })}
    </div>
  )
}
