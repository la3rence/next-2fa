import { type NextRequest, NextResponse } from "next/server"
import { getTOTPCodes } from "@/lib/totp-utils"
import { createSupabaseRouteClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseRouteClient()

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
    .select("id, site_name, account_name, color, secret")
    .in("id", siteIds)
    .eq("user_id", session.user.id)

  if (error) {
    return NextResponse.json({ error: "Failed to fetch sites" }, { status: 500 })
  }

  if (!sites || sites.length === 0) {
    return NextResponse.json({ error: "No sites found" }, { status: 404 })
  }

  const codesById = new Map(getTOTPCodes(sites).map((code) => [code.id, code]))
  const codes = siteIds.map((siteId) => codesById.get(siteId)).filter((code) => code !== undefined)

  return NextResponse.json({ codes })
}
