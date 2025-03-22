"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
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
  account_name: string
  secret: string
  color?: string
  created_at: string
}

export default function SitesList({ sites }: { sites: Site[] }) {
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

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
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: site.color || "#7c3aed" }}></div>
              </TableCell>
              <TableCell className="font-medium">{site.site_name}</TableCell>
              <TableCell>{site.account_name}</TableCell>
              <TableCell>{new Date(site.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/edit/${site.id}`)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
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

