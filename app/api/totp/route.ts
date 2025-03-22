import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import * as OTPAuth from "otpauth"

interface TOTPCode {
  id: string
  site_name: string
  account_name?: string
  color?: string
  code: string
  remainingSeconds: number
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get site IDs from request body
  const { siteIds } = await request.json()

  if (!siteIds || !Array.isArray(siteIds)) {
    return NextResponse.json({ error: "Invalid site IDs" }, { status: 400 })
  }

  // Fetch sites data from database
  const { data: sites, error } = await supabase
    .from("totp_sites")
    .select("*")
    .in("id", siteIds)
    .eq("user_id", session.user.id)

  if (error) {
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ error: "No sites found" }, { status: 404 })
  }

  // Generate TOTP codes
  const codes: TOTPCode[] = sites.map((site) => {
    try {
      // Create a new TOTP object
      const totp = new OTPAuth.TOTP({
        issuer: site.site_name,
        label: site.account_name || "",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(site.secret),
      })

      // Generate the current TOTP code
      const code = totp.generate()

      // Calculate remaining seconds
      const now = Math.floor(Date.now() / 1000)
      const timeStep = 30 // Standard TOTP time step
      const remainingSeconds = timeStep - (now % timeStep)

      // Return object without the secret field
      return {
        id: site.id,
        site_name: site.site_name,
        account_name: site.account_name,
        color: site.color,
        code,
        remainingSeconds,
      }
    } catch (error) {
      console.error(`Error generating TOTP for ${site.site_name}:`, error)
      return {
        id: site.id,
        site_name: site.site_name,
        account_name: site.account_name,
        color: site.color,
        code: "ERROR",
        remainingSeconds: 30,
      }
    }
  })

  return NextResponse.json({ codes })
}

