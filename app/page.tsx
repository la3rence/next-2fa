import { redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import TOTPCodeDisplay from "@/components/totp-code-display"
import { getTOTPCodes } from "@/lib/totp-utils"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export default async function Home() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: sites } = await supabase
    .from("totp_sites")
    .select("id, site_name, account_name, color, secret")
    .eq("user_id", session.user.id)
    .order("site_name")

  const codes = getTOTPCodes(sites || [])

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">2FA Codes</h1>
        <Button asChild>
          <a href="/dashboard">Manage</a>
        </Button>
      </div>

      {codes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">You haven't added any sites yet.</p>
          <Button asChild>
            <a href="/dashboard">Add Your First Site</a>
          </Button>
        </div>
      ) : (
        <TOTPCodeDisplay initialCodes={codes} />
      )}
    </div>
  )
}
