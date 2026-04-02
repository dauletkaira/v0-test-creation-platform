import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
  DO $do$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='schools' AND policyname='Public can read schools') THEN
      CREATE POLICY "Public can read schools" ON schools FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='schools' AND policyname='Authenticated can manage schools') THEN
      CREATE POLICY "Authenticated can manage schools" ON schools FOR ALL USING (true);
    END IF;
  END $do$;
  INSERT INTO schools (name) VALUES ('\u21166 \u0448\u043a\u043e\u043b\u0430-\u043b\u0438\u0446\u0435\u0439') ON CONFLICT (name) DO NOTHING;
`

async function ensureSchoolsTable() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  // Use Supabase Management-style SQL execution via the pg_meta endpoint
  try {
    await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ query: CREATE_TABLE_SQL }),
    })
  } catch {
    // ignore — table may already exist
  }
}

// GET all schools (public)
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("schools")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    if (error.code === "42P01") {
      // Table doesn't exist yet — try to create it and return fallback
      await ensureSchoolsTable()
    }
    // Return hardcoded fallback so the UI always has at least one school
    return NextResponse.json([{ id: "default", name: "№6 школа-лицей" }])
  }

  // Seed default school if table is empty
  if (data && data.length === 0) {
    await supabase.from("schools").insert({ name: "№6 школа-лицей" }).select()
    const { data: seeded } = await supabase
      .from("schools")
      .select("id, name")
      .order("name", { ascending: true })
    return NextResponse.json(seeded ?? [{ id: "default", name: "№6 школа-лицей" }])
  }

  return NextResponse.json(data ?? [])
}

// POST create school (admin only)
export async function POST(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session")?.value
  if (adminSession !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("schools")
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "duplicate" }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
