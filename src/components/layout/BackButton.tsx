import { ArrowLeftIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Button variant="ghost" size="icon-sm" aria-label={t("common.back")} onClick={() => navigate(-1)}>
      <ArrowLeftIcon className="h-4 w-4" />
    </Button>
  )
}
