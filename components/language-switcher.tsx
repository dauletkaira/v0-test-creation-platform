"use client"

import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={locale === "ru" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLocale("ru")}
        className="text-xs px-2 h-7"
      >
        {t("russian")}
      </Button>
      <Button
        variant={locale === "kk" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLocale("kk")}
        className="text-xs px-2 h-7"
      >
        {t("kazakh")}
      </Button>
    </div>
  )
}
