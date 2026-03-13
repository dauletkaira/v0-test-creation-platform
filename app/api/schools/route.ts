import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// GET all schools (public)
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("schools")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create school (admin only)
export async function POST(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session")?.value
  if (adminSession !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "School name is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("schools")
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
