import { useState } from "react"
import { Link } from "react-router-dom"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useServices } from "@/features/services/hooks/useServices"
import { StaffForm } from "@/features/staff-calendar/components/StaffForm"
import { useCreateStaff } from "@/features/staff-calendar/hooks/useCreateStaff"
import { useDeleteStaff } from "@/features/staff-calendar/hooks/useDeleteStaff"
import { useStaff } from "@/features/staff-calendar/hooks/useStaff"
import { useUpdateStaff } from "@/features/staff-calendar/hooks/useUpdateStaff"
import type { Staff } from "@/types"

export function StaffListPage() {
  const business = useBusinessContext()
  const { data: staff, isLoading } = useStaff(business.id)
  const { data: services } = useServices(business.id)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  const createStaff = useCreateStaff(business.id)
  const updateStaff = useUpdateStaff(business.id, editingStaff?.id ?? "")
  const deleteStaff = useDeleteStaff(business.id)

  function openCreate() {
    setEditingStaff(null)
    setDialogOpen(true)
  }

  function openEdit(member: Staff) {
    setEditingStaff(member)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button onClick={openCreate}>Add staff</Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : staff && staff.length > 0 ? (
        <div className="flex flex-col gap-2">
          {staff.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: member.colorTag }}
                />
                <div>
                  <div className="font-medium">{member.name}</div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {member.serviceIds
                      .map((id) => services?.find((service) => service.id === id)?.name)
                      .filter((name): name is string => Boolean(name))
                      .map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/${business.slug}/dashboard/staff/${member.id}/availability`}>
                    Availability
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => openEdit(member)}>
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This can't be undone. They'll no longer be assignable to bookings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => deleteStaff.mutate(member.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          No staff yet.
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit staff" : "Add staff"}</DialogTitle>
          </DialogHeader>
          <StaffForm
            defaultValues={editingStaff ?? undefined}
            services={services ?? []}
            isSubmitting={editingStaff ? updateStaff.isPending : createStaff.isPending}
            submitLabel={editingStaff ? "Save changes" : "Add staff"}
            onSubmit={(values) => {
              if (editingStaff) {
                updateStaff.mutate(values, { onSuccess: () => setDialogOpen(false) })
              } else {
                createStaff.mutate(values, { onSuccess: () => setDialogOpen(false) })
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
