"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { LanguageSwitcher } from "@/components/language-switcher"
import { BookOpen, ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react"

type Question = {
  id: string
  question_ru: string; question_kk: string
  option_a_ru: string; option_a_kk: string
  option_b_ru: string; option_b_kk: string
  option_c_ru: string; option_c_kk: string
  option_d_ru: string; option_d_kk: string
}

type Quiz = {
  id: string
  title_ru: string; title_kk: string
  type: "text" | "video"
  content_ru: string | null; content_kk: string | null
  video_url: string | null
  questions: Question[]
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)
  return match?.[2]?.length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url
}

export default function QuizPlayer({ quizId }: { quizId: string }) {
  const { locale, t } = useI18n()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [showContent, setShowContent] = useState(true)

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`)
      setQuiz(await res.json())
    } catch { /* ignore */ } finally { setLoading(false) }
  }, [quizId])

  useEffect(() => { fetchQuiz() }, [fetchQuiz])
  useEffect(() => {
    if (!sessionStorage.getItem("participant")) router.push("/")
  }, [router])

  async function handleSubmit() {
    if (!quiz) return
    setSubmitting(true)
    const participantStr = sessionStorage.getItem("participant")
    if (!participantStr) { router.push("/"); return }
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant: JSON.parse(participantStr), quizId: quiz.id, answers }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/result?score=${data.score}&total=${data.total}`)
      }
    } catch { /* ignore */ } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">{t("loading")}</p>
      </div>
    </div>
  )

  if (!quiz?.questions?.length) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-sm shadow-sm">
        <CardContent className="py-10 text-center flex flex-col items-center gap-4">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{t("noQuizzes")}</p>
          <Button asChild><Link href="/">{t("goHome")}</Link></Button>
        </CardContent>
      </Card>
    </div>
  )

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const quizTitle = locale === "kk" ? quiz.title_kk : quiz.title_ru
  const questionText = locale === "kk" ? question.question_kk : question.question_ru
  const hasContent = quiz.type === "text"
    ? !!(quiz.content_ru || quiz.content_kk)
    : !!quiz.video_url

  const options = [
    { key: "a", text: locale === "kk" ? question.option_a_kk : question.option_a_ru },
    { key: "b", text: locale === "kk" ? question.option_b_kk : question.option_b_ru },
    { key: "c", text: locale === "kk" ? question.option_c_kk : question.option_c_ru },
    { key: "d", text: locale === "kk" ? question.option_d_kk : question.option_d_ru },
  ]

  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-header-bg text-header-foreground shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 bg-white/15 rounded-lg shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <h1 className="text-sm font-semibold leading-tight text-pretty truncate">{quizTitle}</h1>
          </div>
          <LanguageSwitcher />
        </div>
        {/* Progress strip */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/80 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl w-full px-4 py-5 flex-1 flex flex-col gap-5">
        {/* Content panel (text/video) — collapsible after first Q */}
        {hasContent && (
          <div>
            {currentQuestion === 0 || showContent ? (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-muted-foreground">
                      {quiz.type === "text" ? t("readText") : t("watchVideo")}
                    </CardTitle>
                    {currentQuestion > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setShowContent(false)} className="text-xs h-7">
                        Скрыть
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {quiz.type === "text" ? (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 max-h-60 overflow-y-auto pr-1">
                      {locale === "kk" ? (quiz.content_kk || quiz.content_ru) : (quiz.content_ru || quiz.content_kk)}
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <iframe
                        src={getYouTubeEmbedUrl(quiz.video_url!)}
                        title="Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <button
                onClick={() => setShowContent(true)}
                className="text-xs text-primary underline underline-offset-2 hover:no-underline"
              >
                {quiz.type === "text" ? "Показать текст" : "Показать видео"}
              </button>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium">{t("question")} {currentQuestion + 1} {t("of")} {quiz.questions.length}</span>
            <span>{answeredCount} / {quiz.questions.length} {t("question").toLowerCase()}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Question card */}
        <Card className="shadow-sm flex-1">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                {currentQuestion + 1}
              </span>
              <CardTitle className="text-base sm:text-lg font-semibold leading-snug text-pretty">
                {questionText}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
              className="flex flex-col gap-2.5"
            >
              {options.map((option) => {
                const isSelected = answers[question.id] === option.key
                return (
                  <Label
                    key={option.key}
                    htmlFor={`option-${option.key}`}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <RadioGroupItem value={option.key} id={`option-${option.key}`} />
                    <span className="text-sm leading-relaxed">{option.text}</span>
                  </Label>
                )
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pb-2">
          <Button
            variant="outline"
            onClick={() => currentQuestion > 0 ? setCurrentQuestion(currentQuestion - 1) : router.push("/")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentQuestion > 0 ? t("back") : t("goHome")}
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!answers[question.id] || submitting}
              className="gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  {t("loading")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {t("finishQuiz")}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[question.id]}
              className="gap-1.5"
            >
              {t("nextQuestion")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
