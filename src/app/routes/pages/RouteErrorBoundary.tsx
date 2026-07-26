import { useTranslation } from "react-i18next"
import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function RouteErrorBoundary() {
  const { t } = useTranslation()
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : t("common.errorBody")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">{t("common.errorTitle")}</h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("common.reload")}
        </Button>
        <Button asChild>
          <Link to="/">{t("common.goHome")}</Link>
        </Button>
      </div>
    </div>
  )
}
