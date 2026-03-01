"use client"

import { use } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import QuizResults from "@/components/admin/quiz-results"

export default function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <I18nProvider>
      <QuizResults quizId={id} />
    </I18nProvider>
  )
}
