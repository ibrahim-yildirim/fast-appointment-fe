export const MOBILE_PHONE_PATTERN = /^5\d{9}$/
export const BUSINESS_PHONE_PATTERN = /^[2-5]\d{9}$/

export function toPhoneDigits(value: string | null | undefined): string {
  let digits = (value ?? "").replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  if (digits.startsWith("90") && digits.length > 10) digits = digits.slice(2)
  if (digits.startsWith("0")) digits = digits.slice(1)
  return digits.slice(0, 10)
}

export function formatPhone(value: string | null | undefined): string {
  const digits = toPhoneDigits(value)
  if (digits.length !== 10) return value ?? ""
  return `+90 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`
}

export function phoneHref(value: string | null | undefined): string {
  const digits = toPhoneDigits(value)
  return digits.length === 10 ? `tel:+90${digits}` : `tel:${value ?? ""}`
}
