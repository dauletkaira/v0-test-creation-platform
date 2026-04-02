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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BookOpen, FileText, Video, ArrowRight, Settings, ChevronRight, User } from "lucide-react"

type Quiz = {
  id: string
  title_ru: string
  title_kk: string
  type: "text" | "video"
  questions_count: number
}

type School = {
  id: string
  name: string
}

type Step = "survey" | "quizzes"

export default function HomePage() {
  const { locale, t } = useI18n()
  const router = useRouter()

  const [step, setStep] = useState<Step>("survey")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [school, setSchool] = useState("")
  const [schools, setSchools] = useState<School[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [error, setError] = useState("")

  // Fetch schools for the dropdown
  const fetchSchools = useCallback(async () => {
    try {
      const res = await fetch("/api/schools")
      const data = await res.json()
      setSchools(Array.isArray(data) ? data : [{ id: "default", name: "№6 школа-лицей" }])
    } catch {
      setSchools([{ id: "default", name: "№6 школа-лицей" }])
    } finally {
      setLoadingSchools(false)
    }
  }, [])

  // Fetch quizzes when moving to second step
  const fetchQuizzes = useCallback(async () => {
    setLoadingQuizzes(true)
    try {
      const res = await fetch("/api/quizzes")
      const data = await res.json()
      setQuizzes(Array.isArray(data) ? data : [])
    } catch {
      setQuizzes([])
    } finally {
      setLoadingQuizzes(false)
    }
  }, [])

  useEffect(() => {
    fetchSchools()
  }, [fetchSchools])

  function handleContinue() {
    if (!firstName.trim() || !lastName.trim() || !school) {
      setError(t("fillAllFields"))
      return
    }
    setError("")
    sessionStorage.setItem(
      "participant",
      JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        school,
      })
    )
    fetchQuizzes()
    setStep("quizzes")
  }

  function handleStartQuiz(quizId: string) {
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

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`flex items-center gap-1.5 text-sm font-medium ${step === "survey" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "survey" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              1
            </div>
            <span className="hidden sm:inline">{t("surveyTitle")}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <div className={`flex items-center gap-1.5 text-sm font-medium ${step === "quizzes" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "quizzes" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              2
            </div>
            <span className="hidden sm:inline">{t("selectQuiz")}</span>
          </div>
        </div>

        {/* STEP 1: Survey */}
        {step === "survey" && (
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1 text-balance">{t("surveyTitle")}</h2>
              <p className="text-muted-foreground text-sm text-balance">{t("surveySubtitle")}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName">{t("lastName")}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("enterLastName")}
                      onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName">{t("firstName")}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("enterFirstName")}
                      onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="school">{t("school")}</Label>
                    <Select
                      value={school}
                      onValueChange={setSchool}
                      disabled={loadingSchools}
                    >
                      <SelectTrigger id="school">
                        <SelectValue placeholder={t("selectSchool")} />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((s) => (
                          <SelectItem key={s.id} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}

                  <Button onClick={handleContinue} className="w-full" size="lg">
                    {t("continueToQuizzes")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 2: Quiz list */}
        {step === "quizzes" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{t("selectQuiz")}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {lastName} {firstName} &mdash; {school}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("survey")}
              >
                {t("back")}
              </Button>
            </div>

            {loadingQuizzes ? (
              <p className="text-center text-muted-foreground py-12">{t("loading")}</p>
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
          </div>
        )}
      </main>
    </div>
  )
}
