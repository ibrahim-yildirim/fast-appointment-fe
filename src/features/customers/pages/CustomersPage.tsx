import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AddCustomerDialog } from "@/features/customers/components/AddCustomerDialog"
import { useCustomers } from "@/features/customers/hooks/useCustomers"
import { formatPhone, phoneHref } from "@/lib/phone"

export function CustomersPage() {
  const { t } = useTranslation()
  const { data: customers, isLoading } = useCustomers()
  const [search, setSearch] = useState("")
  // Bumped on every open so the dialog mounts with a fresh form.
  const [dialogKey, setDialogKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)

  const query = search.trim().toLocaleLowerCase("tr")
  const digits = query.replace(/\D/g, "")
  const visible = (customers ?? [])
    .filter(
      (customer) =>
        !query ||
        customer.name.toLocaleLowerCase("tr").includes(query) ||
        (digits.length > 0 && customer.phone.replace(/\D/g, "").includes(digits)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "tr"))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{t("customers.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("customers.hint")}</p>
        </div>
        <Button
          onClick={() => {
            setDialogKey((key) => key + 1)
            setDialogOpen(true)
          }}
        >
          {t("customers.add")}
        </Button>
      </div>

      <Input
        className="max-w-sm"
        placeholder={t("customers.search")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : visible.length > 0 ? (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {visible.map((customer) => (
            <div
              key={customer.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
            >
              <span className="font-medium">{customer.name}</span>
              <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                {customer.phone && (
                  <a href={phoneHref(customer.phone)}>{formatPhone(customer.phone)}</a>
                )}
                {customer.email && <span>{customer.email}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {query ? t("customers.noMatch") : t("customers.empty")}
        </p>
      )}

      <AddCustomerDialog key={dialogKey} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
