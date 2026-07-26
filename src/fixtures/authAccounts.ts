export type AuthAccount =
  | { role: "customer"; email: string; password: string; actorId: string }
  | {
      role: "business_owner"
      email: string
      password: string
      actorId: string
      businessId: string
    }

export const authAccounts: AuthAccount[] = [
  { role: "customer", email: "zeynep.demir@example.com", password: "password123", actorId: "cust-1" },
  { role: "customer", email: "ahmet.yildiz@example.com", password: "password123", actorId: "cust-2" },
  { role: "customer", email: "merve.arslan@example.com", password: "password123", actorId: "cust-3" },
  {
    role: "business_owner",
    email: "ayse@isikguzellik.example",
    password: "password123",
    actorId: "owner-1",
    businessId: "biz-1",
  },
  {
    role: "business_owner",
    email: "emre@zirvedis.example",
    password: "password123",
    actorId: "owner-2",
    businessId: "biz-2",
  },
]
