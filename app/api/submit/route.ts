import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST submit quiz answers
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { participant, quizId, answers } = body

  const supabase = await createClient()

  // Create participant
  const { data: participantData, error: participantError } = await supabase
    .from("participants")
    .insert({
      first_name: participant.firstName,
      last_name: participant.lastName,
      school: participant.school,
    })
    .select()
    .single()

  if (participantError) {
    return NextResponse.json(
      { error: participantError.message },
      { status: 500 }
    )
  }

  // Get questions to calculate score
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("id, correct_option")
    .eq("quiz_id", quizId)

  if (questionsError) {
    return NextResponse.json(
      { error: questionsError.message },
      { status: 500 }
    )
  }

  // Calculate score
  let score = 0
  const total = questions.length
  for (const question of questions) {
    if (answers[question.id] === question.correct_option) {
      score++
    }
  }

  // Save result
  const { data: result, error: resultError } = await supabase
    .from("results")
    .insert({
      participant_id: participantData.id,
      quiz_id: quizId,
      score,
      total,
      answers,
    })
    .select()
    .single()

  if (resultError) {
    return NextResponse.json({ error: resultError.message }, { status: 500 })
  }

  return NextResponse.json({ ...result, score, total })
}
