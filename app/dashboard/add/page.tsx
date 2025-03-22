import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SiteForm from "@/components/site-form"

export default async function AddSite() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Site</CardTitle>
            <CardDescription>Add a new website or service for TOTP code generation</CardDescription>
          </CardHeader>
          <CardContent>
            <SiteForm userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

