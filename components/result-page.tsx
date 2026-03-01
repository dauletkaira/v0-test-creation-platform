"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BookOpen, Home, Trophy } from "lucide-react"

function ResultContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get("score") || "0")
  const total = parseInt(searchParams.get("total") || "0")
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  const getResultColor = () => {
    if (percentage >= 70) return "text-emerald-600"
    if (percentage >= 40) return "text-amber-600"
    return "text-destructive"
  }

  const getResultBg = () => {
    if (percentage >= 70) return "bg-emerald-50 border-emerald-200"
    if (percentage >= 40) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">{t("siteName")}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-12">
        <Card className={`text-center ${getResultBg()}`}>
          <CardHeader>
            <div className="mx-auto mb-2">
              <Trophy className={`h-12 w-12 ${getResultColor()}`} />
            </div>
            <CardTitle className="text-2xl">{t("yourResult")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className={`text-6xl font-bold ${getResultColor()}`}>
              {percentage}%
            </div>
            <p className="text-lg text-muted-foreground">
              {score} {t("correct")} {t("of")} {total}
            </p>
            <Button asChild className="mt-4">
              <Link href="/">
                <Home className="h-4 w-4 mr-1" />
                {t("goHome")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense>
      <ResultContent />
    </Suspense>
  )
}
