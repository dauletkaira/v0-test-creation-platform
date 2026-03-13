"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BookOpen, Lock } from "lucide-react"

export default function AdminLoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) { router.push("/admin"); router.refresh() }
      else setError(t("invalidCredentials"))
    } catch { setError(t("invalidCredentials")) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top stripe */}
      <div className="h-1 bg-primary w-full" />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo area */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">PIRLS Bilim</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("siteDescription")}</p>
          </div>

          <Card className="shadow-md border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t("adminLogin")}</CardTitle>
                  <CardDescription className="mt-0.5">
                    Введите учётные данные администратора
                  </CardDescription>
                </div>
                <div className="p-2 bg-muted rounded-lg">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username" className="text-sm font-medium">{t("username")}</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("username")}
                    autoComplete="username"
                    className="h-10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="text-sm font-medium">{t("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-10"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                    <p className="text-sm text-destructive text-center">{error}</p>
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full h-10 mt-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                      {t("loading")}
                    </span>
                  ) : t("login")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  )
}
