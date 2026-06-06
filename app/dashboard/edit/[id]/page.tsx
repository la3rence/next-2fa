import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, KeyRound } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import SiteForm from "@/components/site-form"
import { createSupabaseServerClient } from "@/lib/supabase-server"

function formatCreatedDate(value?: string | null) {
  if (!value) {
    return "Unknown"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  return date.toISOString().slice(0, 10)
}

export default async function EditSite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: site } = await supabase
    .from("totp_sites")
    .select("id, site_name, account_name, secret, color, created_at")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single()

  if (!site) {
    notFound()
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Manage
            </Link>
          </Button>
          <h1 className="truncate text-2xl font-bold">Edit Key Configuration</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update the saved TOTP settings for this account.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <Eye className="mr-2 h-4 w-4" />
            View Codes
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{site.site_name}</CardTitle>
            <CardDescription>Edit the site name, account label, secret key, and card theme color.</CardDescription>
          </CardHeader>
          <CardContent>
            <SiteForm userId={session.user.id} site={site} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" />
              Current Details
            </CardTitle>
            <CardDescription>Summary for the selected key.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Theme</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-5 w-5 rounded-full border border-border ring-1 ring-foreground/15 dark:ring-white/25"
                  style={{ backgroundColor: site.color || "#7c3aed" }}
                />
                <span className="font-mono text-xs">{site.color || "#7c3aed"}</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-muted-foreground">Account</span>
              <p className="break-words font-medium">{site.account_name || "No account label"}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <span className="text-muted-foreground">Created</span>
              <p className="font-medium">{formatCreatedDate(site.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
