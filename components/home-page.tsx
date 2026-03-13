"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BookOpen, FileText, Video, ArrowRight, Settings, ChevronRight, GraduationCap } from "lucide-react"

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

type Step = "info" | "quizzes"

export default function HomePage() {
  const { locale, t } = useI18n()
  const router = useRouter()

  const [step, setStep] = useState<Step>("info")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [school, setSchool] = useState("")
  const [schools, setSchools] = useState<School[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [loadingQuizzes, setLoadingQuizzes] = useState(false)
  const [error, setError] = useState("")

  const fetchSchools = useCallback(async () => {
    try {
      const res = await fetch("/api/schools")
      const data = await res.json()
      if (Array.isArray(data)) {
        setSchools(data)
        if (data.length === 1) setSchool(data[0].name)
      }
    } catch {
      // ignore
    } finally {
      setLoadingSchools(false)
    }
  }, [])

  const fetchQuizzes = useCallback(async () => {
    setLoadingQuizzes(true)
    try {
      const res = await fetch("/api/quizzes")
      const data = await res.json()
      if (Array.isArray(data)) setQuizzes(data)
    } catch {
      // ignore
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground tracking-tight">{t("siteName")}</span>
              <span className="hidden sm:block text-xs text-muted-foreground leading-none">{t("siteDescription")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/admin/login">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-10">

        {step === "info" && (
          <div className="flex flex-col items-center">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground text-balance mb-2">
                {t("welcome")}
              </h1>
              <p className="text-muted-foreground text-balance leading-relaxed">
                {t("welcomeSubtitle")}
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              <span className="font-medium text-foreground">{t("stepInfo")}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">2</span>
              <span>{t("stepQuizzes")}</span>
            </div>

            {/* Form card */}
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    {t("lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("enterLastName")}
                    className="h-11 rounded-xl border-border bg-background text-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    {t("firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("enterFirstName")}
                    className="h-11 rounded-xl border-border bg-background text-foreground"
                    onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="school" className="text-sm font-medium text-foreground">
                    {t("school")}
                  </Label>
                  {loadingSchools ? (
                    <div className="h-11 rounded-xl border border-border bg-background animate-pulse" />
                  ) : (
                    <select
                      id="school"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>{t("selectSchool")}</option>
                      {schools.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-destructive text-center font-medium">{error}</p>
                )}

                <Button
                  onClick={handleContinue}
                  className="h-11 w-full rounded-xl font-semibold text-base mt-1"
                >
                  {t("continueToQuizzes")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "quizzes" && (
          <div>
            {/* Participant info bar */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3 mb-8 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {lastName} {firstName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{school}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("info")}
                className="text-xs text-muted-foreground hover:text-foreground rounded-lg"
              >
                {t("back")}
              </Button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold">1</span>
              <span>{t("stepInfo")}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              <span className="font-medium text-foreground">{t("stepQuizzes")}</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-6 text-balance">{t("selectQuiz")}</h2>

            {loadingQuizzes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">{t("noQuizzes")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="group text-left bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
                        {quiz.type === "text" ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <Video className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium rounded-lg px-2 py-0.5 shrink-0 bg-secondary text-secondary-foreground"
                      >
                        {quiz.type === "text" ? t("textBased") : t("videoBased")}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground text-pretty leading-snug mb-1">
                      {getTitle(quiz)}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        {quiz.questions_count} {t("questionsCount").toLowerCase()}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        {t("siteDescription")}
      </footer>
    </div>
  )
}
