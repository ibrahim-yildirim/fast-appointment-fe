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
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinessContext } from "@/features/business/context/BusinessContext"
import { useDeleteService } from "@/features/services/hooks/useDeleteService"
import { useServices } from "@/features/services/hooks/useServices"

export function ServicesListPage() {
  const business = useBusinessContext()
  const { data: services, isLoading } = useServices(business.id)
  const deleteService = useDeleteService(business.id)
  const [search, setSearch] = useState("")

  const filtered = services?.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search services..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <Button asChild>
          <Link to={`/${business.slug}/dashboard/services/new`}>New service</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {service.name}
                  <Badge variant={service.active ? "secondary" : "outline"}>
                    {service.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {service.durationMinutes} min &middot; ${service.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/${business.slug}/dashboard/services/${service.id}/edit`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {service.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This can't be undone. Customers won't be able to book this service
                        anymore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => deleteService.mutate(service.id)}
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
          No services yet.
        </div>
      )}
    </div>
  )
}
