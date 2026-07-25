import { ArrowLeftIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const navigate = useNavigate()

  return (
    <Button variant="ghost" size="icon-sm" aria-label="Back" onClick={() => navigate(-1)}>
      <ArrowLeftIcon className="h-4 w-4" />
    </Button>
  )
}
