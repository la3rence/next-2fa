import { NextResponse } from "next/server"
import { createSupabaseRouteClient } from "@/lib/supabase-server"

export async function POST() {
  const supabase = await createSupabaseRouteClient()
  await supabase.auth.signOut()

  // 确保重定向到正确的URL
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return NextResponse.redirect(new URL("/login", redirectUrl))
}
