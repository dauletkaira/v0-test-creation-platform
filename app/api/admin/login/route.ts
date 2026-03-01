import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (username === "admin" && password === "admin") {
    const response = NextResponse.json({ success: true })
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })
    return response
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  )
}
