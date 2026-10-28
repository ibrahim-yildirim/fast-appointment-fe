import { Input } from "@/components/ui/input"
import { toPhoneDigits } from "@/lib/phone"
import { cn } from "@/lib/utils"

export function PhoneInput({
  className,
  onChange,
  placeholder = "5XX XXX XX XX",
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground"
      >
        +90
      </span>
      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder={placeholder}
        className="pl-10 tabular-nums"
        onChange={(event) => {
          event.target.value = toPhoneDigits(event.target.value)
          onChange?.(event)
        }}
        {...props}
      />
    </div>
  )
}
