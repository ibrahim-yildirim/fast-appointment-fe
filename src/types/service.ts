export type Service = {
  id: string
  businessId: string
  name: string
  description: string
  durationMinutes: number
  price: number
  active: boolean
  eligibleStaffIds: string[]
}
