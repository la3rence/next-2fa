"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Site {
  id: string
  site_name: string
  account_name?: string | null
  color?: string
  created_at: string
}

function formatCreatedDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Unknown"
  }

  return date.toISOString().slice(0, 10)
}

export default function SitesList({ sites }: { sites: Site[] }) {
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient({ supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY })

  const handleDelete = async () => {
    if (!siteToDelete) return

    await supabase.from("totp_sites").delete().eq("id", siteToDelete)
    router.refresh()
    setSiteToDelete(null)
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No sites added yet</h3>
        <p className="text-muted-foreground mb-6">Add your first site to start generating TOTP codes</p>
        <Button asChild>
          <a href="/dashboard/add">Add Your First Site</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Color</TableHead>
            <TableHead>Site Name</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell>
                <div
                  className="h-6 w-6 rounded-full border border-border ring-1 ring-foreground/15 dark:ring-white/25"
                  style={{ backgroundColor: site.color || "#7c3aed" }}
                ></div>
              </TableCell>
              <TableCell className="font-medium">{site.site_name}</TableCell>
              <TableCell>{site.account_name || <span className="text-muted-foreground">No label</span>}</TableCell>
              <TableCell>
                <time dateTime={site.created_at}>{formatCreatedDate(site.created_at)}</time>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="icon">
                    <Link href={`/dashboard/edit/${site.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <AlertDialog
                    open={siteToDelete === site.id}
                    onOpenChange={(open) => {
                      if (!open) setSiteToDelete(null)
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setSiteToDelete(site.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the TOTP configuration for <strong>{site.site_name}</strong>.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
