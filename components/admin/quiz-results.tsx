"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ArrowLeft, LogOut } from "lucide-react"

type Result = {
  id: string
  score: number
  total: number
  completed_at: string
  participants: {
    first_name: string
    last_name: string
    school: string
  }
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
    } catch {
      // error fetching
    } finally {
      setLoading(false)
    }
  }, [quizId, locale])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const avgScore =
    results.length > 0
      ? (
          results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) /
          results.length
        ).toFixed(1)
      : "0"

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-balance">
              {t("results")}: {quizTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                {t("totalParticipants")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{results.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                {t("averageScore")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{avgScore}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">{t("loading")}</p>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t("noResults")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t("participant")}</TableHead>
                    <TableHead>{t("school")}</TableHead>
                    <TableHead className="text-center">{t("score")}</TableHead>
                    <TableHead className="text-right">{t("completedAt")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={result.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {result.participants.last_name}{" "}
                        {result.participants.first_name}
                      </TableCell>
                      <TableCell>{result.participants.school}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={
                            result.score / result.total >= 0.7
                              ? "text-emerald-600 font-semibold"
                              : result.score / result.total >= 0.4
                              ? "text-amber-600 font-semibold"
                              : "text-destructive font-semibold"
                          }
                        >
                          {result.score}/{result.total}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(result.completed_at).toLocaleString(
                          locale === "kk" ? "kk-KZ" : "ru-RU"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
