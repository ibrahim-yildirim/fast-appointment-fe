import type { Staff } from "@/types"

export const staff: Staff[] = [
  {
    id: "staff-1",
    businessId: "biz-1",
    name: "Elif Kaya",
    email: "elif@isikguzellik.example",
    colorTag: "#525252",
    active: true,
    serviceIds: ["svc-1", "svc-2", "svc-3"],
  },
  {
    id: "staff-2",
    businessId: "biz-1",
    name: "Burak Şahin",
    email: "burak@isikguzellik.example",
    colorTag: "#a3a3a3",
    active: true,
    serviceIds: ["svc-3", "svc-4", "svc-5"],
  },
  {
    id: "staff-3",
    businessId: "biz-2",
    name: "Dr. Selin Aksoy",
    email: "selin.aksoy@zirvedis.example",
    colorTag: "#525252",
    active: true,
    serviceIds: ["svc-6", "svc-7", "svc-8"],
  },
  {
    id: "staff-4",
    businessId: "biz-2",
    name: "Dr. Mert Çelik",
    email: "mert.celik@zirvedis.example",
    colorTag: "#a3a3a3",
    active: true,
    serviceIds: ["svc-7", "svc-9", "svc-10"],
  },
]
