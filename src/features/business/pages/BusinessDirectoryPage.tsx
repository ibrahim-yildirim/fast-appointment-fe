import { CalendarCheck, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { BackButton } from "@/components/layout/BackButton"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useBusinesses } from "@/features/business/hooks/useBusinesses"
import { cities } from "@/lib/constants"

const ALL_CITIES = "all"

export function BusinessDirectoryPage() {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [city, setCity] = useState(ALL_CITIES)
  const { data: allBusinesses, isLoading } = useBusinesses()
  const isFiltered = name.trim() !== "" || city !== ALL_CITIES

  const businesses = useMemo(() => {
    const needle = name.trim().toLocaleLowerCase("tr")
    return allBusinesses?.filter(
      (business) =>
        business.name.toLocaleLowerCase("tr").includes(needle) &&
        (city === ALL_CITIES || business.city === city),
    )
  }, [allBusinesses, name, city])

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
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("directory.searchPlaceholder")}
              aria-label={t("directory.searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger aria-label={t("directory.city")} className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CITIES}>{t("directory.allCities")}</SelectItem>
              {cities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                  <span className="text-sm text-muted-foreground">
                    {business.city ? `${business.city} · ${business.address}` : business.address}
                  </span>
                  <Button asChild>
                    <Link to={`/${business.slug}/book`}>{t("booking.book")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
            {isFiltered ? t("directory.noResults") : t("directory.empty")}
          </div>
        )}
      </main>
    </>
  )
}
