"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Video, BarChart3, Pencil, Trash2, LogOut } from "lucide-react"

type Quiz = {
  id: string
  title_ru: string
  title_kk: string
  type: "text" | "video"
  questions_count: number
  created_at: string
}

export default function AdminDashboard() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/quizzes")
      const data = await res.json()
      setQuizzes(data)
    } catch {
      // error fetching
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return
    await fetch(`/api/quizzes/${id}`, { method: "DELETE" })
    fetchQuizzes()
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const getTitle = (quiz: Quiz) =>
    locale === "kk" ? quiz.title_kk : quiz.title_ru

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">{t("adminPanel")}</h1>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("quizzes")}</h2>
          <Button asChild>
            <Link href="/admin/quizzes/new">
              <Plus className="h-4 w-4 mr-1" />
              {t("createQuiz")}
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">{t("loading")}</p>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">{t("noQuizzes")}</p>
              <Button asChild>
                <Link href="/admin/quizzes/new">
                  <Plus className="h-4 w-4 mr-1" />
                  {t("createQuiz")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("quizzes")} ({quizzes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("quizTitle")}</TableHead>
                    <TableHead>{t("quizType")}</TableHead>
                    <TableHead className="text-center">{t("questionsCount")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">
                        {getTitle(quiz)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          {quiz.type === "text" ? (
                            <FileText className="h-3 w-3" />
                          ) : (
                            <Video className="h-3 w-3" />
                          )}
                          {quiz.type === "text" ? t("textBased") : t("videoBased")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {quiz.questions_count}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/quizzes/${quiz.id}/results`}>
                              <BarChart3 className="h-4 w-4" />
                              <span className="sr-only">{t("viewResults")}</span>
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">{t("edit")}</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">{t("delete")}</span>
                          </Button>
                        </div>
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
