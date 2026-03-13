"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ArrowLeft, Plus, Trash2, LogOut, GripVertical, FileText, Video, Info } from "lucide-react"

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
  question_ru: "", question_kk: "",
  option_a_ru: "", option_a_kk: "",
  option_b_ru: "", option_b_kk: "",
  option_c_ru: "", option_c_kk: "",
  option_d_ru: "", option_d_kk: "",
  correct_option: "a",
}

type QuizEditorProps = { quizId?: string }

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
        if (data.questions?.length > 0) {
          setQuestions(data.questions.map((q: any) => ({
            question_ru: q.question_ru, question_kk: q.question_kk,
            option_a_ru: q.option_a_ru, option_a_kk: q.option_a_kk,
            option_b_ru: q.option_b_ru, option_b_kk: q.option_b_kk,
            option_c_ru: q.option_c_ru, option_c_kk: q.option_c_kk,
            option_d_ru: q.option_d_ru, option_d_kk: q.option_d_kk,
            correct_option: q.correct_option,
          })))
        }
      } catch { /* ignore */ } finally { setLoadingQuiz(false) }
    }
    loadQuiz()
  }, [quizId])

  function addQuestion() { setQuestions([...questions, { ...emptyQuestion }]) }
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
        title_ru: titleRu, title_kk: titleKk, type: quizType,
        content_ru: quizType === "text" ? contentRu : null,
        content_kk: quizType === "text" ? contentKk : null,
        video_url: quizType === "video" ? videoUrl : null,
      },
      questions,
    }
    try {
      const url = isEditing ? `/api/quizzes/${quizId}` : "/api/quizzes"
      const method = isEditing ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) router.push("/admin")
    } catch { /* ignore */ } finally { setSaving(false) }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  if (loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-header-bg text-header-foreground sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="text-header-foreground hover:bg-white/15 hover:text-header-foreground">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <p className="text-xs text-white/70 leading-none mb-0.5">{t("adminPanel")}</p>
              <h1 className="text-base font-semibold leading-none">
                {isEditing ? t("editQuiz") : t("createQuiz")}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-header-foreground hover:bg-white/15 hover:text-header-foreground gap-1.5">
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Quiz meta */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">{t("quizType")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Type selector */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setQuizType("text")}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    quizType === "text"
                      ? "border-primary bg-accent text-foreground"
                      : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-md ${quizType === "text" ? "bg-primary/10" : "bg-muted"}`}>
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("textBased")}</p>
                    <p className="text-xs text-muted-foreground">Текст + вопросы</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizType("video")}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    quizType === "video"
                      ? "border-primary bg-accent text-foreground"
                      : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className={`p-2 rounded-md ${quizType === "video" ? "bg-primary/10" : "bg-muted"}`}>
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("videoBased")}</p>
                    <p className="text-xs text-muted-foreground">YouTube + вопросы</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Language-separated content */}
          <div className="flex items-center gap-2 px-1">
            <Info className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">{t("langTabHint")}</p>
          </div>

          <Tabs defaultValue="ru" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4 h-11">
              <TabsTrigger value="ru" className="text-sm font-medium gap-2">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-primary/10 text-primary text-[10px] font-bold">RU</span>
                {t("russianSection")}
              </TabsTrigger>
              <TabsTrigger value="kk" className="text-sm font-medium gap-2">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm bg-amber-100 text-amber-700 text-[10px] font-bold">KK</span>
                {t("kazakhSection")}
              </TabsTrigger>
            </TabsList>

            {/* ───────── RUSSIAN TAB ───────── */}
            <TabsContent value="ru" className="flex flex-col gap-5 mt-0">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">RU</Badge>
                    <CardTitle className="text-base">{t("titleRu")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title-ru" className="text-sm font-medium">{t("quizTitleRu")}</Label>
                    <Input
                      id="title-ru"
                      value={titleRu}
                      onChange={(e) => setTitleRu(e.target.value)}
                      placeholder="Введите название теста на русском..."
                      className="h-10"
                      required
                    />
                  </div>

                  {quizType === "text" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="content-ru" className="text-sm font-medium">{t("contentRuLabel")}</Label>
                      <Textarea
                        id="content-ru"
                        value={contentRu}
                        onChange={(e) => setContentRu(e.target.value)}
                        placeholder="Вставьте текст для чтения на русском языке..."
                        rows={9}
                        className="resize-y leading-relaxed"
                      />
                    </div>
                  )}

                  {quizType === "video" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="video-url" className="text-sm font-medium">{t("videoUrl")}</Label>
                      <Input
                        id="video-url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="h-10"
                      />
                      <p className="text-xs text-muted-foreground">Видео является общим для обоих языковых разделов</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Russian Questions */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">RU</Badge>
                  {t("questionsRu")}
                  <span className="text-sm text-muted-foreground font-normal">({questions.length})</span>
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t("addQuestion")}
                </Button>
              </div>

              {questions.map((question, index) => (
                <Card key={`ru-q-${index}`} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm text-muted-foreground">{t("question")} {index + 1}</span>
                      </div>
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">{t("questionRu")}</Label>
                      <Textarea
                        value={question.question_ru}
                        onChange={(e) => updateQuestion(index, "question_ru", e.target.value)}
                        rows={2}
                        required
                        className="resize-none"
                        placeholder="Текст вопроса на русском..."
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["a", "b", "c", "d"] as const).map((opt) => (
                        <div key={opt} className="flex flex-col gap-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t(`option${opt.toUpperCase()}` as any)}
                          </Label>
                          <Input
                            value={question[`option_${opt}_ru` as keyof Question] as string}
                            onChange={(e) => updateQuestion(index, `option_${opt}_ru` as keyof Question, e.target.value)}
                            required
                            placeholder={`Вариант ${opt.toUpperCase()}...`}
                            className="h-9"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium shrink-0">{t("correctAnswer")}:</Label>
                      <Select value={question.correct_option} onValueChange={(v) => updateQuestion(index, "correct_option", v)}>
                        <SelectTrigger className="w-36 h-9">
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
            </TabsContent>

            {/* ───────── KAZAKH TAB ───────── */}
            <TabsContent value="kk" className="flex flex-col gap-5 mt-0">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs border-0">KK</Badge>
                    <CardTitle className="text-base">{t("titleKk")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title-kk" className="text-sm font-medium">{t("quizTitleKk")}</Label>
                    <Input
                      id="title-kk"
                      value={titleKk}
                      onChange={(e) => setTitleKk(e.target.value)}
                      placeholder="Тест атауын қазақша енгізіңіз..."
                      className="h-10"
                      required
                    />
                  </div>

                  {quizType === "text" && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="content-kk" className="text-sm font-medium">{t("contentKkLabel")}</Label>
                      <Textarea
                        id="content-kk"
                        value={contentKk}
                        onChange={(e) => setContentKk(e.target.value)}
                        placeholder="Қазақ тіліндегі оқу мәтінін қойыңыз..."
                        rows={9}
                        className="resize-y leading-relaxed"
                      />
                    </div>
                  )}

                  {quizType === "video" && (
                    <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex items-center gap-2">
                      <Video className="h-4 w-4 shrink-0" />
                      Видео сілтемесі орыс бөлімінде бір рет енгізіледі
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Kazakh Questions */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">KK</Badge>
                  {t("questionsKk")}
                  <span className="text-sm text-muted-foreground font-normal">({questions.length})</span>
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t("addQuestion")}
                </Button>
              </div>

              {questions.map((question, index) => (
                <Card key={`kk-q-${index}`} className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm text-muted-foreground">{t("question")} {index + 1}</span>
                      </div>
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">{t("questionKk")}</Label>
                      <Textarea
                        value={question.question_kk}
                        onChange={(e) => updateQuestion(index, "question_kk", e.target.value)}
                        rows={2}
                        required
                        className="resize-none"
                        placeholder="Сұрақ мәтінін қазақша енгізіңіз..."
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["a", "b", "c", "d"] as const).map((opt) => (
                        <div key={opt} className="flex flex-col gap-1.5">
                          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t(`option${opt.toUpperCase()}` as any)}
                          </Label>
                          <Input
                            value={question[`option_${opt}_kk` as keyof Question] as string}
                            onChange={(e) => updateQuestion(index, `option_${opt}_kk` as keyof Question, e.target.value)}
                            required
                            placeholder={`${opt.toUpperCase()} нұсқасы...`}
                            className="h-9"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium shrink-0">{t("correctAnswer")}:</Label>
                      <Select value={question.correct_option} onValueChange={(v) => updateQuestion(index, "correct_option", v)}>
                        <SelectTrigger className="w-36 h-9">
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
            </TabsContent>
          </Tabs>

          {/* Save bar */}
          <div className="sticky bottom-0 bg-background border-t py-3 flex items-center justify-between gap-3 -mx-4 px-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin">{t("cancel")}</Link>
            </Button>
            <Button type="submit" disabled={saving} className="min-w-28">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  {t("loading")}
                </span>
              ) : t("save")}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
