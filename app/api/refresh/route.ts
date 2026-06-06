import { type NextRequest, NextResponse } from "next/server"
import { getTOTPCodes } from "@/lib/totp-utils"
import { createSupabaseRouteClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const siteId = formData.get("siteId") as string

  if (!siteId) {
    return NextResponse.json({ error: "Site ID is required" }, { status: 400 })
  }

  const supabase = await createSupabaseRouteClient()

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
    .select("id, site_name, account_name, color, secret")
    .eq("id", siteId)
    .eq("user_id", session.user.id)
    .single()

  if (error || !site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 })
  }

  const [totpCode] = getTOTPCodes([site])

  if (totpCode.code === "ERROR") {
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }

  return NextResponse.json({ code: totpCode.code })
}
