import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { resolveLanguage } from "@/i18n"

export function LanguageToggle() {
  const { i18n, t } = useTranslation()
  const language = resolveLanguage(i18n.language)
  const nextLanguage = language === "tr" ? "en" : "tr"

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={nextLanguage === "en" ? t("common.switchToEnglish") : t("common.switchToTurkish")}
      onClick={() => void i18n.changeLanguage(nextLanguage)}
    >
      <span className="text-xs font-semibold">{nextLanguage.toUpperCase()}</span>
    </Button>
  )
}
