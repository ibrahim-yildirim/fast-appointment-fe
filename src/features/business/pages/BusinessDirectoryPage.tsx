import { CalendarCheck } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { BackButton } from "@/components/layout/BackButton"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinesses } from "@/features/business/hooks/useBusinesses"

export function BusinessDirectoryPage() {
  const { t } = useTranslation()
  const { data: businesses, isLoading } = useBusinesses()

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <BackButton />
          <Link to="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <CalendarCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
            <span className="truncate">{t("common.appName")}</span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold">{t("directory.title")}</h1>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : businesses && businesses.length > 0 ? (
          <div className="flex flex-col gap-3">
            {businesses.map((business) => (
              <Card key={business.id}>
                <CardHeader>
                  <CardTitle>{business.name}</CardTitle>
                  <CardDescription>{business.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">{business.address}</span>
                  <Button asChild>
                    <Link to={`/${business.slug}/book`}>{t("booking.book")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
            {t("directory.empty")}
          </div>
        )}
      </main>
    </>
  )
}
