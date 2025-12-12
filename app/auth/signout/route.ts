import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  await supabase.auth.signOut()

  // 确保重定向到正确的URL
  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  return NextResponse.redirect(new URL("/login", redirectUrl))
}
