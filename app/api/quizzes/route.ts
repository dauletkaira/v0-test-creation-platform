import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// GET all quizzes (public)
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, questions(id)")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const quizzesWithCount = data.map((q: any) => ({
    ...q,
    questions_count: q.questions?.length || 0,
    questions: undefined,
  }))

  return NextResponse.json(quizzesWithCount)
}

// POST create quiz (admin only)
export async function POST(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session")?.value
  if (adminSession !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { quiz, questions } = body

  const supabase = createAdminClient()

  // Insert quiz
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      title_ru: quiz.title_ru,
      title_kk: quiz.title_kk,
      type: quiz.type,
      content_ru: quiz.content_ru || null,
      content_kk: quiz.content_kk || null,
      video_url: quiz.video_url || null,
    })
    .select()
    .single()

  if (quizError) {
    return NextResponse.json({ error: quizError.message }, { status: 500 })
  }

  // Insert questions
  if (questions && questions.length > 0) {
    const questionsData = questions.map((q: any, i: number) => ({
      quiz_id: quizData.id,
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
      sort_order: i,
    }))

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsData)

    if (questionsError) {
      return NextResponse.json(
        { error: questionsError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(quizData)
}
