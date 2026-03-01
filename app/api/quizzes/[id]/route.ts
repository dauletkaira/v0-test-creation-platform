import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// GET single quiz with questions (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single()

  if (quizError) {
    return NextResponse.json({ error: quizError.message }, { status: 404 })
  }

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", id)
    .order("sort_order", { ascending: true })

  if (questionsError) {
    return NextResponse.json(
      { error: questionsError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ...quiz, questions })
}

// PUT update quiz (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const adminSession = request.cookies.get("admin_session")?.value
  if (adminSession !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { quiz, questions } = body
  const supabase = createAdminClient()

  // Update quiz
  const { error: quizError } = await supabase
    .from("quizzes")
    .update({
      title_ru: quiz.title_ru,
      title_kk: quiz.title_kk,
      type: quiz.type,
      content_ru: quiz.content_ru || null,
      content_kk: quiz.content_kk || null,
      video_url: quiz.video_url || null,
    })
    .eq("id", id)

  if (quizError) {
    return NextResponse.json({ error: quizError.message }, { status: 500 })
  }

  // Delete old questions and insert new ones
  await supabase.from("questions").delete().eq("quiz_id", id)

  if (questions && questions.length > 0) {
    const questionsData = questions.map((q: any, i: number) => ({
      quiz_id: id,
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

  return NextResponse.json({ success: true })
}

// DELETE quiz (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const adminSession = request.cookies.get("admin_session")?.value
  if (adminSession !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("quizzes").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
