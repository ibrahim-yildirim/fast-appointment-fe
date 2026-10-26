import type { Business, BusinessHours } from "@/types"

function weeklyHours(includeSaturday: boolean): BusinessHours[] {
  return [
    { day: "mon", enabled: true, start: "09:00", end: "17:00" },
    { day: "tue", enabled: true, start: "09:00", end: "17:00" },
    { day: "wed", enabled: true, start: "09:00", end: "17:00" },
    { day: "thu", enabled: true, start: "09:00", end: "17:00" },
    { day: "fri", enabled: true, start: "09:00", end: "17:00" },
    { day: "sat", enabled: includeSaturday, start: "10:00", end: "14:00" },
    { day: "sun", enabled: false, start: "09:00", end: "17:00" },
  ]
}

export const businesses: Business[] = [
  {
    id: "biz-1",
    slug: "isik-guzellik",
    name: "Işık Kuaför & Güzellik",
    description: "Saç, renk ve cilt bakımında tam kapsamlı hizmet veren güzellik salonu.",
    timezone: "Europe/Istanbul",
    address: "Bağdat Caddesi No: 128, Kadıköy / İstanbul",
    city: "İstanbul",
    phone: "+90 216 555 0142",
    email: "merhaba@isikguzellik.example",
    defaultHours: weeklyHours(true),
    createdAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "biz-2",
    slug: "zirve-dis",
    name: "Zirve Ağız ve Diş Sağlığı",
    description: "Tüm aile için genel ve estetik diş hekimliği.",
    timezone: "Europe/Istanbul",
    address: "Atatürk Bulvarı No: 44, Çankaya / Ankara",
    city: "Ankara",
    phone: "+90 312 555 0198",
    email: "iletisim@zirvedis.example",
    defaultHours: weeklyHours(false),
    createdAt: "2026-02-03T09:00:00.000Z",
  },
]
