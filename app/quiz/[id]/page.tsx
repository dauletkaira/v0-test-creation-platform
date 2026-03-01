"use client"

import { use } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import QuizPlayer from "@/components/quiz-player"

export default function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <I18nProvider>
      <QuizPlayer quizId={id} />
    </I18nProvider>
  )
}
