import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import * as OTPAuth from "otpauth"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const siteId = formData.get("siteId") as string

  if (!siteId) {
    return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get the site data
  const { data: site, error } = await supabase
    .from("totp_sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", session.user.id)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 })
  }

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

    return NextResponse.json({ code })
  } catch (error) {
    console.error(`Error generating TOTP for ${site.site_name}:`, error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}

