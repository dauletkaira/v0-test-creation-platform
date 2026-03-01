"use client"

import { use } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import QuizEditor from "@/components/admin/quiz-editor"

export default function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <I18nProvider>
      <QuizEditor quizId={id} />
    </I18nProvider>
  )
}
