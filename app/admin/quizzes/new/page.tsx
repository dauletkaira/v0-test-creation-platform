"use client"

import { I18nProvider } from "@/lib/i18n/context"
import QuizEditor from "@/components/admin/quiz-editor"

export default function NewQuizPage() {
  return (
    <I18nProvider>
      <QuizEditor />
    </I18nProvider>
  )
}
