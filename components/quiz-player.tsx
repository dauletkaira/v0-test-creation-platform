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
  question_ru: string
  question_kk: string
  option_a_ru: string
  option_a_kk: string
  option_b_ru: string
  option_b_kk: string
  option_c_ru: string
  option_c_kk: string
  option_d_ru: string
  option_d_kk: string
}

type Quiz = {
  id: string
  title_ru: string
  title_kk: string
  type: "text" | "video"
  content_ru: string | null
  content_kk: string | null
  video_url: string | null
  questions: Question[]
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`
  }
  return url
}

export default function QuizPlayer({ quizId }: { quizId: string }) {
  const { locale, t } = useI18n()
  const router = useRouter()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}`)
      const data = await res.json()
      setQuiz(data)
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  useEffect(() => {
    const participant = sessionStorage.getItem("participant")
    if (!participant) {
      router.push("/")
    }
  }, [router])

  async function handleSubmit() {
    if (!quiz) return
    setSubmitting(true)

    const participantStr = sessionStorage.getItem("participant")
    if (!participantStr) {
      router.push("/")
      return
    }
    const participant = JSON.parse(participantStr)

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant,
          quizId: quiz.id,
          answers,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/result?score=${data.score}&total=${data.total}`)
      }
    } catch {
      // error
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    )
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">{t("noQuizzes")}</p>
            <Button asChild>
              <Link href="/">{t("goHome")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const isLastQuestion = currentQuestion === quiz.questions.length - 1
  const quizTitle = locale === "kk" ? quiz.title_kk : quiz.title_ru
  const questionText =
    locale === "kk" ? question.question_kk : question.question_ru

  const options = [
    {
      key: "a",
      text: locale === "kk" ? question.option_a_kk : question.option_a_ru,
    },
    {
      key: "b",
      text: locale === "kk" ? question.option_b_kk : question.option_b_ru,
    },
    {
      key: "c",
      text: locale === "kk" ? question.option_c_kk : question.option_c_ru,
    },
    {
      key: "d",
      text: locale === "kk" ? question.option_d_kk : question.option_d_ru,
    },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-pretty">{quizTitle}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* Content section - Text or Video */}
        {quiz.type === "text" && (quiz.content_ru || quiz.content_kk) && currentQuestion === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">{t("readText")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                {locale === "kk"
                  ? quiz.content_kk || quiz.content_ru
                  : quiz.content_ru || quiz.content_kk}
              </div>
            </CardContent>
          </Card>
        )}

        {quiz.type === "video" && quiz.video_url && currentQuestion === 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">{t("watchVideo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden bg-foreground/5">
                <iframe
                  src={getYouTubeEmbedUrl(quiz.video_url)}
                  title="Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              {t("question")} {currentQuestion + 1} {t("of")}{" "}
              {quiz.questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-pretty">{questionText}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) =>
                setAnswers({ ...answers, [question.id]: value })
              }
              className="flex flex-col gap-3"
            >
              {options.map((option) => (
                <Label
                  key={option.key}
                  htmlFor={`option-${option.key}`}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers[question.id] === option.key
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem
                    value={option.key}
                    id={`option-${option.key}`}
                  />
                  <span className="text-sm leading-relaxed">{option.text}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion(currentQuestion - 1)
              } else {
                router.push("/")
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {currentQuestion > 0 ? t("back") : t("goHome")}
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!answers[question.id] || submitting}
            >
              {submitting ? (
                t("loading")
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {t("finishQuiz")}
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!answers[question.id]}
            >
              {t("nextQuestion")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
