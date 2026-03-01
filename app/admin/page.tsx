"use client"

import { I18nProvider } from "@/lib/i18n/context"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <I18nProvider>
      <AdminDashboard />
    </I18nProvider>
  )
}
