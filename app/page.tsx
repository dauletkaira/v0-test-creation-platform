"use client"

import { I18nProvider } from "@/lib/i18n/context"
import HomePage from "@/components/home-page"

export default function Page() {
  return (
    <I18nProvider>
      <HomePage />
    </I18nProvider>
  )
}
