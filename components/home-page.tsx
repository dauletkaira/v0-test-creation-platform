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
import { BookOpen, FileText, Video, ArrowRight, Settings } from "lucide-react"

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
    } catch {
      // error fetching
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  function handleStartQuiz(quizId: string) {
    if (!firstName.trim() || !lastName.trim() || !school.trim()) {
      setError(t("fillAllFields"))
      return
    }
    setError("")

    // Store participant info in sessionStorage
    sessionStorage.setItem(
      "participant",
      JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        school: school.trim(),
      })
    )

    router.push(`/quiz/${quizId}`)
  }

  const getTitle = (quiz: Quiz) =>
    locale === "kk" ? quiz.title_kk : quiz.title_ru

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">{t("siteName")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/login">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Welcome & Form */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-balance">{t("welcome")}</h2>
          <p className="text-muted-foreground text-balance">{t("welcomeSubtitle")}</p>
        </div>

        <Card className="mb-8 max-w-lg mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("enterLastName")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("enterFirstName")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="school">{t("school")}</Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder={t("enterSchool")}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quiz List */}
        <h3 className="text-xl font-semibold mb-4">{t("selectQuiz")}</h3>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">{t("loading")}</p>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t("noQuizzes")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleStartQuiz(quiz.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-pretty">
                      {getTitle(quiz)}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 gap-1 ml-2">
                      {quiz.type === "text" ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        <Video className="h-3 w-3" />
                      )}
                      {quiz.type === "text" ? t("textBased") : t("videoBased")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <CardDescription>
                      {quiz.questions_count} {t("questionsCount").toLowerCase()}
                    </CardDescription>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
