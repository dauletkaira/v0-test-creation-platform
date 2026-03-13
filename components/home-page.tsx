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
import { BookOpen, FileText, Video, ArrowRight, Settings, ChevronRight, Sparkles, User } from "lucide-react"

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

  const getTitle = (quiz: Quiz) => {
    const title = locale === "kk" ? quiz.title_kk : quiz.title_ru
    if (title) return title
    return locale === "kk" ? quiz.title_ru : quiz.title_kk
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary shadow-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-base font-bold text-foreground tracking-tight">{t("siteName")}</span>
              <span className="hidden sm:block text-xs text-muted-foreground">{t("siteDescription")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" asChild className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary">
              <Link href="/admin/login">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">

        {step === "info" && (
          <div className="flex flex-col items-center">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 mb-6 shadow-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">{t("siteDescription")}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground text-balance mb-4 leading-tight">
                {t("welcome")}
              </h1>
              <p className="text-lg text-muted-foreground text-balance max-w-lg mx-auto leading-relaxed">
                {t("welcomeSubtitle")}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-md">
                <span className="text-sm font-bold">1</span>
                <span className="text-sm font-semibold">{t("stepInfo")}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2 bg-muted text-muted-foreground rounded-full px-4 py-2">
                <span className="text-sm font-bold">2</span>
                <span className="text-sm font-medium">{t("stepQuizzes")}</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-md">
              <div className="bg-card border border-border rounded-3xl shadow-xl p-8 md:p-10">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-foreground">
                      {t("lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("enterLastName")}
                      className="h-12 rounded-2xl border-border bg-input text-foreground text-base placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-foreground">
                      {t("firstName")}
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("enterFirstName")}
                      className="h-12 rounded-2xl border-border bg-input text-foreground text-base placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                      onKeyDown={(e) => e.key === "Enter" && handleContinue()}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="school" className="text-sm font-semibold text-foreground">
                      {t("school")}
                    </Label>
                    {loadingSchools ? (
                      <div className="h-12 rounded-2xl border border-border bg-input animate-pulse" />
                    ) : (
                      <select
                        id="school"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-border bg-input px-4 py-3 text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-muted-foreground">{t("selectSchool")}</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                      <p className="text-sm text-destructive text-center font-medium">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="h-14 w-full rounded-2xl font-bold text-lg mt-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    {t("continueToQuizzes")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "quizzes" && (
          <div>
            {/* User Info Card */}
            <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4 mb-10 shadow-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground">
                    {lastName} {firstName}
                  </p>
                  <p className="text-sm text-muted-foreground">{school}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("info")}
                className="rounded-xl text-sm font-medium"
              >
                {t("back")}
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-muted text-muted-foreground rounded-full px-4 py-2">
                <span className="text-sm font-bold">1</span>
                <span className="text-sm font-medium">{t("stepInfo")}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-md">
                <span className="text-sm font-bold">2</span>
                <span className="text-sm font-semibold">{t("stepQuizzes")}</span>
              </div>
            </div>

            <h2 className="text-3xl font-extrabold text-foreground mb-8">{t("selectQuiz")}</h2>

            {loadingQuizzes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground font-medium">{t("noQuizzes")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="group text-left bg-card border border-border rounded-3xl p-6 shadow-md hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary shrink-0">
                        {quiz.type === "text" ? (
                          <FileText className="h-7 w-7 text-foreground" />
                        ) : (
                          <Video className="h-7 w-7 text-foreground" />
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-semibold rounded-full px-3 py-1 shrink-0"
                      >
                        {quiz.type === "text" ? t("textBased") : t("videoBased")}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-foreground text-pretty leading-snug mb-2">
                      {getTitle(quiz)}
                    </h3>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-sm text-muted-foreground font-medium">
                        {quiz.questions_count} {t("questionsCount").toLowerCase()}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                        {t("start")}
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-6 text-center">
        <p className="text-sm text-muted-foreground">{t("siteDescription")}</p>
      </footer>
    </div>
  )
}
