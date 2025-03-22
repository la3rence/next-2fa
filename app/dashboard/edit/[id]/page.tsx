import { redirect, notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SiteForm from "@/components/site-form"

export default async function EditSite({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: site } = await supabase
    .from("totp_sites")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (!site) {
    notFound()
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Site</CardTitle>
            <CardDescription>Update your TOTP site information</CardDescription>
          </CardHeader>
          <CardContent>
            <SiteForm userId={session.user.id} site={site} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

