"use client"

import { I18nProvider } from "@/lib/i18n/context"
import AdminLoginPage from "@/components/admin/admin-login"

export default function AdminLoginRoute() {
  return (
    <I18nProvider>
      <AdminLoginPage />
    </I18nProvider>
  )
}
