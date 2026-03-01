"use client"

import { I18nProvider } from "@/lib/i18n/context"
import ResultPage from "@/components/result-page"

export default function ResultRoute() {
  return (
    <I18nProvider>
      <ResultPage />
    </I18nProvider>
  )
}
