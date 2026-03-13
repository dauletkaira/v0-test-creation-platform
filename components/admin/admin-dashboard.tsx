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
import { Plus, FileText, Video, BarChart3, Pencil, Trash2, LogOut, BookOpen, LayoutDashboard } from "lucide-react"

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
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchQuizzes() }, [fetchQuizzes])

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

  const getTitle = (quiz: Quiz) => locale === "kk" ? quiz.title_kk : quiz.title_ru

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-header-bg text-header-foreground shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/15 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-white/70 leading-none mb-0.5">PIRLS Bilim</p>
              <h1 className="text-base font-semibold leading-none">{t("adminPanel")}</h1>
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
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{t("quizzes")}</p>
              <p className="text-2xl font-bold text-primary">{loading ? "—" : quizzes.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{t("textBased")}</p>
              <p className="text-2xl font-bold">{loading ? "—" : quizzes.filter(q => q.type === "text").length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{t("videoBased")}</p>
              <p className="text-2xl font-bold">{loading ? "—" : quizzes.filter(q => q.type === "video").length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">{t("questionsCount")}</p>
              <p className="text-2xl font-bold">{loading ? "—" : quizzes.reduce((s, q) => s + (q.questions_count || 0), 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table heading */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">{t("quizzes")}</h2>
          </div>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/quizzes/new">
              <Plus className="h-4 w-4" />
              {t("createQuiz")}
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">{t("loading")}</p>
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 bg-muted rounded-full">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium mb-1">{t("noQuizzes")}</p>
                <p className="text-sm text-muted-foreground mb-4">Создайте первый тест для участников</p>
              </div>
              <Button asChild>
                <Link href="/admin/quizzes/new">
                  <Plus className="h-4 w-4 mr-1.5" />
                  {t("createQuiz")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold">{t("quizTitle")}</TableHead>
                  <TableHead className="font-semibold">{t("quizType")}</TableHead>
                  <TableHead className="text-center font-semibold">{t("questionsCount")}</TableHead>
                  <TableHead className="text-right font-semibold">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div>
                        <p className="font-medium">{getTitle(quiz)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {locale === "kk" ? quiz.title_ru : quiz.title_kk}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`gap-1.5 ${quiz.type === "text" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}
                      >
                        {quiz.type === "text" ? <FileText className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {quiz.type === "text" ? t("textBased") : t("videoBased")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {quiz.questions_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Link href={`/admin/quizzes/${quiz.id}/results`}>
                            <BarChart3 className="h-4 w-4" />
                            <span className="sr-only">{t("viewResults")}</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">{t("edit")}</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(quiz.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("delete")}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  )
}
