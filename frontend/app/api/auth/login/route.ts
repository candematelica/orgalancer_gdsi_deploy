import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { remember_me, ...apiBody } = body;

  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiBody),
  });

  const text = await response.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { /* plain text error */ }

  if (!response.ok) {
    return NextResponse.json(
      { error: data.detail || text || "Error al iniciar sesión" },
      { status: response.status }
    );
  }

  const nextResponse = NextResponse.json(data, { status: 200 });

  if (data.token) {
    nextResponse.cookies.set({
      name: "token",
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      ...(remember_me && { maxAge: 60 * 60 * 24 * 30 }),
    });
  }

  return nextResponse;
}
