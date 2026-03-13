"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ArrowLeft, LogOut, BookOpen, Users, TrendingUp, Award, Download } from "lucide-react"

type Result = {
  id: string
  score: number
  total: number
  completed_at: string
  participants: { first_name: string; last_name: string; school: string }
}

export default function QuizResults({ quizId }: { quizId: string }) {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [results, setResults] = useState<Result[]>([])
  const [quizTitle, setQuizTitle] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [resultsRes, quizRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}/results`),
        fetch(`/api/quizzes/${quizId}`),
      ])
      const resultsData = await resultsRes.json()
      const quizData = await quizRes.json()
      setResults(Array.isArray(resultsData) ? resultsData : [])
      setQuizTitle(locale === "kk" ? quizData.title_kk : quizData.title_ru)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [quizId, locale])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const avgScore = results.length > 0
    ? (results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / results.length).toFixed(1)
    : "0"
  const topScore = results.length > 0
    ? Math.max(...results.map(r => Math.round((r.score / r.total) * 100)))
    : 0
  const passCount = results.filter(r => (r.score / r.total) >= 0.6).length

  function getScoreBadge(score: number, total: number) {
    const pct = score / total
    if (pct >= 0.8) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (pct >= 0.6) return "bg-blue-50 text-blue-700 border-blue-200"
    if (pct >= 0.4) return "bg-amber-50 text-amber-700 border-amber-200"
    return "bg-red-50 text-red-700 border-red-200"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-header-bg text-header-foreground shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-header-foreground hover:bg-white/15 hover:text-header-foreground">
              <Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div>
              <p className="text-xs text-white/70 leading-none mb-0.5">{t("viewResults")}</p>
              <h1 className="text-base font-semibold leading-none text-balance line-clamp-1 max-w-xs">
                {quizTitle || "..."}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-header-foreground hover:bg-white/15 hover:text-header-foreground gap-1.5">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-4 py-6 flex-1">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t("totalParticipants")}</p>
              </div>
              <p className="text-2xl font-bold text-primary">{loading ? "—" : results.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{t("averageScore")}</p>
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : `${avgScore}%`}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Лучший результат</p>
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : `${topScore}%`}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Сдали тест (≥60%)</p>
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : passCount}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">{t("loading")}</p>
          </div>
        ) : results.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 bg-muted rounded-full">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium">{t("noResults")}</p>
              <p className="text-sm text-muted-foreground">Участники ещё не прошли этот тест</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("results")} — {results.length} {t("totalParticipants").toLowerCase()}
                </CardTitle>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead>{t("participant")}</TableHead>
                  <TableHead>{t("school")}</TableHead>
                  <TableHead className="text-center">{t("score")}</TableHead>
                  <TableHead className="text-center">%</TableHead>
                  <TableHead className="text-right">{t("completedAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => {
                  const pct = Math.round((result.score / result.total) * 100)
                  return (
                    <TableRow key={result.id} className="hover:bg-muted/20">
                      <TableCell className="text-center text-muted-foreground text-sm">{index + 1}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">
                          {result.participants.last_name} {result.participants.first_name}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{result.participants.school}</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-semibold">{result.score}/{result.total}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-xs ${getScoreBadge(result.score, result.total)}`}>
                          {pct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.completed_at).toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  )
}
