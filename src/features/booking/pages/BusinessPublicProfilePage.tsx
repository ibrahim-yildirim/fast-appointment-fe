import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBusinessContext } from "@/features/business/context/BusinessContext"

export function BusinessPublicProfilePage() {
  const business = useBusinessContext()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{business.name}</h1>
        <p className="mt-1 text-muted-foreground">{business.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <span>{business.address}</span>
          <span>{business.phone}</span>
          <span>{business.email}</span>
        </CardContent>
      </Card>

      <Button asChild className="w-fit">
        <Link to={`/${business.slug}/book`}>Book now</Link>
      </Button>
    </div>
  )
}
