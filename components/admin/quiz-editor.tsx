"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ArrowLeft, Plus, Trash2, LogOut, GripVertical } from "lucide-react"

type Question = {
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
  correct_option: string
}

const emptyQuestion: Question = {
  question_ru: "",
  question_kk: "",
  option_a_ru: "",
  option_a_kk: "",
  option_b_ru: "",
  option_b_kk: "",
  option_c_ru: "",
  option_c_kk: "",
  option_d_ru: "",
  option_d_kk: "",
  correct_option: "a",
}

type QuizEditorProps = {
  quizId?: string
}

export default function QuizEditor({ quizId }: QuizEditorProps) {
  const { t } = useI18n()
  const router = useRouter()
  const isEditing = !!quizId

  const [quizType, setQuizType] = useState<"text" | "video">("text")
  const [titleRu, setTitleRu] = useState("")
  const [titleKk, setTitleKk] = useState("")
  const [contentRu, setContentRu] = useState("")
  const [contentKk, setContentKk] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ ...emptyQuestion }])
  const [saving, setSaving] = useState(false)
  const [loadingQuiz, setLoadingQuiz] = useState(isEditing)

  useEffect(() => {
    if (!quizId) return

    async function loadQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${quizId}`)
        const data = await res.json()
        setQuizType(data.type)
        setTitleRu(data.title_ru)
        setTitleKk(data.title_kk)
        setContentRu(data.content_ru || "")
        setContentKk(data.content_kk || "")
        setVideoUrl(data.video_url || "")
        if (data.questions && data.questions.length > 0) {
          setQuestions(
            data.questions.map((q: any) => ({
              question_ru: q.question_ru,
              question_kk: q.question_kk,
              option_a_ru: q.option_a_ru,
              option_a_kk: q.option_a_kk,
              option_b_ru: q.option_b_ru,
              option_b_kk: q.option_b_kk,
              option_c_ru: q.option_c_ru,
              option_c_kk: q.option_c_kk,
              option_d_ru: q.option_d_ru,
              option_d_kk: q.option_d_kk,
              correct_option: q.correct_option,
            }))
          )
        }
      } catch {
        // error loading quiz
      } finally {
        setLoadingQuiz(false)
      }
    }

    loadQuiz()
  }, [quizId])

  function addQuestion() {
    setQuestions([...questions, { ...emptyQuestion }])
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, field: keyof Question, value: string) {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      quiz: {
        title_ru: titleRu,
        title_kk: titleKk,
        type: quizType,
        content_ru: quizType === "text" ? contentRu : null,
        content_kk: quizType === "text" ? contentKk : null,
        video_url: quizType === "video" ? videoUrl : null,
      },
      questions,
    }

    try {
      const url = isEditing ? `/api/quizzes/${quizId}` : "/api/quizzes"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push("/admin")
      }
    } catch {
      // error saving
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  if (loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">
              {isEditing ? t("editQuiz") : t("createQuiz")}
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

      <main className="mx-auto max-w-4xl px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? t("editQuiz") : t("createQuiz")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>{t("quizType")}</Label>
                <Select
                  value={quizType}
                  onValueChange={(v) => setQuizType(v as "text" | "video")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">{t("textBased")}</SelectItem>
                    <SelectItem value="video">{t("videoBased")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{t("quizTitleRu")}</Label>
                  <Input
                    value={titleRu}
                    onChange={(e) => setTitleRu(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t("quizTitleKk")}</Label>
                  <Input
                    value={titleKk}
                    onChange={(e) => setTitleKk(e.target.value)}
                    required
                  />
                </div>
              </div>

              {quizType === "text" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>{t("contentRu")}</Label>
                    <Textarea
                      value={contentRu}
                      onChange={(e) => setContentRu(e.target.value)}
                      rows={8}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>{t("contentKk")}</Label>
                    <Textarea
                      value={contentKk}
                      onChange={(e) => setContentKk(e.target.value)}
                      rows={8}
                    />
                  </div>
                </div>
              )}

              {quizType === "video" && (
                <div className="flex flex-col gap-2">
                  <Label>{t("videoUrl")}</Label>
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t("questionsCount")}: {questions.length}
            </h3>
            <Button type="button" variant="outline" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-1" />
              {t("addQuestion")}
            </Button>
          </div>

          {questions.map((question, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      {t("question")} {index + 1}
                    </CardTitle>
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>{t("questionRu")}</Label>
                    <Textarea
                      value={question.question_ru}
                      onChange={(e) =>
                        updateQuestion(index, "question_ru", e.target.value)
                      }
                      rows={2}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>{t("questionKk")}</Label>
                    <Textarea
                      value={question.question_kk}
                      onChange={(e) =>
                        updateQuestion(index, "question_kk", e.target.value)
                      }
                      rows={2}
                      required
                    />
                  </div>
                </div>

                <Separator />

                {(["a", "b", "c", "d"] as const).map((opt) => (
                  <div
                    key={opt}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex flex-col gap-2">
                      <Label>
                        {t(`option${opt.toUpperCase()}` as any)} (рус)
                      </Label>
                      <Input
                        value={
                          question[
                            `option_${opt}_ru` as keyof Question
                          ] as string
                        }
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            `option_${opt}_ru` as keyof Question,
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>
                        {t(`option${opt.toUpperCase()}` as any)} (каз)
                      </Label>
                      <Input
                        value={
                          question[
                            `option_${opt}_kk` as keyof Question
                          ] as string
                        }
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            `option_${opt}_kk` as keyof Question,
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-2">
                  <Label>{t("correctAnswer")}</Label>
                  <Select
                    value={question.correct_option}
                    onValueChange={(v) =>
                      updateQuestion(index, "correct_option", v)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">{t("optionA")}</SelectItem>
                      <SelectItem value="b">{t("optionB")}</SelectItem>
                      <SelectItem value="c">{t("optionC")}</SelectItem>
                      <SelectItem value="d">{t("optionD")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center gap-3 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin">{t("cancel")}</Link>
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("loading") : t("save")}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
