import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import SitesList from "@/components/sites-list"

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: sites } = await supabase
    .from("totp_sites")
    .select("*")
    .eq("user_id", session.user.id)
    .order("site_name")

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Manage</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href="/">View Codes</a>
          </Button>
          <Button asChild>
            <a href="/dashboard/add">
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </a>
          </Button>
        </div>
      </div>

      <SitesList sites={sites || []} />
    </div>
  )
}

