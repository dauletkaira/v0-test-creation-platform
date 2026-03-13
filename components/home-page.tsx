"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BookOpen, FileText, Video, ArrowRight, Settings, GraduationCap, User } from "lucide-react"

type Quiz = {
  id: string
  title_ru: string
  title_kk: string
  type: "text" | "video"
  questions_count: number
}

export default function HomePage() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [school, setSchool] = useState("")
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch("/api/quizzes")
      const data = await res.json()
      setQuizzes(data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchQuizzes() }, [fetchQuizzes])

  function handleStartQuiz(quizId: string) {
    if (!firstName.trim() || !lastName.trim() || !school.trim()) {
      setError(t("fillAllFields"))
      return
    }
    setError("")
    sessionStorage.setItem("participant", JSON.stringify({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      school: school.trim(),
    }))
    router.push(`/quiz/${quizId}`)
  }

  const getTitle = (quiz: Quiz) => locale === "kk" ? quiz.title_kk : quiz.title_ru
  const isFormFilled = firstName.trim() && lastName.trim() && school.trim()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-header-bg text-header-foreground shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/15 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-none">PIRLS Bilim</h1>
              <p className="text-xs text-white/70 leading-none mt-0.5">{t("siteDescription")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" asChild className="text-header-foreground hover:bg-white/15 hover:text-header-foreground h-8 w-8">
              <Link href="/admin/login">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-header-bg text-header-foreground pb-10 pt-6">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-balance">{t("welcome")}</h2>
          <p className="text-white/75 text-balance max-w-md mx-auto leading-relaxed">{t("welcomeSubtitle")}</p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl w-full px-4 -mt-5 pb-10 flex-1">
        {/* Participant form card */}
        <Card className="shadow-md mb-8 max-w-lg mx-auto">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Данные участника</CardTitle>
                <CardDescription className="text-xs mt-0.5">Заполните перед выбором теста</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setError("") }}
                  placeholder={t("enterLastName")}
                  className="h-9"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setError("") }}
                  placeholder={t("enterFirstName")}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="school" className="text-sm font-medium">{t("school")}</Label>
              <Input
                id="school"
                value={school}
                onChange={(e) => { setSchool(e.target.value); setError("") }}
                placeholder={t("enterSchool")}
                className="h-9"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}
            {isFormFilled && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
                <p className="text-sm text-emerald-700">Выберите тест ниже, чтобы начать</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz grid */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t("selectQuiz")}</h3>
          {quizzes.length > 0 && (
            <span className="text-sm text-muted-foreground">{quizzes.length} {t("quizzes").toLowerCase()}</span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">{t("loading")}</p>
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="p-4 bg-muted rounded-full">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">{t("noQuizzes")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleStartQuiz(quiz.id)}
                className="group text-left"
              >
                <Card className="h-full shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2 rounded-lg shrink-0 ${quiz.type === "text" ? "bg-blue-50" : "bg-purple-50"}`}>
                        {quiz.type === "text"
                          ? <FileText className="h-5 w-5 text-blue-600" />
                          : <Video className="h-5 w-5 text-purple-600" />}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs shrink-0 ${quiz.type === "text" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}
                      >
                        {quiz.type === "text" ? t("textBased") : t("videoBased")}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-snug text-pretty mt-2">
                      {getTitle(quiz)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs">
                        {quiz.questions_count} {t("questionsCount").toLowerCase()}
                      </CardDescription>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
