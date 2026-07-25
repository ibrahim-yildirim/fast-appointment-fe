import type { Staff } from "@/types"

export const staff: Staff[] = [
  {
    id: "staff-1",
    businessId: "biz-1",
    name: "Ava Martinez",
    email: "ava@glowsalon.example",
    colorTag: "#525252",
    serviceIds: ["svc-1", "svc-2", "svc-3"],
  },
  {
    id: "staff-2",
    businessId: "biz-1",
    name: "Liam Chen",
    email: "liam@glowsalon.example",
    colorTag: "#a3a3a3",
    serviceIds: ["svc-3", "svc-4", "svc-5"],
  },
  {
    id: "staff-3",
    businessId: "biz-2",
    name: "Dr. Sarah Kim",
    email: "sarah.kim@peakdental.example",
    colorTag: "#525252",
    serviceIds: ["svc-6", "svc-7", "svc-8"],
  },
  {
    id: "staff-4",
    businessId: "biz-2",
    name: "Dr. James Wu",
    email: "james.wu@peakdental.example",
    colorTag: "#a3a3a3",
    serviceIds: ["svc-7", "svc-9", "svc-10"],
  },
]
